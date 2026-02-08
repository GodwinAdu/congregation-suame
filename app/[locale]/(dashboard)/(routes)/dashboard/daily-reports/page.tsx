'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { addDailyReport, getDailyReports, deleteDailyReport, getMonthlySummary } from '@/lib/actions/daily-field-service.actions';
import { getMyBibleStudents } from '@/lib/actions/bible-study-helper.actions';

export default function DailyReportsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [bibleStudies, setBibleStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    sharedInMinistry: false,
    hours: 0,
    placements: 0,
    videos: 0,
    bibleStudyIds: [] as string[],
    comments: ''
  });

  useEffect(() => {
    loadBibleStudies();
    loadMonthData();
  }, [currentMonth]);

  const loadBibleStudies = async () => {
    const result = await getMyBibleStudents();
    if (result.success) {
      setBibleStudies(result.data);
    }
  };

  const loadMonthData = async () => {
    setLoading(true);
    const result = await getMonthlySummary(currentMonth);
    if (result.success) {
      setDailyReports(result.data.dailyReports);
      setMonthlySummary(result.data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await addDailyReport({
      date: selectedDate.toISOString().split('T')[0],
      ...formData
    });

    if (result.success) {
      toast.success('Daily report saved successfully');
      setFormData({ sharedInMinistry: false, hours: 0, placements: 0, videos: 0, bibleStudyIds: [], comments: '' });
      loadMonthData();
    } else {
      toast.error(result.error || 'Failed to save report');
    }
    setLoading(false);
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Delete this daily report?')) return;
    
    const result = await deleteDailyReport(reportId);
    if (result.success) {
      toast.success('Report deleted');
      loadMonthData();
    } else {
      toast.error(result.error || 'Failed to delete');
    }
  };

  const selectedDateReports = dailyReports.filter(r => 
    new Date(r.date).toDateString() === selectedDate.toDateString()
  );

  const datesWithReports = dailyReports.map(r => new Date(r.date).toDateString());

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Daily Field Service Reports</h1>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <Input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="w-36 sm:w-40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                hasReport: (date) => datesWithReports.includes(date.toDateString())
              }}
              modifiersStyles={{
                hasReport: { fontWeight: 'bold', backgroundColor: '#22c55e', color: 'white' }
              }}
            />
          </CardContent>
        </Card>

        {/* Report Entry Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Report for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  id="sharedInMinistry"
                  checked={formData.sharedInMinistry}
                  onChange={(e) => setFormData({ ...formData, sharedInMinistry: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="sharedInMinistry" className="cursor-pointer font-medium">
                  I shared in the ministry today
                </Label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="hours">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="placements">Placements</Label>
                  <Input
                    id="placements"
                    type="number"
                    min="0"
                    value={formData.placements}
                    onChange={(e) => setFormData({ ...formData, placements: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="videos">Videos</Label>
                  <Input
                    id="videos"
                    type="number"
                    min="0"
                    value={formData.videos}
                    onChange={(e) => setFormData({ ...formData, videos: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="col-span-1 sm:col-span-3">
                  <Label>Bible Studies (Select students you studied with)</Label>
                  <div className="space-y-2">
                    {bibleStudies.length === 0 ? (
                      <p className="text-sm text-gray-500">No active Bible studies. Add students in Bible Studies page.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {bibleStudies.map((study) => (
                          <label
                            key={study._id}
                            className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${
                              formData.bibleStudyIds.includes(study._id)
                                ? 'bg-blue-50 border-blue-500'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.bibleStudyIds.includes(study._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    bibleStudyIds: [...formData.bibleStudyIds, study._id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    bibleStudyIds: formData.bibleStudyIds.filter(id => id !== study._id)
                                  });
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm font-medium">{study.studentName}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {formData.bibleStudyIds.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Selected: {formData.bibleStudyIds.length} student(s)
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-3">
                  <Label htmlFor="comments">Comments</Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Save Daily Report
              </Button>
            </form>

            {/* Existing Reports for Selected Date */}
            {selectedDateReports.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="font-semibold">Existing Report:</h3>
                {selectedDateReports.map((report) => (
                  <Card key={report._id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 text-sm">
                        {report.sharedInMinistry && (
                          <p className="text-green-600 font-semibold">✓ Shared in Ministry</p>
                        )}
                        <p><strong>Hours:</strong> {report.hours}</p>
                        <p><strong>Placements:</strong> {report.placements}</p>
                        <p><strong>Videos:</strong> {report.videos}</p>
                        <p><strong>Bible Studies:</strong> {report.bibleStudies}</p>
                        {report.bibleStudyIds && report.bibleStudyIds.length > 0 && (
                          <p className="text-xs text-gray-500">({report.bibleStudyIds.length} student(s) visited)</p>
                        )}
                        {report.comments && <p><strong>Comments:</strong> {report.comments}</p>}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(report._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary */}
      {monthlySummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Monthly Summary - {new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{monthlySummary.totals.hours}</p>
                <p className="text-xs sm:text-sm text-gray-600">Total Hours</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-green-600">{monthlySummary.totals.placements}</p>
                <p className="text-xs sm:text-sm text-gray-600">Placements</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{monthlySummary.totals.videos}</p>
                <p className="text-xs sm:text-sm text-gray-600">Videos</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-orange-600">{monthlySummary.totals.bibleStudies}</p>
                <p className="text-xs sm:text-sm text-gray-600">Bible Studies</p>
              </div>
            </div>
            <p className="mt-4 text-xs sm:text-sm text-gray-600 text-center">
              Based on {dailyReports.length} daily reports • Monthly report auto-updated
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
