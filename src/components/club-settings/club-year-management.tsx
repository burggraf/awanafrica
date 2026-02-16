import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { pb } from "@/lib/pb";
import { usePBQuery } from "@/hooks/use-pb-query";
import { useClubs } from "@/lib/club-context";
import { useAdmin } from "@/lib/admin-context";
import type { ClubYearsResponse } from "@/types/pocketbase-types";
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
import { ConfirmDialog } from "@/components/confirm-dialog";

export function ClubYearManagement() {
  const { t } = useTranslation();
  const { currentClub, currentClubRoles } = useClubs();
  const { isGlobalAdmin, adminRoles } = useAdmin();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<ClubYearsResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    label: "", 
    startDate: "", 
    endDate: "" 
  });

  const { data: years, isLoading, refetch } = usePBQuery(
    async ({ requestKey }) => {
      if (!currentClub) return [];
      return pb.collection("club_years").getFullList<ClubYearsResponse>({
        filter: `club = "${currentClub.id}"`,
        sort: "-startDate",
        requestKey,
      });
    },
    [currentClub?.id]
  );

  // Missionary, Country Admin, or Regional Admin for the club's country/region
  const hasAdminAccess = isGlobalAdmin || adminRoles.some(r => 
    (r.role === 'Country' && r.country === (currentClub as any)?.expand?.region?.country) ||
    (r.role === 'Region' && r.region === currentClub?.region)
  );

  const isDirector = currentClubRoles.includes("Director");
  const canEdit = isDirector || hasAdminAccess;

  const openDialog = (year?: ClubYearsResponse) => {
    if (year) {
      setEditingYear(year);
      setFormData({ 
        label: year.label, 
        startDate: new Date(year.startDate).toISOString().split('T')[0],
        endDate: new Date(year.endDate).toISOString().split('T')[0]
      });
    } else {
      setEditingYear(null);
      setFormData({ 
        label: "", 
        startDate: "", 
        endDate: "" 
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClub) return;

    try {
      if (editingYear) {
        await pb.collection("club_years").update(editingYear.id, formData);
        toast({ title: t("Success"), description: t("Club year updated successfully") });
      } else {
        await pb.collection("club_years").create({
          ...formData,
          club: currentClub.id,
        });
        toast({ title: t("Success"), description: t("Club year created successfully") });
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to save club year"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!editingYear) return;

    try {
      // Check for existing clubber registrations for this year
      const registrations = await pb.collection("clubber_registrations").getList(1, 1, {
        filter: `club_year = "${editingYear.id}"`,
        requestKey: 'check_registrations_year'
      });

      if (registrations.totalItems > 0) {
        toast({
          title: t("Cannot Delete"),
          description: t("Club years with existing clubber registrations cannot be deleted."),
          variant: "destructive",
        });
        setIsDeleteDialogOpen(false);
        return;
      }

      await pb.collection("club_years").delete(editingYear.id);
      toast({ title: t("Success"), description: t("Club year deleted successfully") });
      setIsDeleteDialogOpen(false);
      setEditingYear(null);
      refetch();
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to delete club year"),
        variant: "destructive",
      });
    }
  };

  if (!currentClub) {
    return <div className="p-8 text-center text-muted-foreground">{t("Please select a club first.")}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t("Club Years")}</h2>
        </div>
        {canEdit && (
          <Button onClick={() => openDialog()} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("Add Year")}
          </Button>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Label")}</TableHead>
              <TableHead>{t("Start Date")}</TableHead>
              <TableHead>{t("End Date")}</TableHead>
              {canEdit && <TableHead className="w-[100px]">{t("Actions")}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 4 : 3} className="text-center py-8">
                  {t("Loading...")}
                </TableCell>
              </TableRow>
            ) : !years || years.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 4 : 3} className="text-center py-8 text-muted-foreground">
                  {t("No club years found")}
                </TableCell>
              </TableRow>
            ) : (
              years.map((year) => (
                <TableRow key={year.id}>
                  <TableCell className="font-medium">{year.label}</TableCell>
                  <TableCell>{new Date(year.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(year.endDate).toLocaleDateString()}</TableCell>
                  {canEdit && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(year)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingYear(year);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingYear ? t("Edit Club Year") : t("Add Club Year")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label">{t("Year Label")}</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder={t("e.g., 2026-2027")}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t("Start Date")}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t("End Date")}</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button type="submit">{editingYear ? t("Save Changes") : t("Create Year")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title={t("Delete Club Year")}
        description={t("Are you sure you want to delete this club year? This action cannot be undone.")}
        confirmText={t("Delete")}
        variant="destructive"
      />
    </div>
  );
}
