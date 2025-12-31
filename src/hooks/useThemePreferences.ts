import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { ThemePreferences, DEFAULT_THEME, DEFAULT_THEME_DARK, PresetTheme } from '@/lib/themePresets';

const STORAGE_KEY = 'theme-preferences';

/**
 * Hook to manage theme color preferences
 */
export function useThemePreferences() {
    const { theme: mode } = useTheme();
    const [preferences, setPreferences] = useState<ThemePreferences>(DEFAULT_THEME);
    const [darkPreferences, setDarkPreferences] = useState<ThemePreferences>(DEFAULT_THEME_DARK);

    // Load preferences from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.light) setPreferences(parsed.light);
                if (parsed.dark) setDarkPreferences(parsed.dark);
            } catch (e) {
                console.error('Failed to parse theme preferences:', e);
            }
        }
    }, []);

    // Apply colors to CSS variables whenever preferences or mode changes
    useEffect(() => {
        const currentPrefs = mode === 'dark' ? darkPreferences : preferences;
        applyThemeColors(currentPrefs);
    }, [preferences, darkPreferences, mode]);

    // Apply colors to CSS variables
    const applyThemeColors = useCallback((prefs: ThemePreferences) => {
        const root = document.documentElement;
        root.style.setProperty('--primary', prefs.primary);
        root.style.setProperty('--accent', prefs.accent);
        root.style.setProperty('--income', prefs.income);
        root.style.setProperty('--expense', prefs.expense);
    }, []);

    // Save preferences to localStorage
    const savePreferences = useCallback((light: ThemePreferences, dark: ThemePreferences) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ light, dark }));
    }, []);

    // Update a specific color
    const updateColor = useCallback((
        colorKey: keyof ThemePreferences,
        value: string,
        isDark: boolean = false
    ) => {
        if (isDark) {
            const newPrefs = { ...darkPreferences, [colorKey]: value };
            setDarkPreferences(newPrefs);
            savePreferences(preferences, newPrefs);
        } else {
            const newPrefs = { ...preferences, [colorKey]: value };
            setPreferences(newPrefs);
            savePreferences(newPrefs, darkPreferences);
        }
    }, [preferences, darkPreferences, savePreferences]);

    // Apply a preset theme
    const applyPreset = useCallback((preset: PresetTheme) => {
        setPreferences(preset.colors.light);
        setDarkPreferences(preset.colors.dark);
        savePreferences(preset.colors.light, preset.colors.dark);
    }, [savePreferences]);

    // Reset to default theme
    const resetToDefaults = useCallback(() => {
        setPreferences(DEFAULT_THEME);
        setDarkPreferences(DEFAULT_THEME_DARK);
        localStorage.removeItem(STORAGE_KEY);
        applyThemeColors(mode === 'dark' ? DEFAULT_THEME_DARK : DEFAULT_THEME);
    }, [mode, applyThemeColors]);

    return {
        preferences,
        darkPreferences,
        updateColor,
        applyPreset,
        resetToDefaults,
    };
}
