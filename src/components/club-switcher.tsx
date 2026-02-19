import { ChevronDown, School, X } from "lucide-react"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()
  const { currentClub, setCurrentClub, memberships } = useClubs()
  const { isAdmin, adminRoles } = useAdmin()

  // Helper to get admin scope label
  const getAdminScopeLabel = () => {
    // Check for Global/Missionary first (highest precedence)
    const globalRole = adminRoles.find(r => r.role === 'Global' || r.role === 'Missionary')
    if (globalRole) return t("All Clubs")
    
    // Check for Country admin
    const countryRole = adminRoles.find(r => r.role === 'Country')
    if (countryRole?.expand?.country) {
      return `${countryRole.expand.country.name} ${t("Clubs")}`
    }
    
    // Check for Region admin
    const regionRole = adminRoles.find(r => r.role === 'Region')
    if (regionRole?.expand?.region) {
      return `${regionRole.expand.region.name} ${t("Clubs")}`
    }
    
    // Check for Pending admin
    const pendingRole = adminRoles.find(r => r.role === 'Pending')
    if (pendingRole) return t("Pending Approval")
    
    return t("All Clubs")
  }

  // Helper to check if membership has only pending role
  const getMembershipLabel = (membership: typeof memberships[0]) => {
    const hasOnlyPending = membership.roles?.length === 1 && membership.roles[0] === 'Pending'
    if (hasOnlyPending) {
      return `${membership.expand?.club?.name} (${t("Pending")})`
    }
    return membership.expand?.club?.name || t("My Club")
  }

  // CASE 1: Admins always see a static scope label (never a dropdown)
  // Admin role takes precedence over any club memberships
  if (isAdmin) {
    const scopeLabel = getAdminScopeLabel()
    return (
      <div className="flex flex-col gap-1 w-full">
        <Button 
          variant="ghost" 
          disabled 
          className="w-full justify-start gap-2 px-3 opacity-100 cursor-default"
          aria-label={`${t("Administrative Scope")}: ${scopeLabel}`}
        >
          <School className="h-4 w-4 shrink-0" />
          <span className="truncate">{scopeLabel}</span>
        </Button>
        {currentClub && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mx-3 justify-between h-7 text-[10px] font-medium"
            onClick={() => setCurrentClub(null)}
            aria-label={t("Clear current club: {{name}}", { name: currentClub.name })}
          >
            <span className="truncate">{currentClub.name}</span>
            <X className="h-3 w-3 shrink-0 opacity-50" />
          </Button>
        )}
      </div>
    )
  }

  // CASE 2: Non-admin with multiple memberships - show dropdown
  if (memberships.length > 1) {
    const triggerLabel = currentClub?.name || t("Select Club")
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between gap-2 px-3"
            aria-label={t("Switch club: current {{name}}", { name: triggerLabel })}
          >
            <div className="flex items-center gap-2 truncate">
              <School className="h-4 w-4 shrink-0" />
              <span className="truncate">{triggerLabel}</span>
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
              {getMembershipLabel(m)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // CASE 3: Non-admin with exactly one membership - show as label
  if (memberships.length === 1) {
    const membership = memberships[0]
    const clubLabel = getMembershipLabel(membership)
    return (
      <Button 
        variant="ghost" 
        disabled 
        className="w-full justify-start gap-2 px-3 opacity-100 cursor-default"
        aria-label={`${t("My Club")}: ${clubLabel}`}
      >
        <School className="h-4 w-4 shrink-0" />
        <span className="truncate">{clubLabel}</span>
      </Button>
    )
  }

  // CASE 4: Non-admin with no memberships - show nothing
  return null
}
