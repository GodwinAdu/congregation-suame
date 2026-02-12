'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Printer, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ReaderModal from './ReaderModal';
import ReadersTable from './ReadersTable';

export default function ReadersClient({ assignments }: { assignments: any[] }) {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('bible-study');

  const filterAssignments = (data: any[]) => {
    if (!search) return data;
    return data.filter(a => 
      a.reader?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.assistant?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      new Date(a.date).toLocaleDateString().includes(search)
    );
  };

  const bibleStudy = filterAssignments(assignments.filter(a => a.studyType === 'bible-study'));
  const watchtower = filterAssignments(assignments.filter(a => a.studyType === 'watchtower'));

  const handleEdit = (assignment: any) => {
    setEditData(assignment);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (type: string) => {
    const data = type === 'bible-study' ? bibleStudy : watchtower;
    const csv = [
      ['Date', 'Meeting Type', 'Reader', 'Assistant'],
      ...data.map(a => [
        new Date(a.date).toLocaleDateString(),
        a.meetingType,
        a.reader?.fullName || '',
        a.assistant?.fullName || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-readers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const currentData = activeTab === 'bible-study' ? bibleStudy : watchtower;
  const studyTitle = activeTab === 'bible-study' ? 'Bible Study' : 'Watchtower';

  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #print-content { display: block !important; }
          #print-content, #print-content * { visibility: visible; }
          #print-content { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 20px;
          }
          .no-print { display: none !important; }
          @page { 
            margin: 1.5cm;
            size: A4;
          }
        }
      `}</style>
      <Card>
        <CardHeader className="no-print">
          <div className="flex justify-between items-center">
            <CardTitle>Reader Assignments</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Assign Reader
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 no-print">
            <Input
              placeholder="Search by reader, assistant, or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Tabs defaultValue="bible-study" onValueChange={setActiveTab}>
            <TabsList className="no-print">
              <TabsTrigger value="bible-study">Bible Study ({bibleStudy.length})</TabsTrigger>
              <TabsTrigger value="watchtower">Watchtower ({watchtower.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="bible-study" className="space-y-4">
              <div className="flex justify-end no-print">
                <Button variant="outline" size="sm" onClick={() => handleExport('bible-study')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <ReadersTable assignments={bibleStudy} onEdit={handleEdit} />
            </TabsContent>
            <TabsContent value="watchtower" className="space-y-4">
              <div className="flex justify-end no-print">
                <Button variant="outline" size="sm" onClick={() => handleExport('watchtower')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <ReadersTable assignments={watchtower} onEdit={handleEdit} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div id="print-content" style={{ display: 'none' }}>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Reader Assignments</h1>
          <h2 style={{ fontSize: '18px', color: '#666' }}>{studyTitle}</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>Date</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>Meeting</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>Reader</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>Assistant</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>No assignments found</td>
              </tr>
            ) : (
              currentData.map((assignment: any) => (
                <tr key={assignment._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px 8px' }}>{new Date(assignment.date).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 8px', textTransform: 'capitalize' }}>{assignment.meetingType}</td>
                  <td style={{ padding: '10px 8px' }}>{assignment.reader?.fullName}</td>
                  <td style={{ padding: '10px 8px' }}>{assignment.assistant?.fullName || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ReaderModal open={open} onClose={handleClose} editData={editData} />
    </>
  );
}
