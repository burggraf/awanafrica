import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload, FileType, Loader2 } from "lucide-react";
import { pb } from "@/lib/pb";
import { 
  type CountriesResponse, 
  type RegionsResponse, 
  type UsersResponse,
} from "@/types/pocketbase-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface ImportClubsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

const EXPECTED_FIELDS = [
  "Registration #", "Salesforce #", "Name", "Type", "Venue", "Denomination", 
  "Location", "Missionary", "Created Date", "Expiration Date", "Puggles", 
  "Cubbies", "Sparks", "Flame", "Torch", "Truth Seekers", "Living God's Story", 
  "T&T", "Jr. Varsity", "Trek", "Journey", "Descubrelo", 
  "Building Healthy Families", "Total", "Leaders"
];

const METADATA_START_FIELD = "Puggles";

export function ImportClubsModal({ isOpen, onOpenChange, onImportComplete }: ImportClubsModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [missionaryId, setMissionaryId] = useState<string>("none");
  const [missionaries, setMissionaries] = useState<UsersResponse[]>([]);

  // Fetch missionaries when modal opens
  React.useEffect(() => {
    if (isOpen) {
      pb.collection("users").getFullList<UsersResponse>({
        filter: 'admin_roles_via_user.role ?= "Missionary"',
        sort: "name,email",
      }).then(setMissionaries).catch(console.error);
    } else {
      setFile(null);
      setProgress(0);
      setIsImporting(false);
      setMissionaryId("none");
    }
  }, [isOpen]);

  const parseCSV = (text: string): string[][] => {
    const lines = [];
    let currentLine: string[] = [];
    let currentField = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentLine.push(currentField.trim());
        currentField = "";
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (currentField || currentLine.length > 0) {
          currentLine.push(currentField.trim());
          lines.push(currentLine);
          currentLine = [];
          currentField = "";
        }
        if (char === '\r' && nextChar === '\n') i++;
      } else {
        currentField += char;
      }
    }
    if (currentField || currentLine.length > 0) {
      currentLine.push(currentField.trim());
      lines.push(currentLine);
    }
    return lines;
  };

  const parseExpirationDate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    // Expected format "Jan 2027"
    const parts = dateStr.split(" ");
    if (parts.length !== 2) return null;
    
    const months: Record<string, string> = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    };
    
    const month = months[parts[0]];
    const year = parts[1];
    
    if (!month || !year || isNaN(Number(year))) return null;
    
    return `${year}-${month}-01 00:00:00`;
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setProgress(0);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length < 2) {
        throw new Error(t("CSV file is empty or missing data"));
      }

      const headers = rows[0];
      // Validate headers
      if (headers.length !== EXPECTED_FIELDS.length || !EXPECTED_FIELDS.every((f, i) => f === headers[i])) {
        throw new Error(t("CSV fields do not match expected format. Please ensure all columns are present and correctly named."));
      }

      const dataRows = rows.slice(1);
      const totalRows = dataRows.length;
      
      // Cache for countries and regions
      const countriesCache: Record<string, CountriesResponse> = {};
      const regionsCache: Record<string, RegionsResponse> = {};

      // Get existing clubs to check for duplicates by registration
      const existingClubs = await pb.collection("clubs").getFullList({
        fields: "registration",
      });
      const existingRegs = new Set(existingClubs.map(c => c.registration.toString()));

      let importedCount = 0;
      let skippedCount = 0;
      
      // Batch processing
      const batchSize = 100;
      for (let i = 0; i < dataRows.length; i += batchSize) {
        const batch = dataRows.slice(i, i + batchSize);
        const batchRequests = [];

        for (const row of batch) {
          const rowData: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index];
          });

          const registration = rowData["Registration #"];
          if (!registration || existingRegs.has(registration)) {
            skippedCount++;
            continue;
          }

          // 1. Resolve Country
          const countryIso = registration.substring(0, 2).toUpperCase();
          if (!countriesCache[countryIso]) {
            try {
              const country = await pb.collection("countries").getFirstListItem<CountriesResponse>(`isoCode = "${countryIso}"`);
              countriesCache[countryIso] = country;
            } catch (err) {
              throw new Error(t("Country with ISO code {{code}} not found in database. Aborting.", { code: countryIso }));
            }
          }
          const country = countriesCache[countryIso];

          // 2. Resolve Region
          const locationName = rowData["Location"];
          const regionKey = `${country.id}:${locationName}`;
          if (!regionsCache[regionKey]) {
            try {
              const region = await pb.collection("regions").getFirstListItem<RegionsResponse>(`country = "${country.id}" && name = "${locationName}"`);
              regionsCache[regionKey] = region;
            } catch (err) {
              // Create region if not found
              const newRegion = await pb.collection("regions").create<RegionsResponse>({
                name: locationName,
                country: country.id,
              });
              regionsCache[regionKey] = newRegion;
            }
          }
          const region = regionsCache[regionKey];

          // 3. Map Fields
          const metadata: Record<string, any> = {};
          let inMetadata = false;
          for (const header of headers) {
            if (header === METADATA_START_FIELD) inMetadata = true;
            if (inMetadata) {
              metadata[header] = parseInt(rowData[header]) || 0;
            }
          }

          const clubData: any = {
            name: rowData["Name"],
            registration: registration,
            salesforce: rowData["Salesforce #"],
            venue: rowData["Venue"] || "Other",
            type: rowData["Type"] === "Leader based" ? "Leader Based" : "Other",
            denomination: rowData["Denomination"],
            location: rowData["Location"],
            missionary: missionaryId !== "none" ? missionaryId : null,
            expiration: parseExpirationDate(rowData["Expiration Date"]),
            region: region.id,
            active: true,
            metadata: metadata,
          };

          batchRequests.push(
            pb.collection("clubs").create(clubData, { requestKey: null })
              .catch(err => {
                console.error("Failed to create club:", clubData.name, err.data);
                throw err;
              })
          );
          existingRegs.add(registration); // Prevent duplicates within the same import
        }

        if (batchRequests.length > 0) {
          await Promise.all(batchRequests);
          importedCount += batchRequests.length;
        }

        setProgress(Math.round(((i + batch.length) / totalRows) * 100));
      }

      toast({
        title: t("Import Complete"),
        description: t("Successfully imported {{imported}} clubs. {{skipped}} clubs were skipped as duplicates.", { 
          imported: importedCount, 
          skipped: skippedCount 
        }),
      });

      onImportComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: t("Import Failed"),
        description: error.message || t("An unexpected error occurred during import"),
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("Import Clubs")}</DialogTitle>
          <DialogDescription>
            {t("Upload a .csv file to import clubs. The file must match the required template format.")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="missionary-select">{t("Assign Missionary (Optional)")}</Label>
            <Select value={missionaryId} onValueChange={setMissionaryId} disabled={isImporting}>
              <SelectTrigger id="missionary-select">
                <SelectValue placeholder={t("Select a missionary")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("Don't assign a missionary")}</SelectItem>
                {missionaries.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name || m.displayName || m.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              {t("This missionary will be assigned to all clubs in the imported file.")}
            </p>
          </div>

          <div className="space-y-4">
            <Label>{t("CSV File")}</Label>
            {!file ? (
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById("csv-upload")?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">{t("Click to upload or drag and drop")}</p>
                <p className="text-xs text-muted-foreground mt-1">.csv files only</p>
                <input 
                  id="csv-upload" 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <FileType className="h-8 w-8 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                {!isImporting && (
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                    {t("Remove")}
                  </Button>
                )}
              </div>
            )}
          </div>

          {isImporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>{t("Importing...")}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            {t("Cancel")}
          </Button>
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("Importing...")}
              </>
            ) : (
              t("Start Import")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
