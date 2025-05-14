import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <div className="flex items-center">
      <Button
        variant={language === "en" ? "default" : "outline"}
        className={`px-2 py-1 h-auto text-xs font-medium rounded-l-md ${
          language === "en" ? "text-white" : "text-gray-700 bg-gray-200"
        }`}
        onClick={() => language === "hi" && toggleLanguage()}
      >
        EN
      </Button>
      <Button
        variant={language === "hi" ? "default" : "outline"}
        className={`px-2 py-1 h-auto text-xs font-medium rounded-r-md ${
          language === "hi" ? "text-white" : "text-gray-700 bg-gray-200"
        }`}
        onClick={() => language === "en" && toggleLanguage()}
      >
        हिन्दी
      </Button>
    </div>
  );
}
