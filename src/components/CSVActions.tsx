import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface CSVActionsProps {
  onExport: () => void;
  onImport: (file: File) => Promise<number>;
  transactionCount: number;
}

export function CSVActions({ onExport, onImport, transactionCount }: CSVActionsProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const count = await onImport(file);
      toast.success(`${t('dashboard.imported')} ${count} ${t('common.transactions')}`);
    } catch (error) {
      toast.error(t('dashboard.failedToImport'));
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = () => {
    if (transactionCount === 0) {
      toast.error(t('dashboard.noTransactionsToExport'));
      return;
    }
    onExport();
    toast.success(t('dashboard.csvDownloaded'));
  };

  return (
    <div className="border-2 border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5" />
        <h3 className="text-lg font-bold uppercase tracking-wide">{t('dashboard.csvStorage')}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {t('dashboard.csvDescription')}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleExport}
          className="flex-1 font-bold uppercase tracking-wide"
        >
          <Download className="mr-2 h-4 w-4" />
          {t('common.export')}
        </Button>
        <Button
          variant="outline"
          onClick={handleImportClick}
          className="flex-1 font-bold uppercase tracking-wide"
        >
          <Upload className="mr-2 h-4 w-4" />
          {t('common.import')}
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
        {transactionCount} {t('common.transactions')} {t('common.storedLocally')}
      </p>
    </div>
  );
}