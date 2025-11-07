'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  UserPlus, 
  RotateCcw, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { assignTerritory, returnTerritory } from '@/lib/actions/territory.actions';

interface Territory {
  _id: string;
  number: string;
  name: string;
  type: string;
  difficulty: string;
  estimatedHours: number;
}

interface Publisher {
  _id: string;
  fullName: string;
  phone?: string;
  role: string;
}

interface Assignment {
  _id: string;
  territoryId: Territory;
  publisherId: Publisher;
  status: string;
  assignedDate: string;
  dueDate?: string;
}

interface TerritoryAssignmentProps {
  territories: Territory[];
  publishers: Publisher[];
  assignments: Assignment[];
}

export function TerritoryAssignment({ territories, publishers, assignments }: TerritoryAssignmentProps) {
  const [selectedTerritory, setSelectedTerritory] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  
  // Return territory states
  const [returnAssignment, setReturnAssignment] = useState<Assignment | null>(null);
  const [hoursWorked, setHoursWorked] = useState('');
  const [householdsVisited, setHouseholdsVisited] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [isReturning, setIsReturning] = useState(false);

  // Get available territories (not assigned)
  const availableTerritories = territories.filter(territory => 
    !assignments.find(a => a.territoryId._id === territory._id && a.status === 'assigned')
  );

  // Get active assignments
  const activeAssignments = assignments.filter(a => a.status === 'assigned');

  const handleAssignTerritory = async () => {
    if (!selectedTerritory || !selectedPublisher) {
      toast.error('Please select both territory and publisher');
      return;
    }

    setIsAssigning(true);
    try {
      await assignTerritory({
        territoryId: selectedTerritory,
        publisherId: selectedPublisher,
        dueDate,
        notes
      });

      toast.success('Territory assigned successfully');
      
      // Reset form
      setSelectedTerritory('');
      setSelectedPublisher('');
      setDueDate(undefined);
      setNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign territory');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleReturnTerritory = async () => {
    if (!returnAssignment) return;

    setIsReturning(true);
    try {
      await returnTerritory(returnAssignment._id, {
        hoursWorked: hoursWorked ? Number(hoursWorked) : undefined,
        householdsVisited: householdsVisited ? Number(householdsVisited) : undefined,
        notes: returnNotes
      });

      toast.success('Territory returned successfully');
      
      // Reset form
      setReturnAssignment(null);
      setHoursWorked('');
      setHouseholdsVisited('');
      setReturnNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to return territory');
    } finally {
      setIsReturning(false);
    }
  };

  const getStatusColor = (assignment: Assignment) => {
    if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-amber-100 text-amber-800';
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Territory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="territory">Territory</Label>
              <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select territory" />
                </SelectTrigger>
                <SelectContent>
                  {availableTerritories.map(territory => (
                    <SelectItem key={territory._id} value={territory._id}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Territory {territory.number}</span>
                          <Badge variant="outline" className="text-xs">
                            {territory.type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {territory.difficulty}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{territory.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="publisher">Publisher</Label>
              <Select value={selectedPublisher} onValueChange={setSelectedPublisher}>
                <SelectTrigger>
                  <SelectValue placeholder="Select publisher" />
                </SelectTrigger>
                <SelectContent>
                  {publishers.map(publisher => (
                    <SelectItem key={publisher._id} value={publisher._id}>
                      <div className="flex items-center gap-2">
                        <span>{publisher.fullName}</span>
                        <Badge variant="outline" className="text-xs">
                          {publisher.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or notes..."
                rows={3}
              />
            </div>
          </div>

          <Button 
            onClick={handleAssignTerritory}
            disabled={isAssigning || !selectedTerritory || !selectedPublisher}
            className="w-full"
          >
            {isAssigning ? 'Assigning...' : 'Assign Territory'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Active Assignments ({activeAssignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAssignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No territories currently assigned</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAssignments.map(assignment => {
                const daysUntilDue = assignment.dueDate ? getDaysUntilDue(assignment.dueDate) : null;
                const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
                
                return (
                  <div key={assignment._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">
                          Territory {assignment.territoryId.number}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {assignment.territoryId.name}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          Assigned to: {assignment.publisherId.fullName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(assignment)}>
                          {isOverdue ? 'Overdue' : 'Assigned'}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setReturnAssignment(assignment)}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Return
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Return Territory {assignment.territoryId.number}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="hours">Hours Worked</Label>
                                  <Input
                                    id="hours"
                                    type="number"
                                    value={hoursWorked}
                                    onChange={(e) => setHoursWorked(e.target.value)}
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="households">Households Visited</Label>
                                  <Input
                                    id="households"
                                    type="number"
                                    value={householdsVisited}
                                    onChange={(e) => setHouseholdsVisited(e.target.value)}
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="return-notes">Notes</Label>
                                <Textarea
                                  id="return-notes"
                                  value={returnNotes}
                                  onChange={(e) => setReturnNotes(e.target.value)}
                                  placeholder="Any notes about the territory work..."
                                  rows={3}
                                />
                              </div>
                              
                              <Button 
                                onClick={handleReturnTerritory}
                                disabled={isReturning}
                                className="w-full"
                              >
                                {isReturning ? 'Returning...' : 'Return Territory'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}</span>
                      </div>
                      
                      {assignment.dueDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className={isOverdue ? 'text-red-600' : ''}>
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {assignment.territoryId.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Est. {assignment.territoryId.estimatedHours}h</span>
                      </div>
                    </div>
                    
                    {daysUntilDue !== null && (
                      <div className="mt-2 flex items-center gap-1 text-sm">
                        {isOverdue ? (
                          <>
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            <span className="text-red-600">
                              Overdue by {Math.abs(daysUntilDue)} days
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-green-600">
                              {daysUntilDue} days remaining
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}