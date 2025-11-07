'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3
} from 'lucide-react';

interface Territory {
  _id: string;
  number: string;
  name: string;
  type: string;
  difficulty: string;
  estimatedHours: number;
  householdCount?: number;
  lastWorked?: string;
}

interface Assignment {
  _id: string;
  territoryId: {
    _id: string;
    number: string;
    type: string;
    difficulty: string;
  };
  publisherId: {
    fullName: string;
  };
  status: string;
  assignedDate: string;
  dueDate?: string;
  hoursWorked?: number;
  householdsVisited?: number;
}

interface TerritoryAnalyticsProps {
  territories: Territory[];
  assignments: Assignment[];
}

export function TerritoryAnalytics({ territories, assignments }: TerritoryAnalyticsProps) {
  // Calculate statistics
  const totalTerritories = territories.length;
  const activeAssignments = assignments.filter(a => a.status === 'assigned').length;
  const availableTerritories = totalTerritories - activeAssignments;
  
  // Overdue assignments
  const overdueAssignments = assignments.filter(a => {
    if (a.status !== 'assigned' || !a.dueDate) return false;
    return new Date(a.dueDate) < new Date();
  }).length;
  
  // Coverage percentage
  const coveragePercentage = totalTerritories > 0 ? (activeAssignments / totalTerritories) * 100 : 0;
  
  // Territory types breakdown
  const typeBreakdown = territories.reduce((acc, territory) => {
    acc[territory.type] = (acc[territory.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Difficulty breakdown
  const difficultyBreakdown = territories.reduce((acc, territory) => {
    acc[territory.difficulty] = (acc[territory.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Work statistics
  const completedAssignments = assignments.filter(a => a.status === 'returned');
  const totalHoursWorked = completedAssignments.reduce((sum, a) => sum + (a.hoursWorked || 0), 0);
  const totalHouseholdsVisited = completedAssignments.reduce((sum, a) => sum + (a.householdsVisited || 0), 0);
  
  // Recently worked territories
  const recentlyWorked = territories
    .filter(t => t.lastWorked)
    .sort((a, b) => new Date(b.lastWorked!).getTime() - new Date(a.lastWorked!).getTime())
    .slice(0, 5);
  
  // Never worked territories
  const neverWorked = territories.filter(t => !t.lastWorked).length;
  
  // Average assignment duration
  const avgAssignmentDays = completedAssignments.length > 0 
    ? completedAssignments.reduce((sum, a) => {
        const assigned = new Date(a.assignedDate);
        const returned = new Date(); // Assuming returned date is now for completed
        const days = Math.ceil((returned.getTime() - assigned.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / completedAssignments.length
    : 0;

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      residential: 'bg-blue-100 text-blue-800',
      business: 'bg-green-100 text-green-800',
      rural: 'bg-yellow-100 text-yellow-800',
      apartment: 'bg-purple-100 text-purple-800',
      mixed: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-blue-100 text-blue-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Territories</p>
                <p className="text-2xl font-bold">{totalTerritories}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Currently Assigned</p>
                <p className="text-2xl font-bold">{activeAssignments}</p>
                <p className="text-xs text-muted-foreground">
                  {coveragePercentage.toFixed(1)}% coverage
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{availableTerritories}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueAssignments}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Territory Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Assigned Territories</span>
              <span>{activeAssignments} of {totalTerritories}</span>
            </div>
            <Progress value={coveragePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {coveragePercentage.toFixed(1)}% of territories are currently assigned
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Territory Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Territory Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(typeBreakdown).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(type)} variant="secondary">
                      {type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(count / totalTerritories) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Difficulty Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(difficultyBreakdown).map(([difficulty, count]) => (
                <div key={difficulty} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(difficulty)} variant="secondary">
                      {difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(count / totalTerritories) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Work Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{totalHoursWorked}</p>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{totalHouseholdsVisited}</p>
                  <p className="text-sm text-muted-foreground">Households Visited</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{completedAssignments.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">{Math.round(avgAssignmentDays)}</p>
                  <p className="text-sm text-muted-foreground">Avg Days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recently Worked */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recently Worked
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentlyWorked.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent territory work</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentlyWorked.map(territory => (
                  <div key={territory._id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">Territory {territory.number}</p>
                      <p className="text-sm text-muted-foreground">{territory.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {new Date(territory.lastWorked!).toLocaleDateString()}
                      </p>
                      <Badge className={getTypeColor(territory.type)} variant="outline">
                        {territory.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {neverWorked > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    {neverWorked} territories have never been worked
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}