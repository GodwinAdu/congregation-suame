'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Navigation } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createTerritory } from '@/lib/actions/territory.actions';
import { toast } from 'sonner';

interface CreateTerritoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTerritoryModal({ open, onClose, onSuccess }: CreateTerritoryModalProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    description: '',
    type: 'residential' as const,
    difficulty: 'medium' as const,
    estimatedHours: 2,
    householdCount: 0,
    latitude: 0,
    longitude: 0
  });

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get current location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createTerritory({
        ...formData,
        isActive: true,
        boundaries: {
          type: 'Polygon',
          coordinates: [[]]
        },
        center: {
          latitude: formData.latitude,
          longitude: formData.longitude
        }
      });
      
      toast.success('Territory created successfully');
      onSuccess();
      onClose();
      setFormData({
        number: '',
        name: '',
        description: '',
        type: 'residential',
        difficulty: 'medium',
        estimatedHours: 2,
        householdCount: 0,
        latitude: 0,
        longitude: 0
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create territory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('territory.create')}</DialogTitle>
          <DialogDescription>
            Add a new territory to the congregation's territory management system.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="number">{t('territory.number')}</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                placeholder="e.g., T-001"
                required
              />
            </div>
            <div>
              <Label htmlFor="name">{t('territory.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Downtown Area"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">{t('territory.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the territory..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">{t('territory.type')}</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty">{t('territory.difficulty')}</Label>
              <Select value={formData.difficulty} onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="1"
                max="8"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 2 }))}
              />
            </div>
            <div>
              <Label htmlFor="householdCount">Household Count</Label>
              <Input
                id="householdCount"
                type="number"
                min="0"
                value={formData.householdCount}
                onChange={(e) => setFormData(prev => ({ ...prev, householdCount: parseInt(e.target.value) || 0 }))}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Territory Center Location</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={loading}
              >
                <Navigation className="h-4 w-4 mr-2" />
                {t('territory.useCurrentLocation')}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g., 40.7128"
                  required
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g., -74.0060"
                  required
                />
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 inline mr-1" />
              You can also search for an address on Google Maps and copy the coordinates from the URL
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.loading') : t('territory.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}