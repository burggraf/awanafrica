import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, MapPin, Loader2, ChevronLeft } from "lucide-react"
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
  const { isLocating, findNearbyClubs } = useClubDiscovery()
  const { availableCountries } = useLocale()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const [isSearchingCode, setIsSearchingCode] = useState(false)
  const [selectedClub, setSelectedClub] = useState<ClubsResponseType | null>(null)
  const [discoveryMethod, setDiscoveryMethod] = useState<"none" | "gps" | "code" | "browse">("none")
  const [nearbyClubs, setNearbyClubs] = useState<ClubsResponseType[]>([])
  
  // Filtering state
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [regions, setRegions] = useState<any[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [clubs, setClubs] = useState<ClubsResponseType[]>([])
  const [isLoadingClubs, setIsLoadingClubs] = useState(false)

  // Reset discovery state when method changes
  useEffect(() => {
    if (discoveryMethod === 'none') {
      setSelectedClub(null)
      onSelect(null)
    }
  }, [discoveryMethod])

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

  const handleGPSDiscovery = async () => {
    try {
      const clubs = await findNearbyClubs()
      setNearbyClubs(clubs)
      
      if (clubs.length === 0) {
        toast({
          title: t("No clubs found"),
          description: t("No clubs with GPS coordinates were found in our database."),
        })
      } else if (clubs.length === 1) {
        setSelectedClub(clubs[0])
        onSelect(clubs[0])
        toast({
          title: t("Club found"),
          description: t("Found: {{name}}", { name: clubs[0].name }),
        })
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
  }

  if (discoveryMethod === "none") {
    return (
      <div className="grid grid-cols-1 gap-3">
        <Button 
          variant="outline" 
          className="h-16 justify-start gap-4 px-4 rounded-xl border-2 hover:bg-accent hover:border-primary transition-all"
          onClick={handleGPSDiscovery}
          disabled={isLocating}
          aria-label={t("Find clubs near me using GPS")}
        >
          <div className="bg-primary/10 p-2 rounded-lg" aria-hidden="true">
            {isLocating ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <MapPin className="h-6 w-6 text-primary" />}
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="font-bold">{t("Find clubs near me using GPS")}</span>
            <span className="text-xs text-muted-foreground">{t("Use your location to see nearby clubs")}</span>
          </div>
        </Button>

        {nearbyClubs.length > 0 && !selectedClub && (
          <div className="border rounded-xl p-2 bg-accent/20 space-y-2 animate-in fade-in slide-in-from-top-2">
            <p className="text-xs font-semibold px-2 text-muted-foreground uppercase tracking-wider">
              {t("Clubs Near You")}
            </p>
            <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1" role="list" aria-label={t("Nearby clubs list")}>
              {nearbyClubs.map((club) => (
                <Button
                  key={club.id}
                  variant="ghost"
                  className="w-full justify-start h-auto py-3 px-3 gap-3 rounded-lg border border-transparent hover:border-primary/30 hover:bg-background"
                  onClick={() => {
                    setSelectedClub(club)
                    onSelect(club)
                  }}
                  aria-label={t("Select club: {{name}}", { name: club.name })}
                >
                  <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div className="flex flex-col items-start text-left flex-1 min-w-0">
                    <span className="text-sm font-bold leading-tight truncate w-full">{club.name}</span>
                    <div className="flex items-center justify-between w-full text-[0.7rem] text-muted-foreground mt-0.5">
                      <span className="line-clamp-1 flex-1 pr-2">
                        {club.address || club.location}
                      </span>
                      {(club as any).distance !== undefined && (
                        <span className="shrink-0 font-medium">
                          {Math.round((club as any).distance * 10) / 10} km
                        </span>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-[0.7rem] h-8"
              onClick={() => {
                setNearbyClubs([])
                setDiscoveryMethod("none") 
              }}
              aria-label={t("Clear results")}
            >
              {t("Clear results")}
            </Button>
          </div>
        )}

        <Button 
          variant="outline" 
          className="h-16 justify-start gap-4 px-4 rounded-xl border-2 hover:bg-accent hover:border-primary transition-all"
          onClick={() => setDiscoveryMethod("code")}
          aria-label={t("Enter Club Registration #")}
        >
          <div className="bg-primary/10 p-2 rounded-lg" aria-hidden="true">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="font-bold">{t("Enter Club Registration #")}</span>
            <span className="text-xs text-muted-foreground">{t("If you have your club's code")}</span>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-16 justify-start gap-4 px-4 rounded-xl border-2 hover:bg-accent hover:border-primary transition-all"
          onClick={() => setDiscoveryMethod("browse")}
          aria-label={t("Search for my Club")}
        >
          <div className="bg-primary/10 p-2 rounded-lg" aria-hidden="true">
            <ChevronsUpDown className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="font-bold">{t("Search for my Club")}</span>
            <span className="text-xs text-muted-foreground">{t("Find your club by country and region")}</span>
          </div>
        </Button>

        {selectedClub && (
          <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-1 mt-2">
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
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 text-xs mt-2" 
              onClick={() => {
                setSelectedClub(null)
                onSelect(null)
              }}
              aria-label={t("Change selected club")}
            >
              {t("Change Club")}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-auto p-0 text-xs flex items-center gap-1 mb-2"
        onClick={() => setDiscoveryMethod("none")}
        aria-label={t("Back to search options")}
      >
        <ChevronLeft className="h-3 w-3" aria-hidden="true" />
        {t("Back to search options")}
      </Button>

      {discoveryMethod === "code" && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input 
              placeholder={t("Registration # (e.g. TZ001234)")} 
              value={code} 
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="pr-10"
              aria-label={t("Registration number")}
            />
            {isSearchingCode && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <Button 
            variant="secondary" 
            onClick={handleCodeSubmit} 
            disabled={isSearchingCode || !code}
            aria-label={t("Search by registration number")}
          >
            {t("Search")}
          </Button>
        </div>
      )}

      {discoveryMethod === "browse" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger aria-label={t("Select country")}>
                <SelectValue placeholder={t("Country")} />
              </SelectTrigger>
              <SelectContent>
                {availableCountries.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion} disabled={!selectedCountry}>
              <SelectTrigger aria-label={t("Select region")}>
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
                  disabled={!selectedRegion}
                  aria-label={selectedClub ? t("Current club: {{name}}", { name: selectedClub.name }) : t("Select your club...")}
                >
                  {selectedClub ? selectedClub.name : t("Select your club...")}
                  {isLoadingClubs ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder={t("Search clubs in this region...")} />
                  <CommandList>
                    <CommandEmpty>{t("No club found.")}</CommandEmpty>
                    <CommandGroup>
                      {clubs.map((club) => (
                        <CommandItem
                          key={club.id}
                          value={club.name}
                          onSelect={() => {
                            setSelectedClub(club)
                            onSelect(club)
                            setOpen(false)
                          }}
                          aria-label={t("Select club: {{name}}", { name: club.name })}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedClub?.id === club.id ? "opacity-100" : "opacity-0"
                            )}
                            aria-hidden="true"
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
          </div>
        </>
      )}
      
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
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0 text-xs mt-2" 
            onClick={() => {
              setSelectedClub(null)
              onSelect(null)
            }}
            aria-label={t("Change selected club")}
          >
            {t("Change Club")}
          </Button>
        </div>
      )}
    </div>
  )
}
