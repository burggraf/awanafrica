import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useClubDiscovery } from "@/hooks/use-club-discovery"
import type { ClubsResponse as ClubsResponseType } from "@/types/pocketbase-types"
import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocale } from "@/lib/locale-context"
import { pb } from "@/lib/pb"
import { useToast } from "@/hooks/use-toast"

interface ClubSelectorProps {
  onSelect: (club: ClubsResponseType | null) => void
}

export function ClubSelector({ onSelect }: ClubSelectorProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { isLocating, findNearbyClubs, nearbyClubs } = useClubDiscovery()
  const { availableCountries } = useLocale()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const [isSearchingCode, setIsSearchingCode] = useState(false)
  const [selectedClub, setSelectedClub] = useState<ClubsResponseType | null>(null)
  
  // Filtering state
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [regions, setRegions] = useState<any[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [clubs, setClubs] = useState<ClubsResponseType[]>([])
  const [isLoadingClubs, setIsLoadingClubs] = useState(false)

  // Fetch regions when country changes
  useEffect(() => {
    if (!selectedCountry) {
      setRegions([])
      return
    }
    pb.collection("regions").getFullList({ 
      filter: `country = "${selectedCountry}"`,
      requestKey: null 
    })
      .then(setRegions)
      .catch(err => {
        if (!err.isAbort) console.error(err)
      })
  }, [selectedCountry])

  // Fetch clubs when region changes
  useEffect(() => {
    if (!selectedRegion) {
      setClubs([])
      return
    }
    setIsLoadingClubs(true)
    pb.collection("clubs").getFullList<ClubsResponseType>({ 
      filter: `region = "${selectedRegion}"`,
      sort: "name",
      expand: "region,region.country",
      requestKey: null
    })
      .then(setClubs)
      .catch(err => {
        if (!err.isAbort) console.error(err)
      })
      .finally(() => setIsLoadingClubs(false))
  }, [selectedRegion])

  const handleCodeSubmit = async () => {
    if (!code) return
    setIsSearchingCode(true)
    try {
      const club = await pb.collection("clubs").getFirstListItem<ClubsResponseType>(
        `registration = "${code}" || joinCode = "${code}"`,
        {
          expand: "region,region.country",
          requestKey: null
        }
      )
      
      if (club) {
        setSelectedClub(club)
        onSelect(club)
      } else {
        toast({
          title: t("Invalid Code"),
          description: t("We couldn't find a club with that registration number. Please check and try again."),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("Invalid Code"),
        description: t("We couldn't find a club with that registration number. Please check and try again."),
        variant: "destructive",
      })
    } finally {
      setIsSearchingCode(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Code Entry Option */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input 
            placeholder={t("Registration # (e.g. TZ001234)")} 
            value={code} 
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="pr-10"
          />
          {isSearchingCode && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button variant="secondary" onClick={handleCodeSubmit} disabled={isSearchingCode || !code}>
          {t("Search")}
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("Or find your club")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger>
            <SelectValue placeholder={t("Country")} />
          </SelectTrigger>
          <SelectContent>
            {availableCountries.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedRegion} onValueChange={setSelectedRegion} disabled={!selectedCountry}>
          <SelectTrigger>
            <SelectValue placeholder={t("Region")} />
          </SelectTrigger>
          <SelectContent>
            {regions.map(r => (
              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={!selectedRegion && nearbyClubs.length === 0}
            >
              {selectedClub ? selectedClub.name : t("Select your club...")}
              {isLoadingClubs ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput placeholder={t("Search clubs in this region...")} />
              <CommandList>
                <CommandEmpty>{t("No club found.")}</CommandEmpty>
                <CommandGroup>
                  {(clubs.length > 0 ? clubs : nearbyClubs).map((club) => (
                    <CommandItem
                      key={club.id}
                      value={club.name}
                      onSelect={() => {
                        setSelectedClub(club)
                        onSelect(club)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedClub?.id === club.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{club.name}</span>
                        <span className="text-xs text-muted-foreground">{club.address || club.location}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button 
          variant="ghost" 
          size="sm"
          className="w-full gap-2 text-xs font-normal" 
          onClick={async () => {
            try {
              const clubs = await findNearbyClubs()
              if (clubs.length === 0) {
                toast({
                  title: t("No clubs found"),
                  description: t("No clubs with GPS coordinates were found in our database."),
                })
              } else {
                toast({
                  title: t("Clubs found"),
                  description: t("We found {{count}} clubs near you.", { count: clubs.length }),
                })
                setOpen(true) // Automatically open the list
              }
            } catch (error: any) {
              console.error("Discovery error:", error)
              let message = t("Could not get your location")
              if (error.code === 1) message = t("Location permission denied")
              else if (error.code === 3) message = t("Location request timed out")
              
              toast({
                title: t("Location Error"),
                description: message,
                variant: "destructive"
              })
            }
          }}
          disabled={isLocating}
        >
          {isLocating ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
          {t("Find clubs near me using GPS")}
        </Button>
      </div>
      
      {selectedClub && (
        <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-1">
          <p className="font-medium text-primary text-xs uppercase tracking-wider">{t("Selected Club")}</p>
          <p className="font-bold text-base">{selectedClub.name}</p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>{selectedClub.address || selectedClub.location}</p>
            <p className="flex items-center gap-1">
              <span className="font-semibold">{t("Region")}:</span> 
              {(selectedClub.expand as any)?.region?.name || t("Unknown")}
            </p>
            <p className="flex items-center gap-1">
              <span className="font-semibold">{t("Country")}:</span> 
              {(selectedClub.expand as any)?.region?.expand?.country?.name || t("Unknown")}
            </p>
            <p className="flex items-center gap-1">
              <span className="font-semibold">{t("Registration #")}:</span> 
              {selectedClub.registration}
            </p>
          </div>
          <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-2" onClick={() => {
            setSelectedClub(null)
            onSelect(null)
          }}>
            {t("Change Club")}
          </Button>
        </div>
      )}
    </div>
  )
}
