"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";
import { assignTerritoriesToGroup } from "@/lib/actions/territory-management.actions";
import { toast } from "sonner";

interface GroupAssignViewProps {
  territories: any[];
  groups: any[];
  onUpdate: () => void;
}

export default function GroupAssignView({ territories, groups, onUpdate }: GroupAssignViewProps) {
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelectTerritory = (territoryId: string) => {
    setSelectedTerritories((prev) =>
      prev.includes(territoryId)
        ? prev.filter((id) => id !== territoryId)
        : [...prev, territoryId]
    );
  };

  const handleAssign = async () => {
    if (!selectedGroup) {
      toast.error("Please select a group");
      return;
    }
    if (selectedTerritories.length === 0) {
      toast.error("Please select at least one territory");
      return;
    }

    try {
      setLoading(true);
      await assignTerritoriesToGroup(selectedTerritories, selectedGroup);
      toast.success(`Assigned ${selectedTerritories.length} territories to group`);
      setSelectedTerritories([]);
      setSelectedGroup("");
      onUpdate();
    } catch (error) {
      toast.error("Failed to assign territories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Select Territories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto space-y-2">
            {territories.map((territory) => (
              <div
                key={territory._id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                onClick={() => handleSelectTerritory(territory._id)}
              >
                <Checkbox
                  checked={selectedTerritories.includes(territory._id)}
                  onCheckedChange={() => handleSelectTerritory(territory._id)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{territory.number}</span>
                    <span>-</span>
                    <span>{territory.name}</span>
                  </div>
                  {territory.assignedGroup && (
                    <Badge variant="outline" className="mt-1">
                      {territory.assignedGroup.name}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assign to Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Group</label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group._id} value={group._id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAssign}
            disabled={loading || selectedTerritories.length === 0 || !selectedGroup}
            className="w-full gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Assign {selectedTerritories.length > 0 && `(${selectedTerritories.length})`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
