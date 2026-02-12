'use client';

import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { deletePublicTalk } from '@/lib/actions/public-talk.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function PublicTalksTable({ talks, onEdit }: any) {
  const router = useRouter();

  const getEventTypeLabel = (type: string) => {
    const labels: any = {
      'public-talk': 'Public Talk',
      'convention': 'Convention',
      'co-visit': 'CO Visit',
      'special-program': 'Special Program',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this talk?')) return;
    try {
      await deletePublicTalk(id);
      toast.success('Talk deleted');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Type</th>
            <th className="text-left p-2">Talk #</th>
            <th className="text-left p-2">Title</th>
            <th className="text-left p-2">Speaker</th>
            <th className="text-left p-2">Chairman</th>
            <th className="text-left p-2">Assistant</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {talks.map((talk: any) => (
            <tr key={talk._id} className="border-b hover:bg-muted/50">
              <td className="p-2">{new Date(talk.date).toLocaleDateString()}</td>
              <td className="p-2">
                <span className="text-xs px-2 py-1 rounded bg-primary/10">
                  {getEventTypeLabel(talk.eventType || 'public-talk')}
                </span>
              </td>
              <td className="p-2">{talk.talkNumber || '-'}</td>
              <td className="p-2">{talk.eventType !== 'public-talk' ? talk.eventTitle : talk.talkTitle}</td>
              <td className="p-2">
                {talk.eventType !== 'public-talk' ? '-' : (
                  talk.isVisitingSpeaker ? (
                    <div>
                      <div className="font-medium">{talk.visitingSpeakerName}</div>
                      <div className="text-xs text-muted-foreground">{talk.visitingCongregation}</div>
                    </div>
                  ) : (
                    talk.speaker?.fullName
                  )
                )}
              </td>
              <td className="p-2">
                {talk.chairman?.fullName || '-'}
              </td>
              <td className="p-2">
                {talk.assistant?.fullName || '-'}
              </td>
              <td className="p-2">
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(talk)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(talk._id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
