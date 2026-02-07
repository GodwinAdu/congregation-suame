'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { createBackup, restoreBackup, exportBackupFile } from '@/lib/actions/backup.actions';
import { toast } from 'sonner';

interface BackupClientProps {
  currentUserId: string;
}

export function BackupClient({ currentUserId }: BackupClientProps) {
  const [loading, setLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [csvType, setCsvType] = useState<string>('members');

  const handleExportBackup = async () => {
    setLoading(true);
    try {
      const result = await exportBackupFile(exportFormat, exportFormat === 'csv' ? csvType : undefined);
      if (!result.success) throw new Error(result.error);

      const blob = new Blob([result.data.content], { type: result.data.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.data.filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Backup exported as ${exportFormat.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleRestoreBackup = async () => {
    if (!restoreFile) {
      toast.error('Please select a backup file');
      return;
    }

    setLoading(true);
    try {
      const text = await restoreFile.text();
      const backupData = JSON.parse(text);

      const result = await restoreBackup(backupData);
      if (!result.success) throw new Error(result.error);

      toast.success('Backup restored successfully');
      setRestoreFile(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Backup and restore operations affect all data. Ensure you have proper authorization before proceeding.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download a complete backup of all congregation data including members, groups, territories, and field service reports.
            </p>
            <div>
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON (Complete Backup)</SelectItem>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {exportFormat === 'csv' && (
              <div>
                <Label>Data Type</Label>
                <Select value={csvType} onValueChange={setCsvType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="members">Members</SelectItem>
                    <SelectItem value="groups">Groups</SelectItem>
                    <SelectItem value="territories">Territories</SelectItem>
                    <SelectItem value="reports">Field Service Reports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleExportBackup} disabled={loading} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export as {exportFormat.toUpperCase()}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restore Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Restore congregation data from a previously exported backup file. This will replace all current data.
            </p>
            <div>
              <Label>Select Backup File</Label>
              <Input
                type="file"
                accept=".json"
                onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button
              onClick={handleRestoreBackup}
              disabled={loading || !restoreFile}
              variant="destructive"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Restore Backup
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">What's Included</p>
              <p className="text-sm text-muted-foreground">Members, Groups, Territories, Territory Assignments, Field Service Reports</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Backup Format</p>
              <p className="text-sm text-muted-foreground">JSON format with metadata and timestamps</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium">Important</p>
              <p className="text-sm text-muted-foreground">Store backups securely. They contain sensitive congregation data.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
