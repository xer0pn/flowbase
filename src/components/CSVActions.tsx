import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface CSVActionsProps {
  onExport: () => void;
  onImport: (file: File) => Promise<number>;
  transactionCount: number;
}

export function CSVActions({ onExport, onImport, transactionCount }: CSVActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const count = await onImport(file);
      toast.success(`Imported ${count} transactions`);
    } catch (error) {
      toast.error('Failed to import CSV file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = () => {
    if (transactionCount === 0) {
      toast.error('No transactions to export');
      return;
    }
    onExport();
    toast.success('CSV file downloaded');
  };

  return (
    <div className="border-2 border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5" />
        <h3 className="text-lg font-bold uppercase tracking-wide">CSV Storage</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Export your transactions to CSV and save to iCloud Drive. Import to restore.
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleExport}
          className="flex-1 font-bold uppercase tracking-wide"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button
          variant="outline"
          onClick={handleImportClick}
          className="flex-1 font-bold uppercase tracking-wide"
        >
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        {transactionCount} transactions stored locally
      </p>
    </div>
  );
}
