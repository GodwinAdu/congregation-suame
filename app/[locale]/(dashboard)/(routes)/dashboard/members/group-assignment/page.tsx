"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Grid3x3, Table2, Shuffle, BarChart3, History, FileDown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  getMembersWithGroups,
  getGroupsWithMemberCount,
  balanceGroups,
} from "@/lib/actions/group-assignment.actions";
import BulkAssignmentView from "./_components/BulkAssignmentView";
import DragDropView from "./_components/DragDropView";
import TableView from "./_components/TableView";
import AnalyticsView from "./_components/AnalyticsView";
import HistoryView from "./_components/HistoryView";
import BalanceDialog from "./_components/BalanceDialog";
import ExportDialog from "./_components/ExportDialog";
import ValidationDialog from "./_components/ValidationDialog";

export default function GroupAssignmentPage() {
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balancing, setBalancing] = useState(false);
  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersData, groupsData] = await Promise.all([
        getMembersWithGroups(),
        getGroupsWithMemberCount(),
      ]);
      setMembers(membersData);
      setGroups(groupsData);
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceGroups = async (strategy: string) => {
    try {
      setBalancing(true);
      await balanceGroups(strategy as any);
      toast.success(`Groups balanced successfully using ${strategy} strategy`);
      await loadData();
      setShowBalanceDialog(false);
    } catch (error) {
      toast.error("Failed to balance groups");
      console.error(error);
    } finally {
      setBalancing(false);
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

        <Card>
          <CardHeader>
            <Skeleton className="h-10 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Group Assignment</h1>
          <p className="text-muted-foreground">
            Assign and manage members across field service groups
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowValidationDialog(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Validate
          </Button>
          <Button
            onClick={() => setShowExportDialog(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => setShowBalanceDialog(true)}
            disabled={balancing}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Shuffle className="h-4 w-4" />
            Balance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
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
              {members.filter((m: any) => !m.groupId).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bulk" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="bulk" className="gap-2">
            <Users className="h-4 w-4" />
            Bulk
          </TabsTrigger>
          <TabsTrigger value="drag" className="gap-2">
            <Grid3x3 className="h-4 w-4" />
            Drag & Drop
          </TabsTrigger>
          <TabsTrigger value="table" className="gap-2">
            <Table2 className="h-4 w-4" />
            Table
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bulk">
          <BulkAssignmentView
            members={members}
            groups={groups}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="drag">
          <DragDropView
            members={members}
            groups={groups}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="table">
          <TableView
            members={members}
            groups={groups}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsView />
        </TabsContent>

        <TabsContent value="history">
          <HistoryView />
        </TabsContent>
      </Tabs>

      <BalanceDialog
        open={showBalanceDialog}
        onClose={() => setShowBalanceDialog(false)}
        onBalance={handleBalanceGroups}
        loading={balancing}
      />

      <ExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />

      <ValidationDialog
        open={showValidationDialog}
        onClose={() => setShowValidationDialog(false)}
      />
    </div>
  );
}
