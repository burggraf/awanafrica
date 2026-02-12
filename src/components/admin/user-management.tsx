import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search, UserCog, Plus, Trash2, Shield } from "lucide-react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserRecord {
  id: string;
  email: string;
  name: string;
  displayName: string;
  avatar: string;
}

interface AdminRole {
  id: string;
  user: string;
  role: 'Global' | 'Country' | 'Region';
  country?: string;
  region?: string;
  expand?: {
    country?: { name: string };
    region?: { name: string };
  };
}

interface Country {
  id: string;
  name: string;
}

interface Region {
  id: string;
  name: string;
  country: string;
  expand?: {
    country?: { name: string };
  };
}

export function UserManagement() {
  const { t } = useTranslation();
  const { setHeaderTitle } = useLayout();
  const { toast } = useToast();
  const { isGlobalAdmin, adminRoles: myRoles } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [userRoles, setUserRoles] = useState<AdminRole[]>([]);
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false);
  
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  
  const [newRoleData, setNewRoleData] = useState<{
    role: 'Global' | 'Country' | 'Region';
    country: string;
    region: string;
  }>({
    role: 'Region',
    country: "",
    region: ""
  });

  // Keep track of the selected country for filtering regions
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");

  useEffect(() => {
    setHeaderTitle(t("User Permissions"));
    fetchCountriesAndRegions();
  }, [setHeaderTitle, t]);

  const fetchCountriesAndRegions = async () => {
    try {
      const [countriesList, regionsList, myRoleData] = await Promise.all([
        pb.collection("countries").getFullList<Country>({ 
          sort: "name",
          requestKey: "user_mgmt_countries"
        }),
        pb.collection("regions").getFullList<Region>({ 
          sort: "name", 
          expand: "country",
          requestKey: "user_mgmt_regions"
        }),
        pb.collection("admin_roles").getFullList<AdminRole>({
          filter: `user = "${pb.authStore.record?.id}"`,
          expand: "region",
          requestKey: "user_mgmt_my_roles"
        })
      ]);
      setCountries(countriesList);
      setRegions(regionsList);

      // Enhance myRoles with country info from regions if missing
      const enhancedRoles = myRoles.map(role => {
        if (role.role === 'Region' && !role.country) {
          const matchingMyRole = myRoleData.find(r => r.id === role.id);
          const regionInfo = regionsList.find(reg => reg.id === matchingMyRole?.region);
          if (regionInfo) {
            return { ...role, country: regionInfo.country };
          }
        }
        return role;
      });
      
      // Note: We don't setAdminRoles here as it's managed by AdminProvider,
      // but we use the derived info for availableCountries.
      
    } catch (error: any) {
      if (error.isAbort) return;
      console.error("Failed to fetch reference data:", error);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setUsers([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const records = await pb.collection("users").getList<UserRecord>(1, 50, {
        filter: `email ~ "${query}" || name ~ "${query}" || displayName ~ "${query}"`,
        requestKey: "user_search"
      });
      
      setUsers(records.items);
      setTotalItems(records.totalItems);
    } catch (error: any) {
      if (error.isAbort) return;
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const openRolesDialog = async (user: UserRecord) => {
    setSelectedUser(user);
    setSelectedCountryId(""); // Reset country selection for new user
    setNewRoleData({ role: 'Region', country: "", region: "" }); // Reset form
    setIsRolesDialogOpen(true);
    fetchUserRoles(user.id);
  };

  const fetchUserRoles = async (userId: string) => {
    try {
      const roles = await pb.collection("admin_roles").getFullList<AdminRole>({
        filter: `user = "${userId}"`,
        expand: "country,region",
      });
      setUserRoles(roles);
    } catch (error) {
      console.error("Failed to fetch user roles:", error);
    }
  };

  const handleAddRole = async () => {
    if (!selectedUser) return;
    
    try {
      const data: any = {
        user: selectedUser.id,
        role: newRoleData.role,
      };
      
      if (newRoleData.role === 'Country') {
        if (!newRoleData.country) throw new Error(t("Please select a country"));
        data.country = newRoleData.country;
      } else if (newRoleData.role === 'Region') {
        if (!newRoleData.region) throw new Error(t("Please select a region"));
        data.region = newRoleData.region;
      }
      
      await pb.collection("admin_roles").create(data);
      toast({ title: t("Success"), description: t("Role added successfully") });
      fetchUserRoles(selectedUser.id);
      
      // Reset form partly
      setNewRoleData(prev => ({ ...prev, country: "", region: "" }));
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to add role"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await pb.collection("admin_roles").delete(roleId);
      toast({ title: t("Success"), description: t("Role removed successfully") });
      if (selectedUser) fetchUserRoles(selectedUser.id);
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to remove role"),
        variant: "destructive",
      });
    }
  };

  // Filter countries and regions based on current user's scope
  const availableCountries = countries.filter(c => {
    if (isGlobalAdmin) return true;
    
    // Check if any of my roles (Country or Region) allow access to this country
    return myRoles.some(r => {
      // Direct country match for Country Admin
      if (r.role === 'Country' && r.country === c.id) return true;
      
      // For Region Admin, we need to know if the region belongs to this country.
      // We look up the region in our fetched regions list.
      if (r.role === 'Region') {
        const regionInfo = regions.find(reg => reg.id === r.region);
        return regionInfo?.country === c.id;
      }
      
      return false;
    });
  });

  // Auto-select country if user only has access to one
  useEffect(() => {
    if (isRolesDialogOpen && availableCountries.length === 1 && !selectedCountryId) {
      setSelectedCountryId(availableCountries[0].id);
    }
  }, [availableCountries, selectedCountryId, isRolesDialogOpen]);

  const availableRegions = regions.filter(r => {
    if (isGlobalAdmin) {
      if (newRoleData.role === 'Region' && selectedCountryId) {
        return r.country === selectedCountryId;
      }
      return true;
    }
    const isUnderMyCountry = myRoles.some(role => role.role === 'Country' && role.country === r.country);
    const isMyRegion = myRoles.some(role => role.role === 'Region' && role.region === r.id);
    const passesBaseScope = isUnderMyCountry || isMyRegion;
    
    if (newRoleData.role === 'Region' && selectedCountryId) {
      return passesBaseScope && r.country === selectedCountryId;
    }
    return passesBaseScope;
  });

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("Search users by name or email...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {totalItems > 50 && (
        <div className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 p-2 rounded-md border border-amber-500/20">
          {t("Showing first 50 results of {{count}}. Please refine your search for better results.", { count: totalItems })}
        </div>
      )}

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>{t("User")}</TableHead>
              <TableHead>{t("Email")}</TableHead>
              <TableHead className="text-right">{t("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  {t("Searching...")}
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? t("No users found") : t("Start typing to search users")}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar ? pb.files.getURL(user, user.avatar) : ""} />
                      <AvatarFallback>{(user.displayName || user.name || "U")[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{user.displayName || user.name || t("Unnamed")}</div>
                    <div className="text-[10px] text-muted-foreground md:hidden">{user.email || t("Email hidden")}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{user.email || t("Email hidden")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openRolesDialog(user)}>
                      <UserCog className="h-4 w-4 mr-2" />
                      {t("Permissions")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isRolesDialogOpen} onOpenChange={setIsRolesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t("Manage Permissions")}
            </DialogTitle>
            <DialogDescription>
              {selectedUser ? (
                t("Modify administrative roles for {{name}}.", { name: selectedUser.displayName || selectedUser.email })
              ) : (
                t("Manage user administrative roles and permissions.")
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>{t("Current Roles")}</Label>
              <div className="space-y-2">
                {userRoles.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">{t("No administrative roles assigned.")}</p>
                ) : (
                  userRoles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                      <div className="flex flex-col">
                        <Badge variant={role.role === 'Global' ? 'destructive' : role.role === 'Country' ? 'default' : 'secondary'}>
                          {t(role.role)}
                        </Badge>
                        <span className="text-xs text-muted-foreground mt-1">
                          {role.role === 'Country' && role.expand?.country?.name}
                          {role.role === 'Region' && role.expand?.region?.name}
                        </span>
                      </div>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        onClick={() => handleDeleteRole(role.id)} 
                        className="h-8 w-8 text-destructive border border-destructive/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <Label>{t("Add New Role")}</Label>
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">{t("Type")}</Label>
                  <Select 
                    value={newRoleData.role} 
                    onValueChange={(val: any) => setNewRoleData({...newRoleData, role: val})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={t("Select role")} />
                    </SelectTrigger>
                    <SelectContent>
                      {isGlobalAdmin && <SelectItem value="Global">{t("Global")}</SelectItem>}
                      {(isGlobalAdmin || availableCountries.length > 0) && (
                        <SelectItem value="Country">{t("Country")}</SelectItem>
                      )}
                      <SelectItem value="Region">{t("Region")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newRoleData.role === 'Country' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="country" className="text-right">{t("Country")}</Label>
                    <Select 
                      value={newRoleData.country} 
                      onValueChange={(val) => setNewRoleData({...newRoleData, country: val})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={t("Select country")} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCountries.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newRoleData.role === 'Region' && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="region-country" className="text-right">{t("Country")}</Label>
                      <Select 
                        value={selectedCountryId} 
                        onValueChange={(val) => {
                          setSelectedCountryId(val);
                          setNewRoleData({...newRoleData, region: ""});
                        }}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={t("Select country")} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCountries.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="region" className="text-right">{t("Region")}</Label>
                      <Select 
                        value={newRoleData.region} 
                        onValueChange={(val) => setNewRoleData({...newRoleData, region: val})}
                        disabled={!selectedCountryId}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={selectedCountryId ? t("Select region") : t("Select country first")} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRegions.map(r => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Button onClick={handleAddRole} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("Add Role")}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRolesDialogOpen(false)}>
              {t("Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
