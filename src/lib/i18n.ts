import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "Models": "Models",
      "Documentation": "Documentation",
      "Settings": "Settings",
      "Toggle theme": "Toggle theme",
      "Language": "Language",
      "English": "English",
      "Swahili": "Swahili",
      "Light": "Light",
      "Dark": "Dark",
      "System": "System",
      "Community": "Community",
      "Profile": "Profile",
      "Log out": "Log out",
      "Log in": "Log in",
      "Register": "Register",
      "Sign In": "Sign In",
      "Access your account": "Access your account",
      "Account": "Account",
      "Welcome to Dashboard": "Welcome to Dashboard",
      "User Profile": "User Profile",
      "Refresh": "Refresh",
      "Switch Account": "Switch Account",
      "App Settings": "App Settings",
      "Account Settings": "Account Settings",
      "Restart App": "Restart App",
      "under construction": "This page is under construction.",
      "scrollable content": "This is some scrollable content to demonstrate the scrolling behavior. Item {{index}} of 20.",
      "Enter your credentials to access your account.": "Enter your credentials to access your account.",
      "Email": "Email",
      "Password": "Password",
      "Forgot password?": "Forgot password?",
      "Create an account": "Create an account",
      "Fill in the details below to create your account.": "Fill in the details below to create your account.",
      "Full Name": "Full Name",
      "Confirm Password": "Confirm Password",
      "Reset password": "Reset password",
      "Send Reset Link": "Send Reset Link",
      "Back to login": "Back to login",
      "Please log in to view your profile.": "Please log in to view your profile.",
      "Remove Avatar": "Remove Avatar",
      "Display Name": "Display Name",
      "This is how others will see you.": "This is how others will see you.",
      "Bio": "Bio",
      "Tell us about yourself": "Tell us about yourself",
      "Save Changes": "Save Changes",
      "Balance": "Balance",
      "Last Login": "Last Login",
      "Notifications": "Notifications",
    }
  },
  sw: {
    translation: {
      "Dashboard": "Dashibodi",
      "Models": "Mifumo",
      "Documentation": "Nyaraka",
      "Settings": "Mipangilio",
      "Toggle theme": "Badili mandhari",
      "Language": "Lugha",
      "English": "Kiingereza",
      "Swahili": "Kiswahili",
      "Light": "Mwangaza",
      "Dark": "Giza",
      "System": "Mfumo",
      "Community": "Jamii",
      "Profile": "Wasifu",
      "Log out": "Ondoka",
      "Log in": "Ingia",
      "Register": "Jisajili",
      "Sign In": "Ingia",
      "Access your account": "Fikia akaunti yako",
      "Account": "Akaunti",
      "Welcome to Dashboard": "Karibu kwenye Dashibodi",
      "User Profile": "Wasifu wa Mtumiaji",
      "Refresh": "Pakia upya",
      "Switch Account": "Badili Akaunti",
      "App Settings": "Mipangilio ya Programu",
      "Account Settings": "Mipangilio ya Akaunti",
      "Restart App": "Washa upya Programu",
      "under construction": "Ukurasa huu bado unajengwa.",
      "scrollable content": "Huu ni maudhui yanayoweza kusogezwa ili kuonyesha tabia ya kusogeza. Kipengele {{index}} cha 20.",
      "Enter your credentials to access your account.": "Ingiza sifa zako ili kufikia akaunti yako.",
      "Email": "Barua pepe",
      "Password": "Nywila",
      "Forgot password?": "Umesahau nywila?",
      "Create an account": "Fungua akaunti",
      "Fill in the details below to create your account.": "Jaza maelezo hapa chini ili kufungua akaunti yako.",
      "Full Name": "Jina Kamili",
      "Confirm Password": "Thibitisha Nywila",
      "Reset password": "Badilisha nywila",
      "Send Reset Link": "Tuma kiungo cha kubadilisha",
      "Back to login": "Rudi kwenye kuingia",
      "Please log in to view your profile.": "Tafadhali ingia ili uone wasifu wako.",
      "Remove Avatar": "Ondoa Picha",
      "Display Name": "Jina la Kuonyeshwa",
      "This is how others will see you.": "Hivi ndivyo wengine watakuona.",
      "Bio": "Wasifu mfupi",
      "Tell us about yourself": "Tuambie kidogo kukuhusu",
      "Save Changes": "Hifadhi Mabadiliko",
      "Balance": "Salio",
      "Last Login": "Kuingia kwa Mwisho",
      "Notifications": "Arifa",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
