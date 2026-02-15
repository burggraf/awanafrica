import { useState, useEffect } from "react"
import { pb } from "@/lib/pb"
import { useAuth } from "@/lib/use-auth"
import { useClubs } from "@/lib/club-context"
import { useAdmin } from "@/lib/admin-context"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useTranslation } from "react-i18next"
import { Search, Check, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StudentWizard } from "./onboarding/student-wizard"
import { PendingStatus } from "./onboarding/pending-status"

interface OnboardingModalInnerProps {
  initialStep?: "onboarding" | "student" | "pending"
}

function OnboardingModalInner({ initialStep = "onboarding" }: OnboardingModalInnerProps) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  
  const [isOpen, setIsOpen] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(initialStep)
  
  // Selection State
  const [selectedRole, setSelectedRole] = useState<"Guardian" | "Leader" | "Admin" | "">("Guardian")
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedClub, setSelectedClub] = useState<any>(null)
  const [adminCountry, setAdminCountry] = useState("")
  const [adminRegion, setAdminRegion] = useState("")
  
  // Data State
  const [countries, setCountries] = useState<any[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [clubs, setClubs] = useState<any[]>([])
  const [clubSearch, setClubSearch] = useState("")
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Fetch Countries
  useEffect(() => {
    pb.collection("countries").getFullList({ sort: "name", requestKey: null })
      .then(setCountries)
      .catch(console.error)
  }, [])

  // Fetch Regions when country changes
  useEffect(() => {
    if (selectedCountry) {
      pb.collection("regions").getFullList({ 
        filter: `country = "${selectedCountry}"`,
        sort: "name",
        requestKey: null
      })
        .then(setRegions)
        .catch(console.error)
      setSelectedRegion("")
      setSelectedClub(null)
    } else {
      setRegions([])
    }
  }, [selectedCountry])

  // Fetch Clubs when region changes
  useEffect(() => {
    if (selectedRegion) {
      pb.collection("clubs").getFullList({ 
        filter: `region = "${selectedRegion}"`,
        sort: "name",
        requestKey: null
      })
        .then(setClubs)
        .catch(console.error)
      setSelectedClub(null)
    } else {
      setClubs([])
    }
  }, [selectedRegion])

  const filteredClubs = clubs.filter(c => 
    c.name.toLowerCase().includes(clubSearch.toLowerCase())
  )

  const handleRegistrationLookup = async () => {
    if (!registrationNumber) return
    setIsSubmitting(true)
    try {
      const club = await pb.collection("clubs").getFirstListItem(`registration = "${registrationNumber}" || joinCode = "${registrationNumber}"`, {
        expand: "region,region.country"
      })
      setSelectedClub(club)
    } catch (error) {
      alert(t("Club with this registration number or code not found."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFinish = async () => {
    if (!selectedRole) return
    setIsSubmitting(true)
    try {
      if (selectedRole === "Admin") {
        const countryId = adminCountry && adminCountry !== "global" ? adminCountry : "";
        const regionId = adminRegion && adminRegion !== "country" ? adminRegion : "";
        
        await pb.collection("admin_roles").create({
          user: user?.id,
          role: "Pending",
          country: countryId,
          region: regionId
        })
        setStep("pending")
      } else {
        if (!selectedClub) return;
        const roleValue = selectedRole === "Guardian" ? "Guardian" : "Pending"
        await pb.collection("club_memberships").create({
          user: user?.id,
          club: selectedClub.id,
          roles: [roleValue]
        })
        
        if (roleValue === "Pending") {
          setStep("pending")
        } else {
          setStep("student")
        }
      }
    } catch (error) {
      console.error(error)
      alert(t("An error occurred while saving your profile. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStudentComplete = async (data: any) => {
    setIsSubmitting(true)
    try {
      // Find the club ID (might be from selectedClub or from existing membership)
      const clubId = selectedClub?.id || (await pb.collection("club_memberships").getFirstListItem(`user = "${user?.id}"`)).club;
      
      await pb.collection("students").create({
        club: clubId,
        guardian: user?.id,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
      })
      setIsOpen(false)
      window.location.reload()
    } catch (error) {
      console.error(error)
      alert(t("Failed to register student."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    setIsOpen(false)
  }

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    setShowLogoutConfirm(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && setShowLogoutConfirm(true)}>
        <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[90vh]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => {
          e.preventDefault()
          setShowLogoutConfirm(true)
        }}>
          {step === "onboarding" && (
            <>
              <DialogHeader className="shrink-0">
                <DialogTitle>{t("Welcome to AwanAfrica")}</DialogTitle>
                <DialogDescription>
                  {t("Let's get your account set up. Please provide your club information or request administrative access.")}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto py-4 space-y-6 min-h-0 px-1">
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground">{t("I am a:")}</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={selectedRole === "Guardian" ? "default" : "outline"} 
                      size="sm"
                      className="flex-1 min-w-[120px]"
                      onClick={() => setSelectedRole("Guardian")}
                    >
                      {t("Parent/Guardian")}
                    </Button>
                    <Button 
                      variant={selectedRole === "Leader" ? "default" : "outline"} 
                      size="sm"
                      className="flex-1 min-w-[100px]"
                      onClick={() => setSelectedRole("Leader")}
                    >
                      {t("Leader")}
                    </Button>
                    <Button 
                      variant={selectedRole === "Admin" ? "default" : "outline"} 
                      size="sm"
                      className="flex-1 min-w-[120px]"
                      onClick={() => setSelectedRole("Admin")}
                    >
                      {t("Administrator")}
                    </Button>
                  </div>
                </div>

                {(selectedRole === "Guardian" || selectedRole === "Leader") && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-3">
                      <Label htmlFor="registration">{t("Enter Club Registration or Join Code")}</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="registration" 
                          placeholder="e.g. TZ000001 or AW1234" 
                          value={registrationNumber} 
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                        />
                        <Button onClick={handleRegistrationLookup} disabled={!registrationNumber || isSubmitting}>
                          {t("Find")}
                        </Button>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">{t("Or search by location")}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t("Country")}</Label>
                        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select Country")} />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedCountry && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                          <Label>{t("Region")}</Label>
                          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                            <SelectTrigger>
                              <SelectValue placeholder={t("Select Region")} />
                            </SelectTrigger>
                            <SelectContent>
                              {regions.map(r => (
                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {selectedRegion && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                          <Label>{t("Select Club")}</Label>
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder={t("Search clubs...")} 
                              className="pl-8" 
                              value={clubSearch}
                              onChange={(e) => setClubSearch(e.target.value)}
                            />
                          </div>
                          <ScrollArea className="h-40 border rounded-md p-2">
                            {filteredClubs.length > 0 ? (
                              <div className="space-y-1">
                                {filteredClubs.map(c => (
                                  <Button 
                                    key={c.id} 
                                    variant={selectedClub?.id === c.id ? "secondary" : "ghost"} 
                                    className="w-full justify-start font-normal h-auto py-2 px-3 text-wrap text-left"
                                    onClick={() => setSelectedClub(c)}
                                  >
                                    <div>
                                      <div className="font-medium">{c.name}</div>
                                      <div className="text-[10px] text-muted-foreground">Registration: {c.registration}</div>
                                    </div>
                                    {selectedClub?.id === c.id && <Check className="ml-auto h-4 w-4 shrink-0" />}
                                  </Button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">{t("No clubs found")}</p>
                            )}
                          </ScrollArea>
                        </div>
                      )}
                    </div>

                    {selectedClub && (
                      <div className="p-3 border rounded-lg bg-primary/5 border-primary/20 animate-in zoom-in-95">
                        <p className="text-[10px] uppercase font-bold text-primary/70 tracking-wider mb-1">{t("Selected Club")}</p>
                        <p className="text-lg font-bold leading-tight">{selectedClub.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedClub.expand?.region?.name || selectedRegion && regions.find(r => r.id === selectedRegion)?.name}, {selectedClub.expand?.region?.expand?.country?.name || selectedCountry && countries.find(c => c.id === selectedCountry)?.name}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedRole === "Admin" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p className="text-xs">
                        {t("Requesting administrative access. This will require manual verification by an existing Global Administrator.")}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t("Target Country (Optional)")}</Label>
                        <Select value={adminCountry} onValueChange={setAdminCountry}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Global Scope")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="global">{t("Global / No specific country")}</SelectItem>
                            {countries.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {adminCountry && adminCountry !== "global" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                          <Label>{t("Target Region (Optional)")}</Label>
                          <Select value={adminRegion} onValueChange={setAdminRegion}>
                            <SelectTrigger>
                              <SelectValue placeholder={t("Country-wide Scope")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="country">{t("Country-wide")}</SelectItem>
                              {regions.map(r => (
                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="shrink-0 pt-4 border-t mt-auto">
                <Button 
                  className="w-full" 
                  disabled={!selectedRole || (selectedRole !== "Admin" && !selectedClub) || isSubmitting} 
                  onClick={handleFinish}
                >
                  {isSubmitting ? t("Saving...") : (selectedRole === "Admin" ? t("Request Access") : t("Complete"))}
                </Button>
              </div>
            </>
          )}

          {step === "student" && (
            <StudentWizard onComplete={handleStudentComplete} onSkip={handleSkip} isSubmitting={isSubmitting} />
          )}

          {step === "pending" && (
            <PendingStatus onClose={handleSkip} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Are you sure you wish to sign out now?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("You will need to complete your profile setup the next time you sign in.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>{t("Sign Out")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/**
 * OnboardingModal acts as a strict guard. 
 * It will not render the actual modal UI until it is 100% certain 
 * that the user needs onboarding.
 */
export function OnboardingModal() {
  const { user } = useAuth()
  const { memberships, isLoading: isClubsLoading } = useClubs()
  const { adminRoles, isLoading: isAdminLoading } = useAdmin()
  
  const [hasSettled, setHasSettled] = useState(false)
  const [studentCount, setStudentCount] = useState<number | null>(null)
  const [isStudentsLoading, setIsStudentsLoading] = useState(false)

  useEffect(() => {
    if (!isClubsLoading && !isAdminLoading) {
      const timer = setTimeout(() => setHasSettled(true), 100)
      return () => clearTimeout(timer)
    } else {
      setHasSettled(false)
    }
  }, [isClubsLoading, isAdminLoading])

  useEffect(() => {
    if (user && hasSettled) {
      setIsStudentsLoading(true)
      pb.collection("students").getList(1, 1, { filter: `guardian = "${user.id}"`, requestKey: null })
        .then(res => setStudentCount(res.totalItems))
        .catch(() => setStudentCount(0))
        .finally(() => setIsStudentsLoading(false))
    }
  }, [user, hasSettled])

  if (!user || isClubsLoading || isAdminLoading || isStudentsLoading || !hasSettled) return null

  const hasMemberships = memberships.length > 0
  const hasApprovedAdminRoles = adminRoles.some(role => role.role !== "Pending")
  const isPending = memberships.some(m => m.roles.includes("Pending")) || adminRoles.some(r => r.role === "Pending")
  
  // 1. If they have approved admin roles, they are done.
  if (hasApprovedAdminRoles) return null

  // 2. If they are pending, show the pending screen.
  if (isPending) return <OnboardingModalInner initialStep="pending" />

  // 3. If they are a Guardian but have no students, show the student wizard.
  const isGuardian = memberships.some(m => m.roles.includes("Guardian"))
  const isStaff = memberships.some(m => m.roles.some(r => ["Director", "Secretary", "Treasurer", "Leader"].includes(r)))
  if (isGuardian && !isStaff && studentCount === 0) return <OnboardingModalInner initialStep="student" />

  // 4. If they have memberships and are NOT pending and NOT a student-less guardian, they are done.
  if (hasMemberships) return null

  // 5. Otherwise, show the full onboarding.
  return <OnboardingModalInner />
}
