'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Loader2, Search, Navigation, Layers, Filter, Phone } from 'lucide-react';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });


interface Member {
  _id: string;
  fullName: string;
  phone?: string;
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

interface InteractiveMapProps {
  members: Member[];
  onMemberSelect?: (member: Member) => void;
}

export function InteractiveMap({ members, onMemberSelect }: InteractiveMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.6745, -1.5716]); // Kumasi, Ghana
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [mapType, setMapType] = useState('street');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Filter members based on search and group
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.location.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = groupFilter === 'all' || member.groupId?.name === groupFilter;
    return matchesSearch && matchesGroup;
  });
  
  // Get unique groups for filter
  const groups = Array.from(new Set(members.map(m => m.groupId?.name).filter(Boolean)));

  useEffect(() => {
    setIsClient(true);
    
    // Calculate center based on filtered member locations
    if (filteredMembers.length > 0) {
      const avgLat = filteredMembers.reduce((sum, member) => sum + member.location.latitude, 0) / filteredMembers.length;
      const avgLng = filteredMembers.reduce((sum, member) => sum + member.location.longitude, 0) / filteredMembers.length;
      setMapCenter([avgLat, avgLng]);
    }
  }, [filteredMembers]);
  
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
  
  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    onMemberSelect?.(member);
  };
  
  const openInGoogleMaps = (member: Member) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${member.location.latitude},${member.location.longitude}`;
    window.open(url, '_blank');
  };
  
  const callMember = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Map
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
    <div className="space-y-4">
      {/* Map Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members or addresses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group} value={group!}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={mapType} onValueChange={setMapType}>
              <SelectTrigger className="w-full sm:w-32">
                <Layers className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="street">Street</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
            <span>Showing {filteredMembers.length} of {members.length} members</span>
            {selectedMember && (
              <Badge variant="secondary">
                Selected: {selectedMember.fullName}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Members Location Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 sm:h-[500px] rounded-lg overflow-hidden">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution={mapType === 'satellite' ? '&copy; Esri' : '&copy; OpenStreetMap contributors'}
                url={getTileLayerUrl()}
              />
              
              {filteredMembers.map((member) => (
                <Marker
                  key={member._id}
                  position={[member.location.latitude, member.location.longitude]}
                  eventHandlers={{
                    click: () => handleMemberClick(member)
                  }}
                >
                  <Popup>
                    <div className="p-3 min-w-64">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-base">{member.fullName}</h4>
                        {member.groupId && (
                          <Badge variant="outline" className="text-xs">
                            {member.groupId.name}
                          </Badge>
                        )}
                      </div>
                      
                      {member.location.address && (
                        <p className="text-sm text-gray-600 mb-2">{member.location.address}</p>
                      )}
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => openInGoogleMaps(member)}
                          className="w-full gap-2"
                        >
                          <Navigation className="h-4 w-4" />
                          Get Directions
                        </Button>
                        
                        {member.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => callMember(member.phone!)}
                            className="w-full gap-2"
                          >
                            <Phone className="h-4 w-4" />
                            Call {member.phone}
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        Updated: {new Date(member.location.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}