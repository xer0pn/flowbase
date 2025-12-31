import { Label } from '@/components/ui/label';
import { hexToHSL, hslToHex } from '@/lib/colorUtils';

interface ColorPickerProps {
    label: string;
    value: string; // HSL format
    onChange: (hsl: string) => void;
    description?: string;
}

export function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
    const hexValue = hslToHex(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        const hsl = hexToHSL(hex);
        onChange(hsl);
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <input
                        type="color"
                        value={hexValue}
                        onChange={handleChange}
                        className="w-16 h-16 border-2 border-border cursor-pointer"
                        style={{ borderRadius: '0' }}
                    />
                </div>
                <div className="flex-1">
                    <div className="font-mono text-sm">{hexValue.toUpperCase()}</div>
                    <div className="text-xs text-muted-foreground">HSL: {value}</div>
                </div>
            </div>
        </div>
    );
}
