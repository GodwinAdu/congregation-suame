'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Printer, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import PublicTalkModal from './PublicTalkModal';
import PublicTalksTable from './PublicTalksTable';

export default function PublicTalksClient({ talks }: { talks: any[] }) {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [search, setSearch] = useState('');

  const filteredTalks = talks.filter(t => 
    t.talkTitle?.toLowerCase().includes(search.toLowerCase()) ||
    t.talkNumber?.includes(search) ||
    t.speaker?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    t.visitingSpeakerName?.toLowerCase().includes(search.toLowerCase()) ||
    t.assistant?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    new Date(t.date).toLocaleDateString().includes(search)
  );

  const handleEdit = (talk: any) => {
    setEditData(talk);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Talk Number', 'Talk Title', 'Speaker', 'Assistant', 'Notes'],
      ...filteredTalks.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.talkNumber || '',
        t.talkTitle,
        t.isVisitingSpeaker ? t.visitingSpeakerName : t.speaker?.fullName || '',
        t.assistant?.fullName || '',
        t.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `public-talks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Scheduled Talks ({filteredTalks.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Talk
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by title, speaker, assistant, or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <PublicTalksTable talks={filteredTalks} onEdit={handleEdit} />
        </CardContent>
      </Card>

      <PublicTalkModal open={open} onClose={handleClose} editData={editData} />
    </>
  );
}
