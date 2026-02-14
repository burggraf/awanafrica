import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Building2, Search, X } from "lucide-react";
import { pb } from "@/lib/pb";
import { useLayout } from "@/lib/layout-context";
import { useAdmin } from "@/lib/admin-context";
import { usePBQuery } from "@/hooks/use-pb-query";
import { 
  type ClubsResponse, 
  type RegionsResponse, 
  type CountriesResponse,
  type UsersResponse
} from "@/types/pocketbase-types";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type RegionExpanded = RegionsResponse<{
  country: CountriesResponse;
}>;

type ClubExpanded = ClubsResponse<{
  region: RegionExpanded;
  missionary?: UsersResponse;
}>;

export function ClubManagement() {
  const { t } = useTranslation();
  const { setHeaderTitle } = useLayout();
  const { toast } = useToast();
  const { isGlobalAdmin, adminRoles, isLoading: isAdminLoading } = useAdmin();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<ClubExpanded | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState<{
    name: string;
    registration: string;
    venue: "Church" | "School" | "Community Center" | "Christian Camp" | "Other";
    type: "Leader Based" | "Other";
    denomination: string;
    location: string;
    missionary: string;
    expiration: string;
    puggles: number;
    cubbies: number;
    sparks: number;
    flame: number;
    torch: number;
    truthSeekers: number;
    livingGodsStory: number;
    tandt: number;
    jrVarsity: number;
    trek: number;
    journey: number;
    descubrelo: number;
    buildingHealthyFamilies: number;
    total: number;
    leaders: number;
    country: string;
    region: string;
    address: string;
    timezone: string;
    active: boolean;
  }>({
    name: "",
    registration: "",
    venue: "Church",
    type: "Leader Based",
    denomination: "",
    location: "",
    missionary: "",
    expiration: "",
    puggles: 0,
    cubbies: 0,
    sparks: 0,
    flame: 0,
    torch: 0,
    truthSeekers: 0,
    livingGodsStory: 0,
    tandt: 0,
    jrVarsity: 0,
    trek: 0,
    journey: 0,
    descubrelo: 0,
    buildingHealthyFamilies: 0,
    total: 0,
    leaders: 0,
    country: "",
    region: "",
    address: "",
    timezone: "UTC",
    active: true,
  });

  const { data, isLoading, refetch } = usePBQuery(async ({ requestKey }) => {
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
      const searchPart = `(name ~ "${s}" || registration ~ "${s}")`;
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

    // Use unique request keys for each collection to allow parallel execution
    // while still benefitting from usePBQuery's overall cancellation of stale query runs.
    const [clubRecords, regionRecords, countryRecords, missionaryRecords] = await Promise.all([
      pb.collection("clubs").getFullList<ClubExpanded>({
        sort: "name",
        expand: "region.country,missionary",
        filter: clubFilter,
        requestKey: `${requestKey}_clubs`,
      }),
      pb.collection("regions").getFullList<RegionExpanded>({
        sort: "name",
        expand: "country",
        filter: regionFilter,
        requestKey: `${requestKey}_regions`,
      }),
      pb.collection("countries").getFullList<CountriesResponse>({
        sort: "name",
        requestKey: `${requestKey}_countries`,
      }),
      pb.collection("users").getFullList<UsersResponse>({
        sort: "name,email",
        filter: 'admin_roles_via_user.role ?= "Missionary"',
        requestKey: `${requestKey}_missionaries`,
      }),
    ]);

    // Filter countries based on access
    let filteredCountries = countryRecords;
    if (!isGlobalAdmin) {
      const accessibleCountryIds = new Set(managedCountryIds);
      regionRecords.forEach(r => {
        if (r.country) accessibleCountryIds.add(r.country);
      });
      filteredCountries = countryRecords.filter(c => accessibleCountryIds.has(c.id));
    }

    return {
      clubs: clubRecords,
      regions: regionRecords,
      countries: filteredCountries,
      missionaries: missionaryRecords
    };
  }, [adminRoles, isGlobalAdmin, searchQuery], {
    enabled: !isAdminLoading,
    onError: () => {
      toast({
        title: t("Error"),
        description: t("Failed to fetch clubs or regions"),
        variant: "destructive",
      });
    }
  });

  const clubs = data?.clubs || [];
  const regions = data?.regions || [];
  const countries = data?.countries || [];
  const missionaries = data?.missionaries || [];

  useEffect(() => {
    setHeaderTitle(t("Club Management"));
  }, [setHeaderTitle, t]);

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
      const { 
        country, 
        puggles, cubbies, sparks, flame, torch, truthSeekers, livingGodsStory, 
        tandt, jrVarsity, trek, journey, descubrelo, buildingHealthyFamilies, 
        total, leaders,
        ...rest 
      } = formData;
      
      const submitData: any = { ...rest };
      
      if (submitData.missionary === "none" || !submitData.missionary) {
        submitData.missionary = null;
      }

      if (!submitData.expiration) {
        submitData.expiration = null;
      }

      submitData.metadata = {
        Puggles: puggles,
        Cubbies: cubbies,
        Sparks: sparks,
        Flame: flame,
        Torch: torch,
        "Truth Seekers": truthSeekers,
        "Living God's Story": livingGodsStory,
        "T&T": tandt,
        "Jr. Varsity": jrVarsity,
        Trek: trek,
        Journey: journey,
        Descubrelo: descubrelo,
        "Building Healthy Families": buildingHealthyFamilies,
        Total: total,
        Leaders: leaders
      };
      
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
        registration: "",
        venue: "Church",
        type: "Leader Based",
        denomination: "",
        location: "",
        missionary: "",
        expiration: "",
        puggles: 0,
        cubbies: 0,
        sparks: 0,
        flame: 0,
        torch: 0,
        truthSeekers: 0,
        livingGodsStory: 0,
        tandt: 0,
        jrVarsity: 0,
        trek: 0,
        journey: 0,
        descubrelo: 0,
        buildingHealthyFamilies: 0,
        total: 0,
        leaders: 0,
        country: "",
        region: "",
        address: "",
        timezone: "UTC",
        active: true,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to save club"),
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
      refetch();
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to delete club"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (!editingClub) return;
    setIsAlertOpen(true);
  };

  const openDialog = (club?: ClubExpanded) => {
    if (club) {
      const meta = club.metadata || {};
      setEditingClub(club);
      setFormData({
        name: club.name,
        registration: club.registration?.toString() || "",
        venue: club.venue,
        type: club.type || "Leader Based",
        denomination: club.denomination || "",
        location: club.location || "",
        missionary: club.missionary || "",
        expiration: club.expiration ? new Date(club.expiration).toISOString().split('T')[0] : "",
        puggles: Number(meta.Puggles || 0),
        cubbies: Number(meta.Cubbies || 0),
        sparks: Number(meta.Sparks || 0),
        flame: Number(meta.Flame || 0),
        torch: Number(meta.Torch || 0),
        truthSeekers: Number(meta["Truth Seekers"] || 0),
        livingGodsStory: Number(meta["Living God's Story"] || 0),
        tandt: Number(meta["T&T"] || 0),
        jrVarsity: Number(meta["Jr. Varsity"] || 0),
        trek: Number(meta.Trek || 0),
        journey: Number(meta.Journey || 0),
        descubrelo: Number(meta.Descubrelo || 0),
        buildingHealthyFamilies: Number(meta["Building Healthy Families"] || 0),
        total: Number(meta.Total || 0),
        leaders: Number(meta.Leaders || 0),
        country: club.expand?.region?.country || "",
        region: club.region,
        address: club.address || "",
        timezone: club.timezone || "UTC",
        active: !!club.active,
      });
    } else {
      setEditingClub(null);
      setFormData({
        name: "",
        registration: "",
        venue: "Church",
        type: "Leader Based",
        denomination: "",
        location: "",
        missionary: "",
        expiration: "",
        puggles: 0,
        cubbies: 0,
        sparks: 0,
        flame: 0,
        torch: 0,
        truthSeekers: 0,
        livingGodsStory: 0,
        tandt: 0,
        jrVarsity: 0,
        trek: 0,
        journey: 0,
        descubrelo: 0,
        buildingHealthyFamilies: 0,
        total: 0,
        leaders: 0,
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
              <TableHead>{t("Registration")}</TableHead>
              <TableHead>{t("Name")}</TableHead>
              <TableHead>{t("Type")}</TableHead>
              <TableHead>{t("Venue")}</TableHead>
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
                    {club.registration || "—"}
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
                  <TableCell className="capitalize">{t(club.venue)}</TableCell>
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
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{editingClub ? t("Edit Club") : t("Add Club")}</DialogTitle>
            <DialogDescription>
              {editingClub ? t("Update the details for this club.") : t("Create a new club by filling out the information below.")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary border-b pb-1">{t("Basic Information")}</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2 col-span-1">
                        <Label htmlFor="registration">{t("Registration #")}</Label>
                        <Input
                          id="registration"
                          value={formData.registration}
                          onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                          placeholder="TZ000001"
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
                    
                    <div className="grid grid-cols-2 gap-4">
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
                            <SelectItem value="Leader Based">{t("Leader Based")}</SelectItem>
                            <SelectItem value="Other">{t("Other")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="venue">{t("Venue")}</Label>
                        <Select
                          value={formData.venue}
                          onValueChange={(value: any) => setFormData({ ...formData, venue: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Church">{t("Church")}</SelectItem>
                            <SelectItem value="School">{t("School")}</SelectItem>
                            <SelectItem value="Community Center">{t("Community Center")}</SelectItem>
                            <SelectItem value="Christian Camp">{t("Christian Camp")}</SelectItem>
                            <SelectItem value="Other">{t("Other")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="denomination">{t("Denomination")}</Label>
                        <Input
                          id="denomination"
                          value={formData.denomination}
                          onChange={(e) => setFormData({ ...formData, denomination: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">{t("Location")}</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="missionary">{t("Missionary")}</Label>
                        <Select
                          value={formData.missionary}
                          onValueChange={(value) => setFormData({ ...formData, missionary: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select Missionary")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t("None")}</SelectItem>
                            {missionaries.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name || user.displayName || user.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiration">{t("Expiration Date")}</Label>
                        <Input
                          id="expiration"
                          type="date"
                          value={formData.expiration}
                          onChange={(e) => setFormData({ ...formData, expiration: e.target.value })}
                        />
                      </div>
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

                    <div className="flex items-center justify-between border p-3 rounded-md bg-slate-50 dark:bg-slate-900/50 mt-4">
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
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary border-b pb-1">{t("Curriculum Counts")}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Puggles")}</Label>
                        <Input type="number" value={formData.puggles} onChange={(e) => setFormData({...formData, puggles: parseInt(e.target.value) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Cubbies")}</Label>
                        <Input type="number" value={formData.cubbies} onChange={(e) => setFormData({...formData, cubbies: parseInt(e.target.value) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Sparks")}</Label>
                        <Input type="number" value={formData.sparks} onChange={(e) => setFormData({...formData, sparks: parseInt(e.target.value) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Flame")}</Label>
                        <Input type="number" value={formData.flame} onChange={(e) => setFormData({...formData, flame: parseInt(e.target.value) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Torch")}</Label>
                        <Input type="number" value={formData.torch} onChange={(e) => setFormData({...formData, torch: parseInt(e.target.value) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Truth Seekers")}</Label>
                        <Input type="number" value={formData.truthSeekers} onChange={(e) => setFormData({...formData, truthSeekers: parseInt(e.target.value) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Living God's Story")}</Label>
                        <Input type="number" value={formData.livingGodsStory} onChange={(e) => setFormData({...formData, livingGodsStory: parseInt(e.target.value) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("T&T")}</Label>
                        <Input type="number" value={formData.tandt} onChange={(e) => setFormData({...formData, tandt: parseInt(e.target.value) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Jr. Varsity")}</Label>
                        <Input type="number" value={formData.jrVarsity} onChange={(e) => setFormData({...formData, jrVarsity: parseInt(e.target.value) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Trek")}</Label>
                        <Input type="number" value={formData.trek} onChange={(e) => setFormData({...formData, trek: parseInt(e.target.value) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Journey")}</Label>
                        <Input type="number" value={formData.journey} onChange={(e) => setFormData({...formData, journey: parseInt(e.target.value) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Descubrelo")}</Label>
                        <Input type="number" value={formData.descubrelo} onChange={(e) => setFormData({...formData, descubrelo: parseInt(e.target.value) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Healthy Families")}</Label>
                        <Input type="number" value={formData.buildingHealthyFamilies} onChange={(e) => setFormData({...formData, buildingHealthyFamilies: parseInt(e.target.value) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold">{t("Total")}</Label>
                        <Input type="number" value={formData.total} onChange={(e) => setFormData({...formData, total: parseInt(e.target.value) || 0})} className="h-8 font-bold" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold">{t("Leaders")}</Label>
                        <Input type="number" value={formData.leaders} onChange={(e) => setFormData({...formData, leaders: parseInt(e.target.value) || 0})} className="h-8 font-bold" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="p-6 border-t flex-col sm:flex-row gap-2 bg-slate-50/50 dark:bg-slate-900/20">
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
