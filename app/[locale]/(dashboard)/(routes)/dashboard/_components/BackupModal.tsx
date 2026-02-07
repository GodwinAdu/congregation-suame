'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Database, Upload, AlertTriangle, CheckCircle2, FileJson } from 'lucide-react';
import { restoreBackup } from '@/lib/actions/backup.actions';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export function BackupModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (file: File | null) => {
    setRestoreFile(file);
    if (file) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        setFileInfo({
          version: data.version,
          timestamp: data.timestamp,
          members: data.data?.members?.length || 0,
          groups: data.data?.groups?.length || 0,
          territories: data.data?.territories?.length || 0
        });
      } catch {
        setFileInfo(null);
        toast.error('Invalid backup file');
      }
    } else {
      setFileInfo(null);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) return;
    setLoading(true);
    setProgress(20);
    try {
      const text = await restoreFile.text();
      setProgress(40);
      const data = JSON.parse(text);
      setProgress(60);
      const result = await restoreBackup(data);
      setProgress(80);
      if (result.success) {
        setProgress(100);
        toast.success('Database restored successfully!');
        setTimeout(() => {
          setOpen(false);
          window.location.reload();
        }, 1000);
      } else {
        toast.error(result.error || 'Restore failed');
        setProgress(0);
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid backup file');
      setProgress(0);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="border-2 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 text-lg font-semibold rounded-xl transition-all duration-300">
          <Database className="h-5 w-5 mr-2" />
          Restore Database
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Database className="h-6 w-6 text-primary" />
            Restore Database
          </DialogTitle>
          <DialogDescription>
            Upload a backup file to restore your congregation data
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              This will replace all current data. Make sure you have a recent backup before proceeding.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Label htmlFor="backup-file" className="text-base font-semibold">Select Backup File</Label>
            <div className="relative">
              <Input 
                id="backup-file"
                type="file" 
                accept=".json" 
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                disabled={loading}
              />
            </div>
          </div>

          {fileInfo && (
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <CheckCircle2 className="h-5 w-5" />
                Valid Backup File
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4 text-green-600" />
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-medium">{fileInfo.version}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium ml-2">{new Date(fileInfo.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{fileInfo.members}</div>
                  <div className="text-xs text-muted-foreground">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{fileInfo.groups}</div>
                  <div className="text-xs text-muted-foreground">Groups</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{fileInfo.territories}</div>
                  <div className="text-xs text-muted-foreground">Territories</div>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Restoring database...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={handleRestore} 
            disabled={!restoreFile || loading} 
            className="w-full h-12 text-base font-semibold"
            variant="destructive"
          >
            <Upload className="h-5 w-5 mr-2" />
            {loading ? 'Restoring...' : 'Restore Database'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
