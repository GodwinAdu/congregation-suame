'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Loader2, Search, Maximize, Minimize, Filter, Users, Phone, Home, Route, ExternalLink, Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Dynamically import map components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });

interface Member {
  _id: string;
  fullName: string;
  phone?: string;
  role: string;
  groupId?: {
    name: string;
  };
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    lastUpdated: Date;
  };
}

interface MembersMapProps {
  members: Member[];
}

// Custom marker component with initials
const MemberMarker = ({ member, onClick }: { member: Member; onClick: () => void }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const createCustomIcon = () => {
    if (typeof window === 'undefined') return null;
    
    const L = require('leaflet');
    const initials = getInitials(member.fullName);
    
    const iconHtml = `
      <div style="
        width: 32px;
        height: 32px;
        background: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        cursor: pointer;
      ">${initials}</div>
    `;
    
    return L.divIcon({
      html: iconHtml,
      className: 'custom-member-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  const icon = createCustomIcon();
  
  if (!icon) return null;

  return (
    <Marker
      position={[member.location.latitude, member.location.longitude]}
      icon={icon}
      eventHandlers={{
        click: onClick
      }}
    >
      <Popup>
        <div className="p-2">
          <h5 className="font-medium">{member.fullName}</h5>
          <p className="text-xs text-gray-600">{member.role}</p>
          {member.phone && (
            <p className="text-xs">{member.phone}</p>
          )}
          {member.location.address && (
            <p className="text-xs text-gray-500">{member.location.address}</p>
          )}
          <div className="flex gap-1 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={onClick}
            >
              <Navigation className="h-3 w-3 mr-1" />
              Navigate
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const { latitude, longitude } = member.location;
                const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
                window.open(url, '_blank');
              }}
              className="flex-1"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Google
            </Button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export function MembersMap({ members }: MembersMapProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.6745, -1.5716]);
  const [mapType, setMapType] = useState('street');
  const [showClusters, setShowClusters] = useState(true);
  const [showRoutes, setShowRoutes] = useState(false);
  const [showMemberList, setShowMemberList] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Calculate center based on members
    if (members.length > 0) {
      const avgLat = members.reduce((sum, m) => sum + m.location.latitude, 0) / members.length;
      const avgLng = members.reduce((sum, m) => sum + m.location.longitude, 0) / members.length;
      setMapCenter([avgLat, avgLng]);
    }
  }, [members]);

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role.toLowerCase() === roleFilter;
    const matchesGroup = groupFilter === 'all' || member.groupId?.name === groupFilter;
    return matchesSearch && matchesRole && matchesGroup;
  });

  // Get unique roles and groups for filters
  const uniqueRoles = [...new Set(members.map(m => m.role))];
  const uniqueGroups = [...new Set(members.map(m => m.groupId?.name).filter(Boolean))];

  const navigateToMember = (member: Member) => {
    setSelectedMember(member);
    if (mapRef.current) {
      mapRef.current.setView([member.location.latitude, member.location.longitude], 16);
    }
  };

  const openInGoogleMaps = (member: Member) => {
    const { latitude, longitude } = member.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const getDirections = (member: Member) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude: currentLat, longitude: currentLng } = position.coords;
        const { latitude, longitude } = member.location;
        const url = `https://www.google.com/maps/dir/${currentLat},${currentLng}/${latitude},${longitude}`;
        window.open(url, '_blank');
      });
    } else {
      openInGoogleMaps(member);
    }
  };

  const resetMapView = () => {
    if (mapRef.current && members.length > 0) {
      const avgLat = members.reduce((sum, m) => sum + m.location.latitude, 0) / members.length;
      const avgLng = members.reduce((sum, m) => sum + m.location.longitude, 0) / members.length;
      mapRef.current.setView([avgLat, avgLng], 12);
    }
  };

  const getTileLayerUrl = () => {
    switch (mapType) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Member Locations
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
    <div className={`${isFullscreen ? 'fixed inset-0 z-40 bg-background flex flex-col' : 'space-y-4'}`}>
      {/* Controls */}
      <Card className={isFullscreen ? 'rounded-none border-0' : ''}>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map(role => (
                    <SelectItem key={role} value={role.toLowerCase()}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {uniqueGroups.map(group => (
                    <SelectItem key={group} value={group!}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={mapType} onValueChange={setMapType}>
                <SelectTrigger>
                  <SelectValue placeholder="Map type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="street">Street Map</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredMembers.length} of {members.length} members
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetMapView}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMemberList(!showMemberList)}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    {showMemberList ? 'Hide' : 'Show'} Members
                  </Button>
                </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Full Width Map */}
      <Card className={isFullscreen ? 'rounded-none border-0 w-screen -mx-6' : ''}>
        <CardContent className="p-0">
          <div className={`${isFullscreen ? 'h-[calc(100vh-200px)] w-screen' : 'h-96 sm:h-[600px]'} ${isFullscreen ? '' : 'rounded-lg'} overflow-hidden relative`}>
            <MapContainer
              ref={mapRef}
              center={mapCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution={mapType === 'satellite' ? '&copy; Esri' : mapType === 'terrain' ? '&copy; OpenTopoMap' : '&copy; OpenStreetMap contributors'}
                url={getTileLayerUrl()}
              />
              
              {filteredMembers.map((member) => (
                <MemberMarker
                  key={member?._id}
                  member={member}
                  onClick={() => navigateToMember(member)}
                />
              ))}
              
              {/* Show selected member circle */}
              {selectedMember && (
                <Circle
                  center={[selectedMember.location.latitude, selectedMember.location.longitude]}
                  radius={200}
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1,
                    weight: 2
                  }}
                />
              )}
            </MapContainer>
            
            {/* Floating Member List - Only show when toggled */}
            {showMemberList && (
              <div className="absolute top-4 left-4 w-80 h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg border z-[400] flex flex-col">
                <div className="p-3 border-b flex items-center justify-between flex-shrink-0">
                  <h3 className="font-semibold text-sm">Members ({filteredMembers.length})</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMemberList(false)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {filteredMembers.map((member) => (
                    <div
                      key={member._id}
                      className={`p-2 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedMember?._id === member._id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => navigateToMember(member)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                          {member.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs truncate">{member.fullName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs px-1 py-0 h-4">{member.role}</Badge>
                            {member.groupId && (
                              <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{member.groupId.name}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              openInGoogleMaps(member);
                            }}
                            className="h-6 w-6 p-0 hover:bg-blue-100"
                            title="Open in Google Maps"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              getDirections(member);
                            }}
                            className="h-6 w-6 p-0 hover:bg-green-100"
                            title="Get Directions"
                          >
                            <Route className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Selected Member Details Panel */}
      {selectedMember && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedMember.fullName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMember(null)}
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Role</Label>
                <p className="text-sm text-muted-foreground">{selectedMember.role}</p>
              </div>
              {selectedMember.groupId && (
                <div>
                  <Label className="text-sm font-medium">Group</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.groupId.name}</p>
                </div>
              )}
              {selectedMember.phone && (
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.phone}</p>
                </div>
              )}
              {selectedMember.location.address && (
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.location.address}</p>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-sm font-medium">Coordinates</Label>
              <p className="text-sm text-muted-foreground">
                {selectedMember.location.latitude.toFixed(6)}, {selectedMember.location.longitude.toFixed(6)}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => openInGoogleMaps(selectedMember)}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Google Maps
              </Button>
              <Button
                onClick={() => getDirections(selectedMember)}
                className="flex-1"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}