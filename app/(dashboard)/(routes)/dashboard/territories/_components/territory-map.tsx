'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Loader2, Search, Maximize, Minimize, X, Users, Clock, Home } from 'lucide-react';

// Dynamically import map components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then(mod => mod.Polygon), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

interface Territory {
  _id: string;
  number: string;
  name: string;
  description?: string;
  boundaries: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
  center: {
    latitude: number;
    longitude: number;
  };
  area?: number;
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

interface TerritoryMapProps {
  territories: Territory[];
  assignments: Assignment[];
}

export function TerritoryMap({ territories, assignments }: TerritoryMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.6745, -1.5716]);

  useEffect(() => {
    setIsClient(true);
    
    // Calculate center based on territories
    if (territories.length > 0) {
      const avgLat = territories.reduce((sum, t) => sum + t.center.latitude, 0) / territories.length;
      const avgLng = territories.reduce((sum, t) => sum + t.center.longitude, 0) / territories.length;
      setMapCenter([avgLat, avgLng]);
    }
  }, [territories]);

  // Filter territories
  const filteredTerritories = territories.filter(territory => {
    const matchesSearch = territory.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         territory.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || territory.type === typeFilter;
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const assignment = assignments.find(a => a.territoryId._id === territory._id && a.status === 'assigned');
      matchesStatus = statusFilter === 'assigned' ? !!assignment : !assignment;
    }
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTerritoryColor = (territory: Territory) => {
    const assignment = assignments.find(a => a.territoryId._id === territory._id && a.status === 'assigned');
    
    if (assignment) {
      const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
      const isOverdue = dueDate && dueDate < new Date();
      return isOverdue ? '#ef4444' : '#f59e0b'; // Red if overdue, amber if assigned
    }
    
    // Color by difficulty if not assigned
    switch (territory.difficulty) {
      case 'easy': return '#22c55e';
      case 'medium': return '#3b82f6';
      case 'hard': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getTerritoryStatus = (territory: Territory) => {
    const assignment = assignments.find(a => a.territoryId._id === territory._id && a.status === 'assigned');
    
    if (assignment) {
      const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
      const isOverdue = dueDate && dueDate < new Date();
      return isOverdue ? 'overdue' : 'assigned';
    }
    
    return 'available';
  };

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Territory Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background flex flex-col' : 'space-y-4'}`}>
      {/* Controls */}
      <Card className={isFullscreen ? 'rounded-none border-0' : ''}>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search territories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex gap-2 flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="rural">Rural</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="px-3"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Available (Easy)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Available (Medium)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Available (Hard)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-amber-500 rounded"></div>
                <span>Assigned</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Overdue</span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Showing {filteredTerritories.length} of {territories.length} territories
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className={`${isFullscreen ? 'flex-1 rounded-none border-0' : ''}`}>
        <CardContent className="p-0">
          <div className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96 sm:h-[600px]'} rounded-lg overflow-hidden`}>
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {filteredTerritories.map((territory) => {
                const color = getTerritoryColor(territory);
                const status = getTerritoryStatus(territory);
                const assignment = assignments.find(a => a.territoryId._id === territory._id && a.status === 'assigned');
                
                return (
                  <Polygon
                    key={territory._id}
                    positions={territory.boundaries.coordinates[0].map(coord => [coord[1], coord[0]])}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.3,
                      weight: 2
                    }}
                    eventHandlers={{
                      click: () => setSelectedTerritory(territory)
                    }}
                  >
                    <Popup>
                      <div className="p-3 min-w-64">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-lg">Territory {territory.number}</h4>
                            <p className="text-sm text-gray-600">{territory.name}</p>
                          </div>
                          <Badge 
                            variant={status === 'available' ? 'secondary' : status === 'overdue' ? 'destructive' : 'default'}
                          >
                            {status}
                          </Badge>
                        </div>
                        
                        {territory.description && (
                          <p className="text-sm mb-2">{territory.description}</p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
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
                            <span className={`w-2 h-2 rounded-full bg-${territory.difficulty === 'easy' ? 'green' : territory.difficulty === 'medium' ? 'blue' : 'purple'}-500`}></span>
                            <span>{territory.difficulty}</span>
                          </div>
                        </div>
                        
                        {assignment && (
                          <div className="mt-2 p-2 bg-gray-50 rounded">
                            <p className="text-xs font-medium">Assigned to: {assignment.publisherId.fullName}</p>
                            <p className="text-xs">Since: {new Date(assignment.assignedDate).toLocaleDateString()}</p>
                            {assignment.dueDate && (
                              <p className="text-xs">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                            )}
                          </div>
                        )}
                        
                        {territory.lastWorked && (
                          <p className="text-xs text-gray-500 mt-2">
                            Last worked: {new Date(territory.lastWorked).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}