import { ChevronDown, School } from "lucide-react"
import { useClubs } from "@/lib/club-context"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function ClubSwitcher() {
  const { currentClub, setCurrentClub, memberships } = useClubs()

  if (memberships.length <= 1) return null

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
            onClick={() => setCurrentClub({ id: m.expand?.club.id, name: m.expand?.club.name })}
          >
            {m.expand?.club.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
