import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { languages } from '@/i18n';
import { Loader2, User, Shield, Globe, Palette } from 'lucide-react';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import { ColorPicker } from '@/components/ColorPicker';
import { PresetThemeSelector } from '@/components/PresetThemeSelector';
import { useThemePreferences } from '@/hooks/useThemePreferences';

const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { preferences, darkPreferences, updateColor, applyPreset, resetToDefaults } = useThemePreferences();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const validatePasswordForm = () => {
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.current = t('settings.currentPasswordRequired');
    }

    try {
      passwordSchema.parse(newPassword);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.new = e.errors[0].message;
      }
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirm = t('auth.passwordsNoMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setIsChangingPassword(true);

    // First verify current password by signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: currentPassword,
    });

    if (signInError) {
      toast({
        title: t('common.error'),
        description: t('auth.currentPasswordIncorrect'),
        variant: 'destructive',
      });
      setIsChangingPassword(false);
      return;
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      toast({
        title: t('common.error'),
        description: updateError.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('common.success'),
        description: t('auth.passwordUpdated'),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }

    setIsChangingPassword(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('settings.accountPreferences')}</p>
      </div>

      {/* Profile Section */}
      <Card className="border-2 border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>{t('settings.profile')}</CardTitle>
          </div>
          <CardDescription>{t('settings.accountInfo')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">{t('auth.email')}</Label>
            <p className="text-lg font-medium">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card className="border-2 border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>{t('settings.preferences')}</CardTitle>
          </div>
          <CardDescription>{t('settings.customizeExperience')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>{t('settings.language')}</Label>
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
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
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>{t('settings.theme')}</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t('settings.lightMode')}</SelectItem>
                <SelectItem value="dark">{t('settings.darkMode')}</SelectItem>
                <SelectItem value="system">{t('settings.system')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card className="border-2 border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>{t('settings.appearance')}</CardTitle>
          </div>
          <CardDescription>{t('settings.customizeColors')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Colors */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide">
              {t('settings.themeColors')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorPicker
                label={t('settings.primaryColor')}
                value={theme === 'dark' ? darkPreferences.primary : preferences.primary}
                onChange={(value) => updateColor('primary', value, theme === 'dark')}
                description={t('settings.primaryColorDesc')}
              />
              <ColorPicker
                label={t('settings.accentColor')}
                value={theme === 'dark' ? darkPreferences.accent : preferences.accent}
                onChange={(value) => updateColor('accent', value, theme === 'dark')}
                description={t('settings.accentColorDesc')}
              />
            </div>
          </div>

          <Separator />

          {/* Financial Colors */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide">
              {t('settings.financialColors')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorPicker
                label={t('settings.incomeColor')}
                value={theme === 'dark' ? darkPreferences.income : preferences.income}
                onChange={(value) => updateColor('income', value, theme === 'dark')}
                description={t('settings.incomeColorDesc')}
              />
              <ColorPicker
                label={t('settings.expenseColor')}
                value={theme === 'dark' ? darkPreferences.expense : preferences.expense}
                onChange={(value) => updateColor('expense', value, theme === 'dark')}
                description={t('settings.expenseColorDesc')}
              />
            </div>
          </div>

          <Separator />

          {/* Preset Themes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide">
              {t('settings.presetThemes')}
            </h3>
            <PresetThemeSelector onSelect={applyPreset} />
          </div>

          <Separator />

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={() => {
              resetToDefaults();
              toast({
                title: t('common.success'),
                description: t('settings.themeReset'),
              });
            }}
          >
            {t('settings.resetToDefaults')}
          </Button>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card className="border-2 border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>{t('settings.security')}</CardTitle>
          </div>
          <CardDescription>{t('settings.changePassword')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">{t('settings.currentPassword')}</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
              {errors.current && (
                <p className="text-sm text-destructive">{errors.current}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('auth.newPassword')}</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              {errors.new && (
                <p className="text-sm text-destructive">{errors.new}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
              {errors.confirm && (
                <p className="text-sm text-destructive">{errors.confirm}</p>
              )}
            </div>
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('settings.changePassword')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}