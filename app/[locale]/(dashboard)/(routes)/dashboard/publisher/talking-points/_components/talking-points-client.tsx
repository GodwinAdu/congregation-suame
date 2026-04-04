'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, BookOpen, Users, MessageCircle, Home, Clock, MoreHorizontal } from 'lucide-react';
import { 
  TalkingPoint, 
  getAllTalkingPoints, 
  searchTalkingPoints, 
  getTalkingPointsByCategory,
  incrementUseCount,
  deleteTalkingPoint 
} from '@/lib/db/talkingPointsDB';
import { TalkingPointForm } from './talking-point-form';
import { TalkingPointCard } from './talking-point-card';

const categories = [
  { id: 'all', label: 'All', icon: BookOpen },
  { id: 'introduction', label: 'Introductions', icon: MessageCircle },
  { id: 'presentation', label: 'Presentations', icon: Users },
  { id: 'return-visit', label: 'Return Visits', icon: Home },
  { id: 'bible-study', label: 'Bible Studies', icon: BookOpen },
  { id: 'informal', label: 'Informal', icon: MessageCircle },
  { id: 'other', label: 'Other', icon: MoreHorizontal }
];

export function TalkingPointsClient() {
  const [talkingPoints, setTalkingPoints] = useState<TalkingPoint[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<TalkingPoint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPoint, setEditingPoint] = useState<TalkingPoint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTalkingPoints();
  }, []);

  useEffect(() => {
    filterPoints();
  }, [talkingPoints, searchQuery, activeCategory]);

  const loadTalkingPoints = async () => {
    try {
      const points = await getAllTalkingPoints();
      setTalkingPoints(points.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
    } catch (error) {
      console.error('Error loading talking points:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPoints = async () => {
    let filtered = talkingPoints;

    if (searchQuery) {
      filtered = await searchTalkingPoints(searchQuery);
    }

    if (activeCategory !== 'all') {
      filtered = filtered.filter(point => point.category === activeCategory);
    }

    setFilteredPoints(filtered);
  };

  const handleUsePoint = async (id: string) => {
    await incrementUseCount(id);
    loadTalkingPoints();
  };

  const handleEditPoint = (point: TalkingPoint) => {
    setEditingPoint(point);
    setShowForm(true);
  };

  const handleDeletePoint = async (id: string) => {
    if (confirm('Are you sure you want to delete this talking point?')) {
      await deleteTalkingPoint(id);
      loadTalkingPoints();
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPoint(null);
    loadTalkingPoints();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Talking Points</h1>
          <p className="text-gray-600 text-sm">Save presentations and scripture combinations</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Talking Point
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search talking points..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-7 h-14">
          {categories.map((category) => {
            const Icon = category.icon;
            const shortLabel = {
              all: 'All', introduction: 'Intro', presentation: 'Present',
              'return-visit': 'Return', 'bible-study': 'Bible', informal: 'Informal', other: 'Other'
            }[category.id] ?? category.label
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex flex-col items-center gap-0.5 px-0.5 py-1.5">
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="text-[9px] leading-none">{shortLabel}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            {filteredPoints.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? 'No results found' : 'No talking points yet'}
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Create your first talking point to get started'
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Talking Point
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredPoints.map((point) => (
                  <TalkingPointCard
                    key={point.id}
                    point={point}
                    onUse={() => handleUsePoint(point.id)}
                    onEdit={() => handleEditPoint(point)}
                    onDelete={() => handleDeletePoint(point.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {showForm && (
        <TalkingPointForm
          point={editingPoint}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}