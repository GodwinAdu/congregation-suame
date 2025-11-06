'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Phone, Home, Route } from 'lucide-react';
import { InteractiveMap } from '@/components/location/interactive-map';

interface Member {
  _id: string;
  fullName: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    lastUpdated: Date;
  };
  groupId?: string;
}

interface MembersMapProps {
  members: Member[];
}

export function MembersMap({ members }: MembersMapProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const openInMaps = (member: Member) => {
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
      openInMaps(member);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Interactive Map */}
      <div className="lg:col-span-2">
        <InteractiveMap 
          members={members} 
          onMemberSelect={setSelectedMember}
        />
      </div>

      {/* Members List */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Members ({members.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {members.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No member locations available</p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member._id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMember?._id === member._id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{member.fullName}</h4>
                      {member.location.address && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {member.location.address}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {member.location.latitude.toFixed(4)}, {member.location.longitude.toFixed(4)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated: {new Date(member.location.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInMaps(member);
                      }}
                      className="flex-1"
                    >
                      <Home className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        getDirections(member);
                      }}
                      className="flex-1"
                    >
                      <Route className="h-3 w-3 mr-1" />
                      Directions
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Selected Member Details */}
        {selectedMember && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">{selectedMember.fullName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedMember.location.address && (
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm text-muted-foreground">{selectedMember.location.address}</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Coordinates</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedMember.location.latitude}, {selectedMember.location.longitude}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Last Updated</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedMember.location.lastUpdated).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => openInMaps(selectedMember)}
                  className="flex-1"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Open in Maps
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
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}