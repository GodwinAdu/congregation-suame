'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { sendReportReminder, sendBulkReportReminders, fetchSMSLogs } from '@/lib/actions/sms-reminder.actions';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface SMSModalProps {
  open: boolean;
  onClose: () => void;
  recipient?: { phone: string; name: string; month: string; recipientId: string };
  recipients?: Array<{ phone: string; name: string; month: string; recipientId: string }>;
  defaultMessage: string;
}

export default function SMSModal({ open, onClose, recipient, recipients, defaultMessage }: SMSModalProps) {
  const [message, setMessage] = useState(defaultMessage);
  const [loading, setLoading] = useState(false);
  const [smsCount, setSmsCount] = useState(0);

  useEffect(() => {
    if (open && (recipient || recipients)) {
      const month = recipient?.month || recipients?.[0]?.month;
      if (month) {
        fetchSMSLogs(month).then(logs => {
          if (recipient) {
            const count = logs.filter((l: any) => l.recipient._id === recipient.recipientId).length;
            setSmsCount(count);
          } else if (recipients) {
            const recipientIds = recipients.map(r => r.recipientId);
            const count = logs.filter((l: any) => recipientIds.includes(l.recipient._id)).length;
            setSmsCount(count);
          }
        }).catch(() => setSmsCount(0));
      }
    }
  }, [open, recipient, recipients]);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      if (recipient) {
        await sendReportReminder({ ...recipient, message });
        toast.success(`SMS sent to ${recipient.name}`);
      } else if (recipients && recipients.length > 0) {
        await sendBulkReportReminders({ members: recipients, message });
        toast.success(`SMS sent to ${recipients.length} members`);
      }
      setMessage('');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send SMS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Send SMS {recipient ? `to ${recipient.name}` : `to ${recipients?.length || 0} members`}</span>
            {smsCount > 0 && <Badge variant="secondary">{smsCount} sent</Badge>}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Type your message here..."
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length} characters
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleSend} disabled={loading}>
              {loading ? 'Sending...' : 'Send Custom'}
            </Button>
            <Button onClick={() => { setMessage(defaultMessage); setTimeout(handleSend, 0); }} disabled={loading}>
              Send Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
