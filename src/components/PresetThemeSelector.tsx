import { PRESET_THEMES, PresetTheme } from '@/lib/themePresets';
import { Button } from '@/components/ui/button';
import { hslToHex } from '@/lib/colorUtils';
import { useTheme } from 'next-themes';
import { Check } from 'lucide-react';

interface PresetThemeSelectorProps {
    onSelect: (preset: PresetTheme) => void;
    currentPresetId?: string;
}

export function PresetThemeSelector({ onSelect, currentPresetId }: PresetThemeSelectorProps) {
    const { theme: mode } = useTheme();
    const isDark = mode === 'dark';

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_THEMES.map((preset) => {
                    const colors = isDark ? preset.colors.dark : preset.colors.light;
                    const isSelected = currentPresetId === preset.id;

                    return (
                        <Button
                            key={preset.id}
                            variant={isSelected ? 'default' : 'outline'}
                            className="h-auto p-4 flex flex-col items-start gap-3 relative"
                            onClick={() => onSelect(preset)}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2">
                                    <Check className="h-4 w-4" />
                                </div>
                            )}

                            <div className="flex gap-2 w-full">
                                <div
                                    className="w-8 h-8 border-2 border-border"
                                    style={{ backgroundColor: hslToHex(colors.primary) }}
                                    title="Primary"
                                />
                                <div
                                    className="w-8 h-8 border-2 border-border"
                                    style={{ backgroundColor: hslToHex(colors.accent) }}
                                    title="Accent"
                                />
                                <div
                                    className="w-8 h-8 border-2 border-border"
                                    style={{ backgroundColor: hslToHex(colors.income) }}
                                    title="Income"
                                />
                                <div
                                    className="w-8 h-8 border-2 border-border"
                                    style={{ backgroundColor: hslToHex(colors.expense) }}
                                    title="Expense"
                                />
                            </div>

                            <div className="text-left">
                                <div className="font-semibold">{preset.name}</div>
                                <div className="text-xs text-muted-foreground">
                                    {preset.description}
                                </div>
                            </div>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
