import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Library } from "lucide-react";
import { pb } from "@/lib/pb";
import { usePBQuery } from "@/hooks/use-pb-query";
import { useClubs } from "@/lib/club-context";
import { useAdmin } from "@/lib/admin-context";
import type { ProgramsResponse } from "@/types/pocketbase-types";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function ProgramManagement() {
  const { t } = useTranslation();
  const { currentClub, currentClubRoles } = useClubs();
  const { isGlobalAdmin, adminRoles } = useAdmin();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramsResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const { data: programs, isLoading, refetch } = usePBQuery(
    async ({ requestKey }) => {
      if (!currentClub) return [];
      return pb.collection("programs").getFullList<ProgramsResponse>({
        filter: `club = "${currentClub.id}"`,
        sort: "name",
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

  const openDialog = (program?: ProgramsResponse) => {
    if (program) {
      setEditingProgram(program);
      setFormData({ name: program.name, description: program.description || "" });
    } else {
      setEditingProgram(null);
      setFormData({ name: "", description: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClub) return;

    try {
      if (editingProgram) {
        await pb.collection("programs").update(editingProgram.id, formData);
        toast({ title: t("Success"), description: t("Program updated successfully") });
      } else {
        await pb.collection("programs").create({
          ...formData,
          club: currentClub.id,
        });
        toast({ title: t("Success"), description: t("Program created successfully") });
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to save program"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!editingProgram) return;

    try {
      // Check for existing clubber registrations
      const registrations = await pb.collection("clubber_registrations").getList(1, 1, {
        filter: `program = "${editingProgram.id}"`,
        requestKey: 'check_registrations'
      });

      if (registrations.totalItems > 0) {
        toast({
          title: t("Cannot Delete"),
          description: t("Programs with existing clubber registrations cannot be deleted."),
          variant: "destructive",
        });
        setIsDeleteDialogOpen(false);
        return;
      }

      await pb.collection("programs").delete(editingProgram.id);
      toast({ title: t("Success"), description: t("Program deleted successfully") });
      setIsDeleteDialogOpen(false);
      setEditingProgram(null);
      refetch();
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to delete program"),
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
          <Library className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t("Programs")}</h2>
        </div>
        {canEdit && (
          <Button onClick={() => openDialog()} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("Add Program")}
          </Button>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Name")}</TableHead>
              <TableHead>{t("Description")}</TableHead>
              {canEdit && <TableHead className="w-[100px]">{t("Actions")}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 3 : 2} className="text-center py-8">
                  {t("Loading...")}
                </TableCell>
              </TableRow>
            ) : !programs || programs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 3 : 2} className="text-center py-8 text-muted-foreground">
                  {t("No programs found")}
                </TableCell>
              </TableRow>
            ) : (
              programs.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{program.description || "—"}</TableCell>
                  {canEdit && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(program)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingProgram(program);
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
            <DialogTitle>{editingProgram ? t("Edit Program") : t("Add Program")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("Program Name")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("e.g., Cubbies, Sparks")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("Description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t("Brief description of the program...")}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button type="submit">{editingProgram ? t("Save Changes") : t("Create Program")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title={t("Delete Program")}
        description={t("Are you sure you want to delete this program? This action cannot be undone.")}
        confirmText={t("Delete")}
        variant="destructive"
      />
    </div>
  );
}
