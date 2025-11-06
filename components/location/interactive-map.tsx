'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Loader2, Search, Navigation, Layers, Filter, Phone, Crown, Shield, Users, User, Star, Maximize, Minimize, X, RotateCcw } from 'lucide-react';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

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

interface InteractiveMapProps {
  members: Member[];
  onMemberSelect?: (member: Member) => void;
}

export function InteractiveMap({ members, onMemberSelect }: InteractiveMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.6745, -1.5716]); // Kumasi, Ghana
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [mapType, setMapType] = useState('street');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Get search suggestions
  const searchSuggestions = searchTerm.length > 0 ? 
    members.filter(member => 
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5) : [];
  
  // Filter and validate members with proper location data
  const validMembers = members.filter(member => {
    return member?.location?.latitude && 
           member?.location?.longitude && 
           !isNaN(member.location.latitude) && 
           !isNaN(member.location.longitude) &&
           Math.abs(member.location.latitude) <= 90 &&
           Math.abs(member.location.longitude) <= 180;
  });
  
  const filteredMembers = validMembers.filter(member => {
    const matchesSearch = member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone?.includes(searchTerm);
    const matchesGroup = groupFilter === 'all' || member.groupId?.name === groupFilter;
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesGroup && matchesRole;
  });
  
  // Get unique groups and roles for filters with validation
  const groups = Array.from(new Set(
    validMembers
      .map(m => m.groupId?.name)
      .filter(Boolean)
      .filter(name => typeof name === 'string' && name.trim().length > 0)
  ));
  
  const roles = Array.from(new Set(
    validMembers
      .map(m => m.role)
      .filter(Boolean)
      .filter(role => typeof role === 'string' && role.trim().length > 0)
  ));

  useEffect(() => {
    setIsClient(true);
    // Delay to ensure Leaflet is fully loaded
    const timer = setTimeout(() => {
      setIsMapReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Calculate center based on filtered member locations with bounds checking
    if (filteredMembers.length > 0) {
      try {
        const validCoords = filteredMembers.filter(member => 
          member.location?.latitude && member.location?.longitude
        );
        
        if (validCoords.length > 0) {
          const avgLat = validCoords.reduce((sum, member) => sum + member.location.latitude, 0) / validCoords.length;
          const avgLng = validCoords.reduce((sum, member) => sum + member.location.longitude, 0) / validCoords.length;
          
          // Validate calculated center
          if (!isNaN(avgLat) && !isNaN(avgLng) && 
              Math.abs(avgLat) <= 90 && Math.abs(avgLng) <= 180) {
            setMapCenter([avgLat, avgLng]);
          }
        }
      } catch (error) {
        console.error('Error calculating map center:', error);
      }
    }
  }, [members.length, searchTerm, groupFilter, roleFilter]);
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setGroupFilter('all');
    setRoleFilter('all');
    setSelectedMember(null);
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
  
  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    onMemberSelect?.(member);
  };
  
  const selectMemberFromSearch = (member: Member) => {
    try {
      if (!member?.fullName || !member?.location?.latitude || !member?.location?.longitude) {
        console.error('Invalid member data for selection');
        return;
      }
      
      setSearchTerm(member.fullName);
      setShowSearchResults(false);
      setSelectedMember(member);
      
      // Validate coordinates before setting map center
      const lat = Number(member.location.latitude);
      const lng = Number(member.location.longitude);
      
      if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        setMapCenter([lat, lng]);
      }
      
      onMemberSelect?.(member);
    } catch (error) {
      console.error('Error selecting member from search:', error);
    }
  };
  
  const openInGoogleMaps = (member: Member) => {
    try {
      if (!member?.location?.latitude || !member?.location?.longitude) {
        console.error('Invalid location data for navigation');
        return;
      }
      
      const lat = Number(member.location.latitude);
      const lng = Number(member.location.longitude);
      
      if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        console.error('Invalid coordinates for navigation');
        return;
      }
      
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening Google Maps:', error);
    }
  };
  
  const callMember = (phone: string) => {
    try {
      if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
        console.error('Invalid phone number');
        return;
      }
      
      // Basic phone number validation
      const cleanPhone = phone.replace(/[^+\d]/g, '');
      if (cleanPhone.length < 7) {
        console.error('Phone number too short');
        return;
      }
      
      window.open(`tel:${cleanPhone}`, '_self');
    } catch (error) {
      console.error('Error initiating phone call:', error);
    }
  };
  
  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return { icon: Crown, color: '#dc2626', bg: '#fef2f2' };
      case 'elder': return { icon: Shield, color: '#7c3aed', bg: '#f3f4f6' };
      case 'ministerial servant': return { icon: Users, color: '#059669', bg: '#f0fdf4' };
      case 'pioneer': return { icon: Star, color: '#ea580c', bg: '#fff7ed' };
      case 'attendant': return { icon: User, color: '#0284c7', bg: '#f0f9ff' };
      default: return { icon: MapPin, color: '#6b7280', bg: '#f9fafb' };
    }
  };
  
  const createCustomIcon = (role: string) => {
    console.log('Creating icon for role:', role);
    
    if (!isMapReady || typeof window === 'undefined' || !(window as any).L || !(window as any).L.DivIcon) {
      console.log('Icon creation failed - requirements not met:', { isMapReady, hasWindow: typeof window !== 'undefined', hasL: !!(window as any)?.L });
      return undefined;
    }
    
    const { color, bg } = getRoleIcon(role);
    console.log('Role icon config:', { role, color, bg });
    
    try {
      const icon = new (window as any).L.DivIcon({
        html: `<div style="background:${bg};border:2px solid ${color};border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;background:${color};border-radius:50%;"></div></div>`,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      });
      console.log('Icon created successfully for role:', role);
      return icon;
    } catch (error) {
      console.error('Error creating icon for role:', role, error);
      return undefined;
    }
  };

  // Loading state
  if (!isClient || !isMapReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded-lg flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // No valid members state
  if (validMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Members Location Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded-lg flex flex-col items-center justify-center gap-3">
            <MapPin className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">No member locations available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Members need to set their home locations to appear on the map
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background flex flex-col' : 'space-y-4'}`}>
      {/* Enhanced Map Controls */}
      <Card className={isFullscreen ? 'rounded-none border-0' : ''}>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchResults(e.target.value.length > 0);
                }}
                onFocus={() => setShowSearchResults(searchTerm.length > 0)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="pl-10 pr-4 text-sm sm:text-base"
              />
              {showSearchResults && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-50 mt-1">
                  {searchSuggestions.map((member) => (
                    <div
                      key={member._id}
                      className="p-2 sm:p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => selectMemberFromSearch(member)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: getRoleIcon(member.role).color }}
                          />
                          <span className="font-medium text-sm sm:text-base truncate">{member.fullName}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 ml-5 sm:ml-0">
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                          {member.groupId && (
                            <Badge variant="secondary" className="text-xs">
                              {member.groupId.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {member.location.address && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 ml-5 sm:ml-0 truncate">{member.location.address}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* Filter Selects */}
              <div className="flex flex-1 gap-2">
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger className="flex-1 h-9 text-xs sm:text-sm">
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <SelectValue placeholder="Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group} value={group!}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="flex-1 h-9 text-xs sm:text-sm">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={mapType} onValueChange={setMapType}>
                  <SelectTrigger className="flex-1 h-9 text-xs sm:text-sm">
                    <Layers className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="street">Street</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetFilters} 
                  className="h-9 px-3 sm:px-2 flex-1 sm:flex-none"
                  title="Reset Filters"
                >
                  <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="ml-1 sm:hidden">Reset</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleFullscreen} 
                  className="h-9 px-3 sm:px-2 flex-1 sm:flex-none"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <Minimize className="h-3 w-3 sm:h-4 sm:w-4" /> : <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />}
                  <span className="ml-1 sm:hidden">{isFullscreen ? "Exit" : "Full"}</span>
                </Button>
                
                {isFullscreen && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsFullscreen(false)} 
                    className="h-9 px-3 sm:px-2 flex-1 sm:flex-none"
                    title="Close Fullscreen"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="ml-1 sm:hidden">Close</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Showing {filteredMembers.length} of {validMembers.length} valid locations
                {validMembers.length < members.length && (
                  <span className="text-amber-600 ml-1">
                    ({members.length - validMembers.length} invalid)
                  </span>
                )}
              </span>
              {selectedMember && (
                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: getRoleIcon(selectedMember.role).color }}
                  />
                  <span className="truncate max-w-32 sm:max-w-none">{selectedMember.fullName}</span>
                </Badge>
              )}
            </div>
            
            {/* Role Legend - Hidden on small screens, shown on larger screens */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              {roles.slice(0, 6).map(role => {
                const { color } = getRoleIcon(role);
                return (
                  <div key={role} className="flex items-center gap-1">
                    <div 
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border" 
                      style={{ backgroundColor: color, borderColor: color }}
                    />
                    <span className="text-xs text-muted-foreground">{role}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modern Interactive Map */}
      {isFullscreen ? (
        <div className="flex-1 w-full">
          <div className="h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] w-full overflow-hidden relative">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution={mapType === 'satellite' ? '&copy; Esri' : '&copy; OpenStreetMap contributors'}
                url={getTileLayerUrl()}
              />
              
              {filteredMembers.map((member) => {
                // Validate member data before rendering
                if (!member?._id || !member?.location?.latitude || !member?.location?.longitude) {
                  console.warn('Skipping invalid member data:', member);
                  return null;
                }
                
                const customIcon = createCustomIcon(member.role);
                const position: [number, number] = [
                  Number(member.location.latitude), 
                  Number(member.location.longitude)
                ];
                
                // Final validation of position
                if (isNaN(position[0]) || isNaN(position[1])) {
                  console.warn('Invalid coordinates for member:', member.fullName);
                  return null;
                }
                
                return (
                  <Marker
                    key={member._id}
                    position={position}
                    {...(customIcon && { icon: customIcon })}
                    eventHandlers={{
                      click: () => handleMemberClick(member)
                    }}
                  >
                  <Popup className="custom-popup">
                    <div className="p-3 sm:p-4 w-64 sm:min-w-72 bg-white rounded-lg shadow-lg">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base sm:text-lg text-gray-900 truncate">{member.fullName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: getRoleIcon(member.role).color }}
                            />
                            <span className="text-xs sm:text-sm font-medium truncate" style={{ color: getRoleIcon(member.role).color }}>
                              {member.role}
                            </span>
                          </div>
                        </div>
                        {member.groupId && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {member.groupId.name}
                          </Badge>
                        )}
                      </div>
                      
                      {member.location.address && (
                        <div className="mb-3 p-2 bg-gray-50 rounded">
                          <p className="text-xs sm:text-sm text-gray-700 break-words">{member.location.address}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 mb-3">
                        <Button
                          size="sm"
                          onClick={() => openInGoogleMaps(member)}
                          className="gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          <Navigation className="h-3 w-3 sm:h-4 sm:w-4" />
                          Directions
                        </Button>
                        
                        {member.phone ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => callMember(member.phone!)}
                            className="gap-1 sm:gap-2 border-green-200 text-green-700 hover:bg-green-50 text-xs sm:text-sm"
                          >
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                            Call
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled className="gap-1 sm:gap-2 text-xs sm:text-sm">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                            No Phone
                          </Button>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 text-center pt-2 border-t">
                        Updated: {member.location.lastUpdated ? 
                          new Date(member.location.lastUpdated).toLocaleDateString() : 
                          'Unknown'
                        }
                      </div>
                    </div>
                  </Popup>
                </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Members Location Map
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-80 sm:h-96 lg:h-[600px] rounded-lg overflow-hidden relative">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  attribution={mapType === 'satellite' ? '&copy; Esri' : '&copy; OpenStreetMap contributors'}
                  url={getTileLayerUrl()}
                />
                
                {filteredMembers.map((member) => {
                  const customIcon = createCustomIcon(member.role);
                  return (
                    <Marker
                      key={member._id}
                      position={[member.location.latitude, member.location.longitude]}
                      {...(customIcon && { icon: customIcon })}
                      eventHandlers={{
                        click: () => handleMemberClick(member)
                      }}
                    >
                    <Popup className="custom-popup">
                      <div className="p-4 min-w-72 bg-white rounded-lg shadow-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-lg text-gray-900">{member.fullName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: getRoleIcon(member.role).color }}
                              />
                              <span className="text-sm font-medium" style={{ color: getRoleIcon(member.role).color }}>
                                {member.role}
                              </span>
                            </div>
                          </div>
                          {member.groupId && (
                            <Badge variant="secondary" className="text-xs">
                              {member.groupId.name}
                            </Badge>
                          )}
                        </div>
                        
                        {member.location.address && (
                          <div className="mb-3 p-2 bg-gray-50 rounded">
                            <p className="text-sm text-gray-700">{member.location.address}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <Button
                            size="sm"
                            onClick={() => openInGoogleMaps(member)}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                          >
                            <Navigation className="h-4 w-4" />
                            Directions
                          </Button>
                          
                          {member.phone ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => callMember(member.phone!)}
                              className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
                            >
                              <Phone className="h-4 w-4" />
                              Call
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled className="gap-2">
                              <Phone className="h-4 w-4" />
                              No Phone
                            </Button>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500 text-center pt-2 border-t">
                          Last updated: {new Date(member.location.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}