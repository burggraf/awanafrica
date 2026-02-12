import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Building2, Search, X } from "lucide-react";
import { pb } from "@/lib/pb";
import { useLayout } from "@/lib/layout-context";
import { useAdmin } from "@/lib/admin-context";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Country {
  id: string;
  name: string;
}

interface Region {
  id: string;
  name: string;
  country: string;
  expand?: {
    country: Country;
  }
}

interface Club {
  id: string;
  name: string;
  charter: number;
  type: "church" | "school" | "other";
  region: string;
  address: string;
  timezone: string;
  active: boolean;
  expand?: {
    region: Region;
  };
}

export function ClubManagement() {
  const { t } = useTranslation();
  const { setHeaderTitle } = useLayout();
  const { toast } = useToast();
  const { isGlobalAdmin, adminRoles, isLoading: isAdminLoading } = useAdmin();
  
  const [clubs, setClubs] = useState<Club[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState<{
    name: string;
    charter: string;
    type: "church" | "school" | "other";
    country: string;
    region: string;
    address: string;
    timezone: string;
    active: boolean;
  }>({
    name: "",
    charter: "",
    type: "church",
    country: "",
    region: "",
    address: "",
    timezone: "UTC",
    active: true,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get regions the user can manage clubs for
      const managedRegionIds = adminRoles
        .filter(r => r.role === 'Region')
        .map(r => r.region)
        .filter(Boolean) as string[];

      const managedCountryIds = adminRoles
        .filter(r => r.role === 'Country')
        .map(r => r.country)
        .filter(Boolean) as string[];

      // Base filter from roles
      let roleFilter = "";
      if (!isGlobalAdmin) {
        const conditions = [];
        if (managedRegionIds.length > 0) {
          conditions.push(managedRegionIds.map(id => `region = "${id}"`).join(" || "));
        }
        if (managedCountryIds.length > 0) {
          conditions.push(managedCountryIds.map(id => `region.country = "${id}"`).join(" || "));
        }
        
        if (conditions.length > 0) {
          roleFilter = conditions.map(c => `(${c})`).join(" || ");
        } else {
          roleFilter = "id = 'none'";
        }
      }

      // Combine with search query
      let clubFilter = roleFilter;
      if (searchQuery.trim()) {
        const s = searchQuery.trim().replace(/"/g, '\\"');
        const searchPart = `(name ~ "${s}" || charter ~ "${s}")`;
        clubFilter = clubFilter ? `(${clubFilter}) && ${searchPart}` : searchPart;
      }

      // Filter regions for the dropdown
      let regionFilter = undefined;
      if (!isGlobalAdmin) {
        const conditions = [];
        if (managedRegionIds.length > 0) {
          conditions.push(managedRegionIds.map(id => `id = "${id}"`).join(" || "));
        }
        if (managedCountryIds.length > 0) {
          conditions.push(managedCountryIds.map(id => `country = "${id}"`).join(" || "));
        }
        
        if (conditions.length > 0) {
          regionFilter = conditions.map(c => `(${c})`).join(" || ");
        } else {
          regionFilter = "id = 'none'";
        }
      }

      const [clubRecords, regionRecords, countryRecords] = await Promise.all([
        pb.collection("clubs").getFullList<Club>({
          sort: "name",
          expand: "region.country",
          filter: clubFilter,
          requestKey: "club_management_list",
        }),
        pb.collection("regions").getFullList<Region>({
          sort: "name",
          expand: "country",
          filter: regionFilter,
          requestKey: "region_dropdown_list",
        }),
        pb.collection("countries").getFullList<Country>({
          sort: "name",
          requestKey: "country_dropdown_list",
        }),
      ]);
      
      setClubs(clubRecords);
      setRegions(regionRecords);

      // Filter countries based on what regions/countries the user has access to
      if (isGlobalAdmin) {
        setCountries(countryRecords);
      } else {
        const accessibleCountryIds = new Set(managedCountryIds);
        // Also add countries from managed regions
        regionRecords.forEach(r => {
          if (r.country) accessibleCountryIds.add(r.country);
        });
        setCountries(countryRecords.filter(c => accessibleCountryIds.has(c.id)));
      }
    } catch (error: any) {
      if (error.isAbort) return;
      console.error("Error fetching data:", error);
      toast({
        title: t("Error"),
        description: t("Failed to fetch clubs or regions"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [adminRoles, isGlobalAdmin, searchQuery, t, toast]);

  useEffect(() => {
    setHeaderTitle(t("Club Management"));
    if (!isAdminLoading) {
      fetchData();
    }
  }, [setHeaderTitle, t, isAdminLoading, fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.region) {
      toast({
        title: t("Error"),
        description: t("Please select a region"),
        variant: "destructive",
      });
      return;
    }

    try {
      const { country, ...submitData } = formData;
      if (editingClub) {
        await pb.collection("clubs").update(editingClub.id, submitData);
        toast({ title: t("Success"), description: t("Club updated successfully") });
      } else {
        await pb.collection("clubs").create(submitData);
        toast({ title: t("Success"), description: t("Club created successfully") });
      }
      setIsDialogOpen(false);
      setEditingClub(null);
      setFormData({
        name: "",
        charter: "",
        type: "church",
        country: "",
        region: "",
        address: "",
        timezone: "UTC",
        active: true,
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to save club"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!editingClub) return;
    
    try {
      // Check for related data as per user request
      // We need to check memberships, programs, years, students, events
      const checks = [
        pb.collection("club_memberships").getList(1, 1, { filter: `club = "${editingClub.id}"` }),
        pb.collection("programs").getList(1, 1, { filter: `club = "${editingClub.id}"` }),
        pb.collection("club_years").getList(1, 1, { filter: `club = "${editingClub.id}"` }),
        pb.collection("students").getList(1, 1, { filter: `club = "${editingClub.id}"` }),
        pb.collection("events").getList(1, 1, { filter: `club = "${editingClub.id}"` }),
      ];

      const results = await Promise.all(checks);
      const hasRelatedData = results.some(res => res.totalItems > 0);

      if (hasRelatedData) {
        toast({
          title: t("Cannot Delete"),
          description: t("This club has related data (members, programs, etc.) and cannot be deleted. Consider marking it as inactive instead."),
          variant: "destructive",
        });
        return;
      }

      setIsAlertOpen(true);
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to check constraints"),
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!editingClub) return;
    try {
      await pb.collection("clubs").delete(editingClub.id);
      toast({ title: t("Success"), description: t("Club deleted successfully") });
      setIsDialogOpen(false);
      setIsAlertOpen(false);
      setEditingClub(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to delete club"),
        variant: "destructive",
      });
    }
  };

  const openDialog = (club?: Club) => {
    if (club) {
      setEditingClub(club);
      setFormData({
        name: club.name,
        charter: club.charter?.toString() || "",
        type: club.type,
        country: club.expand?.region?.country || "",
        region: club.region,
        address: club.address || "",
        timezone: club.timezone || "UTC",
        active: club.active,
      });
    } else {
      setEditingClub(null);
      setFormData({
        name: "",
        charter: "",
        type: "church",
        country: "",
        region: "",
        address: "",
        timezone: "UTC",
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const filteredRegions = regions.filter(r => !formData.country || r.country === formData.country);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold whitespace-nowrap">{t("Clubs")}</h2>
        </div>
        <div className="flex flex-1 items-center gap-2 justify-end min-w-0">
          <div className="relative w-full max-w-[180px] sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("Search...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-9 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                type="button"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">{t("Clear search")}</span>
              </button>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => openDialog()} size="icon" className="h-9 w-9 shrink-0">
                <Plus className="h-4 w-4" />
                <span className="sr-only">{t("Add")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{t("Add New")}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Charter")}</TableHead>
              <TableHead>{t("Name")}</TableHead>
              <TableHead>{t("Type")}</TableHead>
              <TableHead>{t("Region/Country")}</TableHead>
              <TableHead>{t("Status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {t("Loading...")}
                </TableCell>
              </TableRow>
            ) : clubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {t("No clubs found")}
                </TableCell>
              </TableRow>
            ) : (
              clubs.map((club) => (
                <TableRow 
                  key={club.id} 
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${!club.active ? "opacity-60" : ""}`}
                  onClick={() => openDialog(club)}
                >
                  <TableCell className="font-mono text-xs">
                    {club.charter || "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {club.name}
                    {!club.active && (
                      <Badge variant="secondary" className="ml-2 text-[10px] h-4">
                        {t("Inactive")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{t(club.type)}</TableCell>
                  <TableCell>
                    {club.expand?.region?.name} 
                    <span className="text-muted-foreground text-xs ml-1">
                      ({club.expand?.region?.expand?.country?.name})
                    </span>
                  </TableCell>
                  <TableCell>
                    {club.active ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">{t("Active")}</span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{t("Inactive")}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClub ? t("Edit Club") : t("Add Club")}</DialogTitle>
            <DialogDescription>
              {editingClub ? t("Update the details for this club.") : t("Create a new club by filling out the information below.")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-1">
                <Label htmlFor="charter">{t("Charter #")}</Label>
                <Input
                  id="charter"
                  type="number"
                  value={formData.charter}
                  onChange={(e) => setFormData({ ...formData, charter: e.target.value })}
                  placeholder="0000"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">{t("Club Name")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">{t("Type")}</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="church">{t("Church")}</SelectItem>
                  <SelectItem value="school">{t("School")}</SelectItem>
                  <SelectItem value="other">{t("Other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">{t("Country")}</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => {
                    setFormData({ ...formData, country: value, region: "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select Country")} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region">{t("Region")}</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData({ ...formData, region: value })}
                  disabled={!formData.country}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select Region")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRegions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t("Address")}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between border p-3 rounded-md bg-slate-50 dark:bg-slate-900/50">
              <div className="space-y-0.5">
                <Label className="text-base">{t("Active Status")}</Label>
                <div className="text-sm text-muted-foreground">
                  {formData.active ? t("Club is active") : t("Club is inactive")}
                </div>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, active: checked })}
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-slate-400"
              />
            </div>

            <DialogFooter className="pt-4 flex-col sm:flex-row gap-2">
              {editingClub && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="sm:mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("Delete")}
                </Button>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t("Cancel")}
                </Button>
                <Button type="submit">{t("Save")}</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        onConfirm={confirmDelete}
        confirmText={t("Delete")}
      />
    </div>
  );
}
