'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createTerritory } from '@/lib/actions/territory.actions';

export function SimpleTerritoryForm() {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    description: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    type: 'residential' as 'residential' | 'business' | 'rural' | 'apartment' | 'mixed',
    estimatedHours: 2,
    householdCount: 0,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number || !formData.name) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsCreating(true);
    try {
      await createTerritory(formData);
      toast.success('Territory created successfully');
      
      // Reset form
      setFormData({
        number: '',
        name: '',
        description: '',
        difficulty: 'medium',
        type: 'residential',
        estimatedHours: 2,
        householdCount: 0,
        notes: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create territory');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Territory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="number">Territory Number *</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="e.g., 1, 2A, 15B"
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Territory Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Downtown Area, Residential District"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Territory Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
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
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={formData.difficulty} onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}>
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

            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="1"
                max="20"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="householdCount">Household Count (Optional)</Label>
              <Input
                id="householdCount"
                type="number"
                min="0"
                value={formData.householdCount}
                onChange={(e) => setFormData({ ...formData, householdCount: Number(e.target.value) })}
                placeholder="Approximate number of households"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the territory boundaries or landmarks"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special instructions or notes for publishers"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isCreating} className="w-full">
            {isCreating ? 'Creating Territory...' : 'Create Territory'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}