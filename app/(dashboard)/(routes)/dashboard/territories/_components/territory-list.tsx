'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Users, 
  Clock, 
  Home, 
  Calendar,
  User,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  UserPlus,
  RotateCcw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Territory {
  _id: string;
  number: string;
  name: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'residential' | 'business' | 'rural' | 'apartment' | 'mixed';
  isActive: boolean;
  lastWorked?: string;
  estimatedHours: number;
  householdCount?: number;
}

interface Assignment {
  _id: string;
  territoryId: {
    _id: string;
    number: string;
    name: string;
  };
  publisherId: {
    _id: string;
    fullName: string;
  };
  status: 'assigned' | 'completed' | 'overdue' | 'returned';
  assignedDate: string;
  dueDate?: string;
}

interface TerritoryListProps {
  territories: Territory[];
  assignments: Assignment[];
}

export function TerritoryList({ territories, assignments }: TerritoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get assignment for territory
  const getAssignment = (territoryId: string) => {
    return assignments.find(a => a.territoryId._id === territoryId && a.status === 'assigned');
  };

  // Get territory status
  const getTerritoryStatus = (territory: Territory) => {
    const assignment = getAssignment(territory._id);
    
    if (assignment) {
      const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
      const isOverdue = dueDate && dueDate < new Date();
      return isOverdue ? 'overdue' : 'assigned';
    }
    
    return 'available';
  };

  // Filter territories
  const filteredTerritories = territories.filter(territory => {
    const matchesSearch = territory.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         territory.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const status = getTerritoryStatus(territory);
      matchesStatus = status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'hard': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-amber-100 text-amber-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search territories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'available' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('available')}
              >
                Available
              </Button>
              <Button
                variant={statusFilter === 'assigned' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('assigned')}
              >
                Assigned
              </Button>
              <Button
                variant={statusFilter === 'overdue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('overdue')}
              >
                Overdue
              </Button>
            </div>
          </div>
          
          <div className="mt-3 text-sm text-muted-foreground">
            Showing {filteredTerritories.length} of {territories.length} territories
          </div>
        </CardContent>
      </Card>

      {/* Territory Cards - Mobile */}
      <div className="block sm:hidden space-y-3">
        {filteredTerritories.map((territory) => {
          const assignment = getAssignment(territory._id);
          const status = getTerritoryStatus(territory);
          
          return (
            <Card key={territory._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">Territory {territory.number}</h3>
                    <p className="text-sm text-muted-foreground">{territory.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(status)}>
                      {status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {status === 'available' && (
                          <DropdownMenuItem>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign
                          </DropdownMenuItem>
                        )}
                        {status === 'assigned' && (
                          <DropdownMenuItem>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Return
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    <span>{territory.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{territory.estimatedHours}h</span>
                  </div>
                  {territory.householdCount && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{territory.householdCount} homes</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Badge className={getDifficultyColor(territory.difficulty)} variant="outline">
                      {territory.difficulty}
                    </Badge>
                  </div>
                </div>
                
                {assignment && (
                  <div className="mt-3 p-2 bg-muted rounded text-sm">
                    <div className="flex items-center gap-1 mb-1">
                      <User className="h-3 w-3" />
                      <span className="font-medium">{assignment.publisherId.fullName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Since {new Date(assignment.assignedDate).toLocaleDateString()}</span>
                    </div>
                    {assignment.dueDate && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {territory.lastWorked && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last worked: {new Date(territory.lastWorked).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Territory Table - Desktop */}
      <Card className="hidden sm:block">
        <CardHeader>
          <CardTitle>Territory List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Territory</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Last Worked</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTerritories.map((territory) => {
                const assignment = getAssignment(territory._id);
                const status = getTerritoryStatus(territory);
                
                return (
                  <TableRow key={territory._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">Territory {territory.number}</div>
                        <div className="text-sm text-muted-foreground">{territory.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <span className="capitalize">{territory.type}</span>
                        {territory.householdCount && (
                          <Badge variant="outline">{territory.householdCount} homes</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(territory.difficulty)}>
                        {territory.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(status)}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {assignment ? (
                        <div>
                          <div className="font-medium">{assignment.publisherId.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            Since {new Date(assignment.assignedDate).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {assignment?.dueDate ? (
                        <span className={new Date(assignment.dueDate) < new Date() ? 'text-red-600' : ''}>
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {territory.lastWorked ? (
                        new Date(territory.lastWorked).toLocaleDateString()
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Territory
                          </DropdownMenuItem>
                          {status === 'available' && (
                            <DropdownMenuItem>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign Publisher
                            </DropdownMenuItem>
                          )}
                          {status === 'assigned' && (
                            <DropdownMenuItem>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Return Territory
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}