import { useTranslation } from 'react-i18next';
import { languages } from '@/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    const selectedLang = languages.find(l => l.code === lang);
    const isRtl = selectedLang?.rtl;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    
    // Apply language-specific font class
    document.documentElement.classList.remove('font-ar', 'font-zh', 'font-default');
    if (lang === 'ar') {
      document.documentElement.classList.add('font-ar');
    } else if (lang === 'zh') {
      document.documentElement.classList.add('font-zh');
    } else {
      document.documentElement.classList.add('font-default');
    }
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-auto gap-2 border-0 bg-transparent hover:bg-muted">
        <Globe className="h-4 w-4" />
        <SelectValue>
          <span>{currentLang.flag}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
