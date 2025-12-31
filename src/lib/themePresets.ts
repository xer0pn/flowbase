/**
 * Preset theme definitions for quick color scheme selection
 */

export interface ThemePreferences {
    primary: string;      // HSL format: "220 70% 50%"
    accent: string;
    income: string;
    expense: string;
}

export interface PresetTheme {
    id: string;
    name: string;
    description: string;
    colors: {
        light: ThemePreferences;
        dark: ThemePreferences;
    };
}

export const DEFAULT_THEME: ThemePreferences = {
    primary: '0 0% 0%',
    accent: '0 0% 90%',
    income: '142 76% 36%',
    expense: '0 84% 60%',
};

export const DEFAULT_THEME_DARK: ThemePreferences = {
    primary: '0 0% 100%',
    accent: '0 0% 15%',
    income: '142 76% 46%',
    expense: '0 84% 60%',
};

export const PRESET_THEMES: PresetTheme[] = [
    {
        id: 'default',
        name: 'Default',
        description: 'Classic black and white theme',
        colors: {
            light: DEFAULT_THEME,
            dark: DEFAULT_THEME_DARK,
        },
    },
    {
        id: 'ocean',
        name: 'Ocean Blue',
        description: 'Cool blues and teals',
        colors: {
            light: {
                primary: '217 91% 60%',    // Blue
                accent: '189 94% 43%',     // Cyan
                income: '142 76% 36%',     // Green
                expense: '0 84% 60%',      // Red
            },
            dark: {
                primary: '217 91% 70%',
                accent: '189 94% 53%',
                income: '142 76% 46%',
                expense: '0 84% 60%',
            },
        },
    },
    {
        id: 'forest',
        name: 'Forest Green',
        description: 'Natural greens and earth tones',
        colors: {
            light: {
                primary: '142 71% 45%',    // Green
                accent: '84 81% 44%',      // Lime
                income: '158 64% 52%',     // Emerald
                expense: '25 95% 53%',     // Orange
            },
            dark: {
                primary: '142 71% 55%',
                accent: '84 81% 54%',
                income: '158 64% 62%',
                expense: '25 95% 63%',
            },
        },
    },
    {
        id: 'sunset',
        name: 'Sunset Orange',
        description: 'Warm oranges and ambers',
        colors: {
            light: {
                primary: '25 95% 53%',     // Orange
                accent: '43 96% 56%',      // Amber
                income: '142 76% 36%',     // Green
                expense: '0 84% 60%',      // Red
            },
            dark: {
                primary: '25 95% 63%',
                accent: '43 96% 66%',
                income: '142 76% 46%',
                expense: '0 84% 60%',
            },
        },
    },
    {
        id: 'purple',
        name: 'Purple Haze',
        description: 'Rich purples and magentas',
        colors: {
            light: {
                primary: '271 81% 56%',    // Purple
                accent: '316 73% 52%',     // Pink
                income: '189 94% 43%',     // Cyan
                expense: '340 82% 52%',    // Magenta
            },
            dark: {
                primary: '271 81% 66%',
                accent: '316 73% 62%',
                income: '189 94% 53%',
                expense: '340 82% 62%',
            },
        },
    },
];
