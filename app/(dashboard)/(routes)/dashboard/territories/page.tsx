import React from 'react';
import { TerritoryMap } from './_components/territory-map';
import { TerritoryList } from './_components/territory-list';
import { TerritoryAssignment } from './_components/territory-assignment';
import { TerritoryAnalytics } from './_components/territory-analytics';
import { KMLImporter } from './_components/kml-importer';
import { getTerritories, getTerritoryAssignments } from '@/lib/actions/territory.actions';
import { fetchAllMembers } from '@/lib/actions/user.actions';
import { requirePermission } from '@/lib/helpers/server-permission-check';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function TerritoriesPage() {
  await requirePermission('territoryView');
  
  try {
    const [territories, assignments, members] = await Promise.all([
      getTerritories(),
      getTerritoryAssignments(),
      fetchAllMembers()
    ]);
    
    // Filter publishers (exclude admin roles for territory assignments)
    const publishers = members.filter(member => 
      ['publisher', 'pioneer', 'ministerial servant', 'elder'].includes(member.role.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Territory Management</h1>
          <p className="text-muted-foreground">
            Manage congregation territories, assignments, and track field service progress
          </p>
        </div>

        <Tabs defaultValue="map" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <TerritoryMap territories={territories} assignments={assignments} />
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <TerritoryList territories={territories} assignments={assignments} />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <TerritoryAssignment 
              territories={territories} 
              publishers={publishers} 
              assignments={assignments} 
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <TerritoryAnalytics 
              territories={territories} 
              assignments={assignments} 
            />
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <KMLImporter />
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Territory Management</h1>
          <p className="text-muted-foreground text-red-500">
            Unable to load territory data
          </p>
        </div>
      </div>
    );
  }
}