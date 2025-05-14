import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type LanguageContextType = {
  language: "en" | "hi";
  toggleLanguage: () => void;
  translate: (text: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

// English to Hindi translations for the most common phrases
const translations: Record<string, string> = {
  // Navbar
  "Home": "होम",
  "About": "हमारे बारे में",
  "Contact": "संपर्क करें",
  "Search Jobs": "नौकरियां खोजें",
  "My Applications": "मेरे आवेदन",
  "Profile": "प्रोफाइल",
  "Post Job": "नौकरी पोस्ट करें",
  "View Applications": "आवेदन देखें",
  "Company Profile": "कंपनी प्रोफाइल",
  "Login": "लॉगिन",
  "Register": "रजिस्टर",
  "Logout": "लॉगआउट",
  
  // Notifications
  "Notifications": "सूचनाएँ",
  "No notifications yet": "अभी कोई सूचना नहीं",
  "Mark all as read": "सभी को पढ़ा हुआ मार्क करें",
  "new": "नया",

  // Auth
  "Worker": "श्रमिक",
  "Employer": "नियोक्ता",
  "Email": "ईमेल",
  "Password": "पासवर्ड",
  "Confirm Password": "पासवर्ड की पुष्टि करें",
  "Remember me": "मुझे याद रखें",
  "Forgot password?": "पासवर्ड भूल गए?",
  "Sign in": "साइन इन करें",
  "First Name": "पहला नाम",
  "Last Name": "अंतिम नाम",
  "Phone Number": "फोन नंबर",
  "Skills": "कौशल",
  "Register as Worker": "श्रमिक के रूप में रजिस्टर करें",
  "Company Name": "कंपनी का नाम",
  "Contact Person": "संपर्क व्यक्ति",
  "Designation": "पद",
  "Business Email": "व्यापार ईमेल",
  "Business Phone": "व्यापार फोन",
  "Industry": "उद्योग",
  "Register as Employer": "नियोक्ता के रूप में रजिस्टर करें",
  "I agree to the": "मैं सहमत हूं",
  "Terms and Conditions": "नियम और शर्तें",

  // Home page
  "Connecting Migrant Workers with Opportunities": "प्रवासी श्रमिकों को अवसरों से जोड़ना",
  "Find jobs, build skills, and secure your future with MigrantMate.": "MigrantMate के साथ नौकरियां खोजें, कौशल बनाएं और अपने भविष्य को सुरक्षित करें।",
  "Find Jobs": "नौकरियां खोजें",
  "Hire Workers": "श्रमिकों को काम पर रखें",
  "How MigrantMate Works": "MigrantMate कैसे काम करता है",
  "Simple steps to connect workers with employers": "श्रमिकों को नियोक्ताओं से जोड़ने के लिए सरल चरण",
  "Create Account": "खाता बनाएं",
  "Register as a worker looking for jobs or an employer looking to hire.": "नौकरी की तलाश में श्रमिक या नियोक्ता के रूप में रजिस्टर करें।",
  "Find Opportunities": "अवसर खोजें",
  "Workers search for jobs. Employers post positions and review applications.": "श्रमिक नौकरियों की खोज करते हैं। नियोक्ता पदों को पोस्ट करते हैं और आवेदनों की समीक्षा करते हैं।",
  "Connect & Work": "जुड़ें और काम करें",
  "Get hired, start working and build your career or find the right talent for your business.": "नौकरी पाएं, काम करना शुरू करें और अपना करियर बनाएं या अपने व्यवसाय के लिए सही प्रतिभा खोजें।",
  "Success Stories": "सफलता की कहानियां",
  "Hear from our community members": "हमारे समुदाय के सदस्यों से सुनें",

  // Footer
  "Connecting migrant workers with fair employment opportunities": "प्रवासी श्रमिकों को उचित रोजगार के अवसरों से जोड़ना",
  "For Workers": "श्रमिकों के लिए",
  "For Employers": "नियोक्ताओं के लिए",
  "Contact Us": "संपर्क करें",
  "All rights reserved.": "सर्वाधिकार सुरक्षित।",

  // Worker routes
  "Available Jobs": "उपलब्ध नौकरियां",
  "Apply Now": "अभी आवेदन करें",
  "My Job Applications": "मेरे नौकरी आवेदन",
  "Status": "स्थिति",
  "Applied On": "आवेदन की तिथि",
  "Pending": "लंबित",
  "Accepted": "स्वीकृत",
  "Rejected": "अस्वीकृत",

  // Employer routes
  "Post a New Job": "एक नई नौकरी पोस्ट करें",
  "Job Title": "नौकरी का शीर्षक",
  "Job Description": "कार्य विवरण",
  "Location": "स्थान",
  "Salary": "वेतन",
  "Job Applications": "नौकरी आवेदन",
  "Applicant": "आवेदक",
  "Action": "कार्रवाई",
  "Accept": "स्वीकार करें",
  "Reject": "अस्वीकार करें",
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<"en" | "hi">("en");

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage === 'hi') {
      setLanguage('hi');
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "hi" : "en";
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Google Translate integration would go here
    // For this implementation, we're using a basic dictionary approach
  };

  const translate = (text: string) => {
    if (language === "en") return text;
    return translations[text] || text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
        translate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
