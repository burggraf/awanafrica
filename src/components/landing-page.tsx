import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { CountryToggle } from "@/components/country-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { AuthModal } from "@/components/auth-modal"
import { 
  Users, 
  Trophy, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Layout
} from "lucide-react"

export function LandingPage() {
  const { t } = useTranslation()
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  console.log("LandingPage rendered, isAuthOpen:", isAuthOpen)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <nav className="h-16 border-b sticky top-0 bg-background/80 backdrop-blur-md z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 flex items-center justify-center rounded-sm overflow-hidden bg-white border shrink-0">
            <img src="/logo.svg" alt="AwanAfrica Logo" className="size-full object-cover" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">AwanAfrica</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <ModeToggle />
          <LanguageToggle />
          <CountryToggle />
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => {
              console.log("Login button clicked")
              setIsAuthOpen(true)
            }}
            className="ml-2 bg-[#2563eb] hover:bg-[#1d4ed8]"
          >
            {t("Log In")}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Accents (Awana Colors) */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#ef4444] rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#22c55e] rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2563eb] rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            <span className="text-[#ef4444]">{t("Empowering")}</span> {t("Awana Clubs")} <br className="hidden sm:block" />
            {t("Across")} <span className="text-[#2563eb]">{t("Africa")}</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("The all-in-one management platform for Awana leaders. Track attendance, manage clubs, and scale your impact with precision.")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-8"
              onClick={() => setIsAuthOpen(true)}
            >
              {t("Get Started")} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb]/10"
              onClick={() => {
                const features = document.getElementById('features');
                features?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t("Learn More")}
            </Button>
          </div>
        </div>
      </section>

      {/* Awana Colors Ribbon */}
      <div className="h-2 flex w-full">
        <div className="flex-1 bg-[#ef4444]" /> {/* Red */}
        <div className="flex-1 bg-[#2563eb]" /> {/* Blue */}
        <div className="flex-1 bg-[#22c55e]" /> {/* Green */}
        <div className="flex-1 bg-[#eab308]" /> {/* Yellow */}
      </div>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t("Everything you need to grow")}</h2>
            <p className="text-muted-foreground">{t("Built for the unique needs of ministry in Africa.")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="text-[#ef4444]" />}
              title={t("Member Management")}
              description={t("Keep detailed records of clubbers, parents, and volunteers in one secure location.")}
              border="border-t-[#ef4444]"
            />
            <FeatureCard 
              icon={<Trophy className="text-[#2563eb]" />}
              title={t("Achievement Tracking")}
              description={t("Monitor handbook progress and award badges as clubbers reach their milestones.")}
              border="border-t-[#2563eb]"
            />
            <FeatureCard 
              icon={<MapPin className="text-[#22c55e]" />}
              title={t("Regional Analytics")}
              description={t("Visualize growth across different regions and countries with real-time data.")}
              border="border-t-[#22c55e]"
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-[#eab308]" />}
              title={t("Role-based Access")}
              description={t("Granular permissions for global admins, country leaders, and local club directors.")}
              border="border-t-[#eab308]"
            />
            <FeatureCard 
              icon={<Zap className="text-[#ef4444]" />}
              title={t("Fast Performance")}
              description={t("Designed to work reliably even on slower mobile connections.")}
              border="border-t-[#ef4444]"
            />
            <FeatureCard 
              icon={<Layout className="text-[#2563eb]" />}
              title={t("Modern Interface")}
              description={t("Intuitive, iOS-style layout that feels familiar and professional.")}
              border="border-t-[#2563eb]"
            />
          </div>
        </div>
      </section>

      {/* Trust/Social Proof */}
      <section className="py-20 px-4 border-t border-b bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="size-12 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                   <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="User" />
                </div>
              ))}
            </div>
          </div>
          <h3 className="text-2xl font-semibold mb-4 italic">{t("\"Transforming how we track ministry impact.\"")}</h3>
          <p className="text-muted-foreground">{t("— National Director, Awana Tanzania")}</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto bg-[#2563eb] text-white rounded-3xl p-12 relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 size-64 bg-white/10 rounded-full" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-64 bg-black/10 rounded-full" />
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 relative z-10">{t("Ready to start?")}</h2>
          <p className="text-blue-100 mb-8 text-lg relative z-10">
            {t("Join leaders across Africa using AwanAfrica to reach more kids with the Gospel.")}
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="bg-white text-[#2563eb] hover:bg-blue-50 relative z-10"
            onClick={() => setIsAuthOpen(true)}
          >
            {t("Create Your Account")}
          </Button>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 px-4 border-t bg-muted/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="size-6 flex items-center justify-center rounded-sm overflow-hidden bg-white border">
              <img src="/logo.svg" alt="Logo" className="size-full" />
            </div>
            <span className="font-semibold text-sm">AwanAfrica</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
            <a href="#" className="hover:text-foreground transition-colors">{t("Privacy Policy")}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t("Terms of Service")}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t("Contact Support")}</a>
          </div>

          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AwanAfrica. All rights reserved.
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  )
}

function FeatureCard({ icon, title, description, border }: { icon: React.ReactNode, title: string, description: string, border: string }) {
  const { t } = useTranslation()
  return (
    <div className={`p-8 bg-background border rounded-2xl shadow-sm hover:shadow-md transition-all group ${border} border-t-4`}>
      <div className="size-12 bg-muted rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
      <div className="mt-6 flex items-center text-sm font-semibold text-[#2563eb] cursor-pointer hover:underline">
        {t("Learn more")} <ArrowRight className="ml-1 h-4 w-4" />
      </div>
    </div>
  )
}
