"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, Scissors, Users, BarChart3, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { getTerritories } from "@/lib/actions/territory.actions";
import { getGroupsWithMemberCount } from "@/lib/actions/group-assignment.actions";
import PrintView from "./_components/PrintView";
import DivideView from "./_components/DivideView";
import GroupAssignView from "./_components/GroupAssignView";
import StatsView from "./_components/StatsView";
import DistributeDialog from "./_components/DistributeDialog";

export default function TerritoryManagementPage() {
  const [territories, setTerritories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDistributeDialog, setShowDistributeDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [territoriesData, groupsData] = await Promise.all([
        getTerritories(),
        getGroupsWithMemberCount(),
      ]);
      setTerritories(territoriesData);
      setGroups(groupsData);
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Territory Management</h1>
          <p className="text-muted-foreground">
            Print, divide, and assign territories to groups
          </p>
        </div>
        <Button
          onClick={() => setShowDistributeDialog(true)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Auto Distribute
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Territories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{territories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {territories.filter((t: any) => !t.assignedGroup).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="print" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="print" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </TabsTrigger>
          <TabsTrigger value="divide" className="gap-2">
            <Scissors className="h-4 w-4" />
            Divide
          </TabsTrigger>
          <TabsTrigger value="assign" className="gap-2">
            <Users className="h-4 w-4" />
            Assign to Groups
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="print">
          <PrintView territories={territories} />
        </TabsContent>

        <TabsContent value="divide">
          <DivideView territories={territories} onUpdate={loadData} />
        </TabsContent>

        <TabsContent value="assign">
          <GroupAssignView
            territories={territories}
            groups={groups}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="stats">
          <StatsView />
        </TabsContent>
      </Tabs>

      <DistributeDialog
        open={showDistributeDialog}
        onClose={() => setShowDistributeDialog(false)}
        onDistribute={loadData}
      />
    </div>
  );
}
