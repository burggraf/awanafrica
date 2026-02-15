import { ChevronDown, School } from "lucide-react"
import { useClubs } from "@/lib/club-context"
import { useAdmin } from "@/lib/admin-context"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function ClubSwitcher() {
  const { currentClub, setCurrentClub, memberships } = useClubs()
  const { isAdmin, adminRoles } = useAdmin()

  // Helper to get admin scope label
  const getAdminScopeLabel = () => {
    // Check for Global/Missionary first (highest precedence)
    const globalRole = adminRoles.find(r => r.role === 'Global' || r.role === 'Missionary')
    if (globalRole) return "All Clubs"
    
    // Check for Country admin
    const countryRole = adminRoles.find(r => r.role === 'Country')
    if (countryRole?.expand?.country) {
      return `${countryRole.expand.country.name} Clubs`
    }
    
    // Check for Region admin
    const regionRole = adminRoles.find(r => r.role === 'Region')
    if (regionRole?.expand?.region) {
      return `${regionRole.expand.region.name} Clubs`
    }
    
    // Check for Pending admin
    const pendingRole = adminRoles.find(r => r.role === 'Pending')
    if (pendingRole) return "Pending Approval"
    
    return "All Clubs"
  }

  // CASE 1: Admins always see a static scope label (never a dropdown)
  // Admin role takes precedence over any club memberships
  if (isAdmin) {
    const scopeLabel = getAdminScopeLabel()
    return (
      <Button variant="ghost" disabled className="w-full justify-start gap-2 px-3 opacity-100 cursor-default">
        <School className="h-4 w-4 shrink-0" />
        <span className="truncate">{scopeLabel}</span>
      </Button>
    )
  }

  // CASE 2: Non-admin with multiple memberships - show dropdown
  if (memberships.length > 1) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between gap-2 px-3">
            <div className="flex items-center gap-2 truncate">
              <School className="h-4 w-4 shrink-0" />
              <span className="truncate">{currentClub?.name || "Select Club"}</span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          {memberships.map((m) => (
            <DropdownMenuItem 
              key={m.id} 
              onClick={() => m.expand?.club && setCurrentClub(m.expand.club)}
            >
              {m.expand?.club.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // CASE 3: Non-admin with exactly one membership - show as label
  if (memberships.length === 1) {
    const clubName = memberships[0].expand?.club?.name || "My Club"
    return (
      <Button variant="ghost" disabled className="w-full justify-start gap-2 px-3 opacity-100 cursor-default">
        <School className="h-4 w-4 shrink-0" />
        <span className="truncate">{clubName}</span>
      </Button>
    )
  }

  // CASE 4: Non-admin with no memberships - show nothing
  return null
}
