import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Building2, Search, X, MapPin, MoreVertical } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { Filter } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

import { ImportClubsModal } from "./import-clubs-modal";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

type RegionExpanded = RegionsResponse<{
  country: CountriesResponse;
}>;

type ClubExpanded = ClubsResponse<{
  region: RegionExpanded;
  country: CountriesResponse;
  missionary?: UsersResponse;
}>;

const ITEMS_PER_PAGE = 20;

export function ClubManagement() {
  const { t } = useTranslation();
  const { setHeaderTitle, setHeaderRight } = useLayout();
  const { toast } = useToast();
  const { isGlobalAdmin, adminRoles, isLoading: isAdminLoading } = useAdmin();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<ClubExpanded | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const [filters, setFilters] = useState({
    venue: "all",
    denomination: "",
    missionary: "all",
    expiration: "",
    country: "all",
    region: "all"
  });
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
    salesforce: string;
    timezone: string;
    active: boolean;
    lat: number | "";
    lng: number | "";
    joinCode: string;
    leaderSecret: string;
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
    salesforce: "",
    timezone: "UTC",
    active: true,
    lat: "",
    lng: "",
    joinCode: "",
    leaderSecret: "",
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
        conditions.push(managedCountryIds.map(id => `country = "${id}"`).join(" || "));
      }
      
      if (conditions.length > 0) {
        roleFilter = conditions.map(c => `(${c})`).join(" || ");
      } else {
        roleFilter = "id = 'none'";
      }
    }

    // Combine with filters
    const filterParts = [];
    if (roleFilter) filterParts.push(`(${roleFilter})`);
    
    if (searchQuery.trim()) {
      const s = searchQuery.trim().replace(/"/g, '\\"');
      filterParts.push(`(name ~ "${s}" || registration ~ "${s}")`);
    }

    if (filters.venue !== "all") {
      filterParts.push(`venue = "${filters.venue}"`);
    }

    if (filters.denomination.trim()) {
      const d = filters.denomination.trim().replace(/"/g, '\\"');
      filterParts.push(`denomination ~ "${d}"`);
    }

    if (filters.missionary !== "all") {
      if (filters.missionary === "none") {
        filterParts.push(`missionary = null`);
      } else {
        filterParts.push(`missionary = "${filters.missionary}"`);
      }
    }

    if (filters.expiration) {
      filterParts.push(`expiration = "${filters.expiration} 00:00:00"`);
    }

    if (filters.country !== "all") {
      filterParts.push(`country = "${filters.country}"`);
    }

    if (filters.region !== "all") {
      filterParts.push(`region = "${filters.region}"`);
    }

    const clubFilter = filterParts.length > 0 ? filterParts.join(" && ") : "";

    // Use unique request keys for each collection to allow parallel execution
    // while still benefitting from usePBQuery's overall cancellation of stale query runs.
    const [clubRecords, regionRecords, countryRecords, missionaryRecords] = await Promise.all([
      pb.collection("clubs").getList<ClubExpanded>(currentPage, ITEMS_PER_PAGE, {
        sort: "name",
        expand: "country,region,missionary",
        filter: clubFilter,
        requestKey: `${requestKey}_clubs`,
      }),
      pb.collection("regions").getFullList<RegionExpanded>({
        sort: "name",
        expand: "country",
        requestKey: `${requestKey}_regions_all`,
      }),
      pb.collection("countries").getFullList<CountriesResponse>({
        sort: "name",
        requestKey: `${requestKey}_countries_all`,
      }),
      pb.collection("users").getFullList<UsersResponse>({
        sort: "name,email",
        filter: 'admin_roles_via_user.role ?= "Missionary"',
        requestKey: `${requestKey}_missionaries`,
      }),
    ]);

    // Filter regions based on access for the table/logic
    let accessibleRegions = regionRecords;
    if (!isGlobalAdmin) {
      const managedRegionIds = new Set(adminRoles
        .filter(r => r.role === 'Region')
        .map(r => r.region)
        .filter(Boolean) as string[]);

      const managedCountryIds = new Set(adminRoles
        .filter(r => r.role === 'Country')
        .map(r => r.country)
        .filter(Boolean) as string[]);

      accessibleRegions = regionRecords.filter(r => 
        managedRegionIds.has(r.id) || (r.country && managedCountryIds.has(r.country))
      );
    }

    // Filter countries based on accessible regions
    const uniqueAccessibleCountryIds = new Set(accessibleRegions.map(r => r.country).filter(Boolean));
    const filteredCountries = countryRecords.filter(c => uniqueAccessibleCountryIds.has(c.id));

    return {
      clubs: clubRecords.items,
      totalPages: clubRecords.totalPages,
      totalItems: clubRecords.totalItems,
      regions: accessibleRegions,
      countries: (isGlobalAdmin ? countryRecords : filteredCountries).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i),
      missionaries: missionaryRecords
    };
  }, [adminRoles, isGlobalAdmin, searchQuery, filters, currentPage], {
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
  const totalPages = data?.totalPages || 0;
  const totalItems = data?.totalItems || 0;
  const regions = data?.regions || [];
  const countries = data?.countries || [];
  const missionaries = data?.missionaries || [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  useEffect(() => {
    setHeaderTitle(t("Club Management"));
    
    // Set up the "More" menu with Import option
    setHeaderRight(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsImportModalOpen(true)}>
            {t("Import Clubs")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    
    return () => {
      setHeaderRight(null);
    };
  }, [setHeaderTitle, setHeaderRight, t]);

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
        puggles, cubbies, sparks, flame, torch, truthSeekers, livingGodsStory, 
        tandt, jrVarsity, trek, journey, descubrelo, buildingHealthyFamilies, 
        total, leaders, lat, lng,
        ...rest 
      } = formData;
      
      const submitData: any = { 
        ...rest,
        lat: lat === "" ? null : Number(lat),
        lng: lng === "" ? null : Number(lng)
      };
      
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
        salesforce: "",
        timezone: "UTC",
        active: true,
        lat: "",
        lng: "",
        joinCode: "",
        leaderSecret: "",
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
        salesforce: club.salesforce || "",
        timezone: club.timezone || "UTC",
        active: !!club.active,
        lat: club.lat ?? "",
        lng: club.lng ?? "",
        joinCode: club.joinCode || "",
        leaderSecret: club.leaderSecret || "",
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
        salesforce: "",
        timezone: "UTC",
        active: true,
        lat: "",
        lng: "",
        joinCode: "",
        leaderSecret: "",
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`h-9 w-9 shrink-0 ${isFilterExpanded ? "bg-accent" : ""}`}
          >
            <Filter className="h-4 w-4" />
            <span className="sr-only">{t("Filters")}</span>
          </Button>
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

      <Collapsible open={isFilterExpanded} onOpenChange={setIsFilterExpanded}>
        <CollapsibleContent className="space-y-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 border rounded-md bg-muted/20">
            <div className="space-y-2">
              <Label className="text-xs">{t("Venue")}</Label>
              <Select value={filters.venue} onValueChange={(v) => setFilters({ ...filters, venue: v })}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All Venues")}</SelectItem>
                  <SelectItem value="Church">{t("Church")}</SelectItem>
                  <SelectItem value="School">{t("School")}</SelectItem>
                  <SelectItem value="Community Center">{t("Community Center")}</SelectItem>
                  <SelectItem value="Christian Camp">{t("Christian Camp")}</SelectItem>
                  <SelectItem value="Other">{t("Other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{t("Denomination")}</Label>
              <Input
                className="h-8"
                value={filters.denomination}
                onChange={(e) => setFilters({ ...filters, denomination: e.target.value })}
                placeholder={t("Filter by...")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{t("Missionary")}</Label>
              <Select value={filters.missionary} onValueChange={(v) => setFilters({ ...filters, missionary: v })}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All Missionaries")}</SelectItem>
                  <SelectItem value="none">{t("None")}</SelectItem>
                  {missionaries.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name || m.displayName || m.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{t("Expiration")}</Label>
              <Input
                type="date"
                className="h-8"
                value={filters.expiration}
                onChange={(e) => setFilters({ ...filters, expiration: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{t("Country")}</Label>
              <Select value={filters.country} onValueChange={(v) => setFilters({ ...filters, country: v, region: "all" })}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All Countries")}</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{t("Region")}</Label>
              <Select 
                value={filters.region} 
                onValueChange={(v) => setFilters({ ...filters, region: v })}
                disabled={filters.country === "all"}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder={filters.country === "all" ? t("Select country first") : t("All Regions")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All Regions")}</SelectItem>
                  {regions
                    .filter(r => r.country === filters.country)
                    .map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Registration")}</TableHead>
              <TableHead>{t("Name")}</TableHead>
              <TableHead>{t("Venue")}</TableHead>
              <TableHead>{t("Region")}</TableHead>
              <TableHead>{t("Country")}</TableHead>
              <TableHead>{t("Status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {t("Loading...")}
                </TableCell>
              </TableRow>
            ) : clubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                  <TableCell className="capitalize">{t(club.venue)}</TableCell>
                  <TableCell>{club.expand?.region?.name || "—"}</TableCell>
                  <TableCell>{club.expand?.country?.name || "—"}</TableCell>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            {t("Showing {{count}} of {{total}} clubs", { 
              count: clubs.length, 
              total: totalItems 
            })}
          </p>
          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Simple pagination logic: show current, first, last, and neighbors
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  page === currentPage - 2 || 
                  page === currentPage + 2
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{editingClub ? t("Edit Club") : t("Add Club")}</DialogTitle>
            <DialogDescription>
              {editingClub ? t("Update the details for this club.") : t("Create a new club by filling out the information below.")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <Tabs defaultValue="basic" className="flex-1 flex flex-col min-h-0">
              <div className="px-6 border-b">
                <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-6">
                  <TabsTrigger 
                    value="basic" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1"
                  >
                    {t("Basic Information")}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="curriculum" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1"
                  >
                    {t("Curriculum Counts")}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="onboarding" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1"
                  >
                    {t("Onboarding & Geo")}
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-y-auto px-6">
                <TabsContent value="basic" className="space-y-6 pb-6 pt-4 mt-0">
                  <div className="space-y-4">
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">{t("Address")}</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salesforce">{t("Salesforce ID")}</Label>
                        <Input
                          id="salesforce"
                          value={formData.salesforce}
                          onChange={(e) => setFormData({ ...formData, salesforce: e.target.value })}
                          placeholder="SF-000000"
                        />
                      </div>
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
                </TabsContent>

                <TabsContent value="curriculum" className="space-y-6 pb-6 pt-4 mt-0">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Puggles")}</Label>
                        <Input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.puggles} onChange={(e) => setFormData({...formData, puggles: parseInt(e.target.value.replace(/\D/g, '')) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Cubbies")}</Label>
                        <Input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.cubbies} onChange={(e) => setFormData({...formData, cubbies: parseInt(e.target.value.replace(/\D/g, '')) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Sparks")}</Label>
                        <Input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.sparks} onChange={(e) => setFormData({...formData, sparks: parseInt(e.target.value.replace(/\D/g, '')) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Flame")}</Label>
                        <Input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.flame} onChange={(e) => setFormData({...formData, flame: parseInt(e.target.value.replace(/\D/g, '')) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Torch")}</Label>
                        <Input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.torch} onChange={(e) => setFormData({...formData, torch: parseInt(e.target.value.replace(/\D/g, '')) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Truth Seekers")}</Label>
                        <Input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.truthSeekers} onChange={(e) => setFormData({...formData, truthSeekers: parseInt(e.target.value.replace(/\D/g, '')) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Living God's Story")}</Label>
                        <Input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.livingGodsStory} onChange={(e) => setFormData({...formData, livingGodsStory: parseInt(e.target.value.replace(/\D/g, '')) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("T&T")}</Label>
                        <Input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.tandt} onChange={(e) => setFormData({...formData, tandt: parseInt(e.target.value.replace(/\D/g, '')) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Jr. Varsity")}</Label>
                        <Input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.jrVarsity} onChange={(e) => setFormData({...formData, jrVarsity: parseInt(e.target.value.replace(/\D/g, '')) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Trek")}</Label>
                        <Input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.trek} onChange={(e) => setFormData({...formData, trek: parseInt(e.target.value.replace(/\D/g, '')) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Journey")}</Label>
                        <Input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.journey} onChange={(e) => setFormData({...formData, journey: parseInt(e.target.value.replace(/\D/g, '')) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Descubrelo")}</Label>
                        <Input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.descubrelo} onChange={(e) => setFormData({...formData, descubrelo: parseInt(e.target.value.replace(/\D/g, '')) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">{t("Healthy Families")}</Label>
                        <Input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.buildingHealthyFamilies} onChange={(e) => setFormData({...formData, buildingHealthyFamilies: parseInt(e.target.value.replace(/\D/g, '')) || 0})} className="h-8" />
                      </div>
                      <div className="space-y-1 border-t pt-2 mt-2 col-span-full"></div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold">{t("Total")}</Label>
                        <Input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.total} onChange={(e) => setFormData({...formData, total: parseInt(e.target.value.replace(/\D/g, '')) || 0})} className="h-8 font-bold" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold">{t("Leaders")}</Label>
                        <Input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.leaders} onChange={(e) => setFormData({...formData, leaders: parseInt(e.target.value.replace(/\D/g, '')) || 0})} className="h-8 font-bold" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="onboarding" className="space-y-6 pb-6 pt-4 mt-0">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold border-b pb-2">{t("Registration & Access")}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="joinCode">{t("Join Code")}</Label>
                          <Input
                            id="joinCode"
                            value={formData.joinCode}
                            onChange={(e) => setFormData({ ...formData, joinCode: e.target.value.toUpperCase() })}
                            placeholder="AW1234"
                          />
                          <p className="text-[10px] text-muted-foreground">
                            {t("Short code for users to find the club manually.")}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="leaderSecret">{t("Leader Secret")}</Label>
                          <Input
                            id="leaderSecret"
                            value={formData.leaderSecret}
                            onChange={(e) => setFormData({ ...formData, leaderSecret: e.target.value })}
                            placeholder="SECRET PIN"
                          />
                          <p className="text-[10px] text-muted-foreground">
                            {t("Secret code for instant leader approval.")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold border-b pb-2">{t("Geolocation")}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="lat">{t("Latitude")}</Label>
                          <Input
                            id="lat"
                            type="number"
                            step="any"
                            value={formData.lat}
                            onChange={(e) => setFormData({ ...formData, lat: e.target.value === "" ? "" : Number(e.target.value) })}
                            placeholder="-6.7924"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lng">{t("Longitude")}</Label>
                          <Input
                            id="lng"
                            type="number"
                            step="any"
                            value={formData.lng}
                            onChange={(e) => setFormData({ ...formData, lng: e.target.value === "" ? "" : Number(e.target.value) })}
                            placeholder="39.2083"
                          />
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition((pos) => {
                              setFormData({
                                ...formData,
                                lat: pos.coords.latitude,
                                lng: pos.coords.longitude
                              });
                              toast({ title: t("Success"), description: t("Location captured") });
                            }, (err) => {
                              toast({ title: t("Error"), description: err.message, variant: "destructive" });
                            });
                          }
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {t("Capture Current GPS Location")}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

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

      <ImportClubsModal 
        isOpen={isImportModalOpen} 
        onOpenChange={setIsImportModalOpen}
        onImportComplete={() => refetch()}
      />
    </div>
  );
}
