"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Heart, Trash2 } from 'lucide-react';
import { PrayerRequest, getAllPrayerRequests, searchPrayerRequests, deletePrayerRequest, getPrayerStats } from '@/lib/db/prayerListDB';
import { PrayerRequestForm } from './prayer-request-form';
import { PrayerRequestCard } from './prayer-request-card';

export function PrayerListClient() {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PrayerRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PrayerRequest | null>(null);
  const [stats, setStats] = useState<{
    totalRequests: number;
    requestsByCategory: Record<string, number>;
    requestsByPriority: Record<string, number>;
  } | null>(null);

  const categories = [
    { value: 'all', label: 'All', color: 'bg-gray-100' },
    { value: 'personal', label: 'Personal', color: 'bg-blue-100' },
    { value: 'family', label: 'Family', color: 'bg-green-100' },
    { value: 'health', label: 'Health', color: 'bg-red-100' },
    { value: 'spiritual', label: 'Spiritual', color: 'bg-purple-100' },
    { value: 'congregation', label: 'Congregation', color: 'bg-yellow-100' },
    { value: 'ministry', label: 'Ministry', color: 'bg-orange-100' },
    { value: 'other', label: 'Other', color: 'bg-gray-100' }
  ];

  const loadData = async () => {
    try {
      const [requests, statistics] = await Promise.all([
        getAllPrayerRequests(),
        getPrayerStats()
      ]);
      setPrayerRequests(requests);
      setStats(statistics);
    } catch (error) {
      console.error('Error loading prayer requests:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filterRequests = async () => {
      let filtered = prayerRequests;

      if (searchQuery.trim()) {
        filtered = await searchPrayerRequests(searchQuery);
      }

      if (selectedCategory !== 'all') {
        filtered = filtered.filter(request => request.category === selectedCategory);
      }

      setFilteredRequests(filtered);
    };

    filterRequests();
  }, [prayerRequests, searchQuery, selectedCategory]);

  const handleRemoveRequest = async (id: string) => {
    try {
      await deletePrayerRequest(id);
      await loadData();
    } catch (error) {
      console.error('Error removing prayer request:', error);
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingRequest(null);
    await loadData();
  };

  const handleEdit = (request: PrayerRequest) => {
    setEditingRequest(request);
    setShowForm(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Prayer List</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Things you want to pray about - remove when done
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Prayer Item
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs md:text-sm font-medium">Total Items</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.totalRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-xs md:text-sm font-medium">High Priority</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.requestsByPriority.high || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-xs md:text-sm font-medium">Medium Priority</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.requestsByPriority.medium || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-xs md:text-sm font-medium">Low Priority</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.requestsByPriority.low || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search prayer items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 mb-4">
          {categories.map((category) => (
            <TabsTrigger
              key={category.value}
              value={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className="text-xs md:text-sm"
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 md:p-8 text-center">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No prayer items found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter'
                    : 'Add your first prayer item to get started'
                  }
                </p>
                {!searchQuery && selectedCategory === 'all' && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Prayer Item
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:gap-4">
              {filteredRequests.map((request) => (
                <PrayerRequestCard
                  key={request.id}
                  request={request}
                  onEdit={handleEdit}
                  onRemove={handleRemoveRequest}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showForm && (
        <PrayerRequestForm
          request={editingRequest}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRequest(null);
          }}
        />
      )}
    </div>
  );
}