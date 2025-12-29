import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Upload, FileImage, Trash2, Loader2, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ReceiptUploadProps {
  transactionId: string;
  currentReceiptUrl?: string | null;
  onUploadComplete: (url: string | null) => void;
}

export function ReceiptUpload({ transactionId, currentReceiptUrl, onUploadComplete }: ReceiptUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: t('common.error'),
        description: 'Please upload an image (JPG, PNG, WebP) or PDF file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('common.error'),
        description: 'File size must be less than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${transactionId}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      // Update transaction with receipt URL
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ receipt_url: publicUrl })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      onUploadComplete(publicUrl);
      toast({
        title: t('common.success'),
        description: 'Receipt uploaded successfully!',
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!user || !currentReceiptUrl) return;

    setIsDeleting(true);

    try {
      // Extract file path from URL
      const urlParts = currentReceiptUrl.split('/receipts/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        
        // Delete from storage
        await supabase.storage
          .from('receipts')
          .remove([filePath]);
      }

      // Update transaction to remove receipt URL
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ receipt_url: null })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      onUploadComplete(null);
      toast({
        title: t('common.success'),
        description: 'Receipt deleted successfully!',
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleUpload}
        className="hidden"
      />

      {currentReceiptUrl ? (
        <>
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileImage className="h-4 w-4 mr-1" />
                {t('transactions.viewReceipt')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('transactions.receipt')}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4">
                {currentReceiptUrl.endsWith('.pdf') ? (
                  <a 
                    href={currentReceiptUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open PDF in new tab
                  </a>
                ) : (
                  <img 
                    src={currentReceiptUrl} 
                    alt="Receipt" 
                    className="max-h-[60vh] object-contain rounded-lg"
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-1" />
          )}
          {t('transactions.uploadReceipt')}
        </Button>
      )}
    </div>
  );
}
