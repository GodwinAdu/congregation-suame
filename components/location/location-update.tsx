'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MapPin, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { updateMyLocation } from '@/lib/actions/location.actions';

interface LocationUpdateProps {
  currentLocation?: {
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    isPublic: boolean;
    lastUpdated: Date | null;
  };
}

export function LocationUpdate({ currentLocation }: LocationUpdateProps) {
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [location, setLocation] = useState({
    latitude: currentLocation?.latitude || '',
    longitude: currentLocation?.longitude || '',
    address: currentLocation?.address || '',
    isPublic: currentLocation?.isPublic || false
  });

  // Auto-request location on component mount
  useEffect(() => {
    if (!currentLocation?.latitude && !currentLocation?.longitude) {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setGettingLocation(false);
        toast.success('Location detected successfully');
      },
      (error) => {
        console.error('Error getting location:', error);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location access denied. Please enable location permissions.');
        } else {
          toast.error('Failed to get current location');
        }
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location.latitude || !location.longitude) {
      toast.error('Please provide latitude and longitude');
      return;
    }

    setLoading(true);
    
    try {
      await updateMyLocation({
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        address: location.address,
        isPublic: location.isPublic
      });
      
      toast.success('Location updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Home Location
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="latitude" className="text-sm font-medium">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={location.latitude}
                onChange={(e) => setLocation(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="e.g., 6.6745"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="longitude" className="text-sm font-medium">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={location.longitude}
                onChange={(e) => setLocation(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="e.g., -1.5716"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="text-sm font-medium">Address (Optional)</Label>
            <Input
              id="address"
              value={location.address}
              onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter your home address"
              className="mt-1"
            />
          </div>

          <div className="flex items-start space-x-3">
            <Switch
              id="isPublic"
              checked={location.isPublic}
              onCheckedChange={(checked) => setLocation(prev => ({ ...prev, isPublic: checked }))}
              className="mt-1"
            />
            <Label htmlFor="isPublic" className="text-sm leading-5">
              Make location visible to elders and overseers
            </Label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="w-full sm:flex-1 text-xs sm:text-sm"
            >
              {gettingLocation ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              <span className="hidden sm:inline">Get Current Location</span>
              <span className="sm:hidden">Get Location</span>
            </Button>
            
            <Button type="submit" disabled={loading} className="w-full sm:flex-1 text-xs sm:text-sm">
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Update Location
            </Button>
          </div>

          {currentLocation?.lastUpdated && (
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Last updated: {new Date(currentLocation.lastUpdated).toLocaleString()}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}