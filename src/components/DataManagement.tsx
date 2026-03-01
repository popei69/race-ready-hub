import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { exportAllData, importData } from '@/lib/storage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface DataManagementProps {
  onImportComplete: () => void;
}

export function DataManagement({ onImportComplete }: DataManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingData, setPendingData] = useState<ReturnType<typeof exportAllData> | null>(null);

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `race-prep-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.races || !data.tasks) {
          toast.error('Invalid backup file — missing races or tasks data.');
          return;
        }
        setPendingData(data);
      } catch {
        toast.error('Could not read file. Please select a valid JSON backup.');
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const confirmImport = () => {
    if (!pendingData) return;
    importData(pendingData);
    setPendingData(null);
    toast.success(`Imported ${pendingData.races?.length ?? 0} race(s) successfully`);
    onImportComplete();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Import</span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <AlertDialog open={!!pendingData} onOpenChange={(open) => !open && setPendingData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Import backup data?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will merge {pendingData?.races?.length ?? 0} race(s) and{' '}
              {pendingData?.tasks?.length ?? 0} task(s) into your existing data. Matching items will
              be overwritten.
              {pendingData?.exported_at && (
                <span className="block mt-1 text-xs">
                  Backup from: {new Date(pendingData.exported_at).toLocaleDateString()}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>Import</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
