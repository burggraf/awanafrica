import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Globe } from "lucide-react";
import { pb } from "@/lib/pb";
import { useLayout } from "@/lib/layout-context";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Country {
  id: string;
  name: string;
  isoCode: string;
}

export function CountryManagement() {
  const { t } = useTranslation();
  const { setHeaderTitle } = useLayout();
  const { toast } = useToast();
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState({ name: "", isoCode: "" });

  useEffect(() => {
    setHeaderTitle(t("Country Management"));
    fetchCountries();
  }, [setHeaderTitle, t]);

  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection("countries").getFullList<Country>({
        sort: "name",
        requestKey: "country_management_list",
      });
      setCountries(records);
    } catch (error: any) {
      if (error.isAbort) return;
      console.error("Error fetching countries:", error);
      toast({
        title: t("Error"),
        description: t("Failed to fetch countries"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCountry) {
        await pb.collection("countries").update(editingCountry.id, formData);
        toast({ title: t("Success"), description: t("Country updated successfully") });
      } else {
        await pb.collection("countries").create(formData);
        toast({ title: t("Success"), description: t("Country created successfully") });
      }
      setIsDialogOpen(false);
      setEditingCountry(null);
      setFormData({ name: "", isoCode: "" });
      fetchCountries();
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to save country"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!editingCountry) return;
    
    try {
      // Check for regions
      const regions = await pb.collection("regions").getList(1, 1, {
        filter: `country = "${editingCountry.id}"`,
      });

      if (regions.totalItems > 0) {
        toast({
          title: t("Cannot Delete"),
          description: t("This country has regions and cannot be deleted."),
          variant: "destructive",
        });
        return;
      }

      if (confirm(t("Are you sure you want to delete this country?"))) {
        await pb.collection("countries").delete(editingCountry.id);
        toast({ title: t("Success"), description: t("Country deleted successfully") });
        setIsDialogOpen(false);
        setEditingCountry(null);
        fetchCountries();
      }
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to delete country"),
        variant: "destructive",
      });
    }
  };

  const openDialog = (country?: Country) => {
    if (country) {
      setEditingCountry(country);
      setFormData({ name: country.name, isoCode: country.isoCode });
    } else {
      setEditingCountry(null);
      setFormData({ name: "", isoCode: "" });
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          {t("Countries")}
        </h2>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          {t("Add Country")}
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Name")}</TableHead>
              <TableHead>{t("ISO Code")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8">
                  {t("Loading...")}
                </TableCell>
              </TableRow>
            ) : countries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                  {t("No countries found")}
                </TableCell>
              </TableRow>
            ) : (
              countries.map((country) => (
                <TableRow 
                  key={country.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => openDialog(country)}
                >
                  <TableCell className="font-medium">{country.name}</TableCell>
                  <TableCell>{country.isoCode}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCountry ? t("Edit Country") : t("Add Country")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("Country Name")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Kenya"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isoCode">{t("ISO Code")}</Label>
              <Input
                id="isoCode"
                value={formData.isoCode}
                onChange={(e) => setFormData({ ...formData, isoCode: e.target.value })}
                placeholder="e.g. KE"
              />
            </div>
            
            <DialogFooter className="pt-4 flex-col sm:flex-row gap-2">
              {editingCountry && (
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
    </div>
  );
}
