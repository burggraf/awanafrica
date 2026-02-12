import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Map } from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
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
  };
}

export function RegionManagement() {
  const { t } = useTranslation();
  const { setHeaderTitle } = useLayout();
  const { toast } = useToast();
  const { isGlobalAdmin, adminRoles } = useAdmin();
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [formData, setFormData] = useState({ name: "", country: "" });

  // Get countries the user can manage regions for
  const managedCountryIds = adminRoles
    .filter(r => r.role === 'Country')
    .map(r => r.country)
    .filter(Boolean) as string[];

  useEffect(() => {
    setHeaderTitle(t("Region Management"));
    fetchData();
  }, [setHeaderTitle, t]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Filter regions based on roles if not global admin
      let regionFilter = undefined;
      if (!isGlobalAdmin) {
        if (managedCountryIds.length > 0) {
          regionFilter = managedCountryIds.map(id => `country = "${id}"`).join(" || ");
        } else {
          // If they are a country admin but have no countries assigned, they see nothing
          regionFilter = "id = 'none'";
        }
      }

      const [regionRecords, countryRecords] = await Promise.all([
        pb.collection("regions").getFullList<Region>({
          sort: "name",
          expand: "country",
          filter: regionFilter,
          requestKey: "region_management_list",
        }),
        pb.collection("countries").getFullList<Country>({
          sort: "name",
          requestKey: "country_dropdown_list",
        }),
      ]);
      setRegions(regionRecords);
      
      // For country admins, only show their managed countries in the dropdown
      if (isGlobalAdmin) {
        setCountries(countryRecords);
      } else {
        setCountries(countryRecords.filter(c => managedCountryIds.includes(c.id)));
      }
    } catch (error: any) {
      if (error.isAbort) return;
      console.error("Error fetching data:", error);
      toast({
        title: t("Error"),
        description: t("Failed to fetch regions or countries"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.country) {
      toast({
        title: t("Error"),
        description: t("Please select a country"),
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingRegion) {
        await pb.collection("regions").update(editingRegion.id, formData);
        toast({ title: t("Success"), description: t("Region updated successfully") });
      } else {
        await pb.collection("regions").create(formData);
        toast({ title: t("Success"), description: t("Region created successfully") });
      }
      setIsDialogOpen(false);
      setEditingRegion(null);
      setFormData({ name: "", country: "" });
      fetchData();
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to save region"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (regionId: string) => {
    try {
      // Check for clubs
      const clubs = await pb.collection("clubs").getList(1, 1, {
        filter: `region = "${regionId}"`,
      });

      if (clubs.totalItems > 0) {
        toast({
          title: t("Cannot Delete"),
          description: t("This region has clubs and cannot be deleted."),
          variant: "destructive",
        });
        return;
      }

      if (confirm(t("Are you sure you want to delete this region?"))) {
        await pb.collection("regions").delete(regionId);
        toast({ title: t("Success"), description: t("Region deleted successfully") });
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to delete region"),
        variant: "destructive",
      });
    }
  };

  const openDialog = (region?: Region) => {
    if (region) {
      setEditingRegion(region);
      setFormData({ name: region.name, country: region.country });
    } else {
      setEditingRegion(null);
      setFormData({ name: "", country: "" });
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          {t("Regions")}
        </h2>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          {t("Add Region")}
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Name")}</TableHead>
              <TableHead>{t("Country")}</TableHead>
              <TableHead className="w-[100px]">{t("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  {t("Loading...")}
                </TableCell>
              </TableRow>
            ) : regions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  {t("No regions found")}
                </TableCell>
              </TableRow>
            ) : (
              regions.map((region) => (
                <TableRow key={region.id}>
                  <TableCell className="font-medium">{region.name}</TableCell>
                  <TableCell>{region.expand?.country?.name || t("Unknown")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(region)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(region.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRegion ? t("Edit Region") : t("Add Region")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("Region Name")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Nairobi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">{t("Country")}</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select a country")} />
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button type="submit">{t("Save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
