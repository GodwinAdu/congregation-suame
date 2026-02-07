"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { assignMembersToGroup, removeMembersFromGroup } from "@/lib/actions/group-assignment.actions";

interface BulkAssignmentViewProps {
  members: any[];
  groups: any[];
  onUpdate: () => void;
}

export default function BulkAssignmentView({ members, groups, onUpdate }: BulkAssignmentViewProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup =
      filterGroup === "all"
        ? true
        : filterGroup === "unassigned"
        ? !member.groupId
        : member.groupId?._id === filterGroup;
    return matchesSearch && matchesGroup;
  });

  const handleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map((m) => m._id));
    }
  };

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleAssign = async () => {
    if (!selectedGroup) {
      toast.error("Please select a group");
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    try {
      setLoading(true);
      await assignMembersToGroup(selectedMembers, selectedGroup);
      toast.success(`Assigned ${selectedMembers.length} members successfully`);
      setSelectedMembers([]);
      setSelectedGroup("");
      onUpdate();
    } catch (error) {
      toast.error("Failed to assign members");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    try {
      setLoading(true);
      await removeMembersFromGroup(selectedMembers);
      toast.success(`Removed ${selectedMembers.length} members from groups`);
      setSelectedMembers([]);
      onUpdate();
    } catch (error) {
      toast.error("Failed to remove members");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Select Members</CardTitle>
          <CardDescription>Choose members to assign to a group</CardDescription>
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterGroup} onValueChange={setFilterGroup}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group._id} value={group._id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 border-b">
              <Checkbox
                checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="font-medium">Select All ({filteredMembers.length})</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {filteredMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                  onClick={() => handleSelectMember(member._id)}
                >
                  <Checkbox
                    checked={selectedMembers.includes(member._id)}
                    onCheckedChange={() => handleSelectMember(member._id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{member.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.groupId?.name || "Unassigned"}
                    </p>
                  </div>
                  {member.pioneerStatus !== "none" && (
                    <Badge variant="secondary">{member.pioneerStatus}</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Actions</CardTitle>
          <CardDescription>
            {selectedMembers.length} member{selectedMembers.length !== 1 ? "s" : ""} selected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign to Group</label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group._id} value={group._id}>
                    {group.name} ({group.memberCount} members)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAssign}
            disabled={loading || selectedMembers.length === 0 || !selectedGroup}
            className="w-full gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Assign to Group
          </Button>

          <Button
            onClick={handleRemove}
            disabled={loading || selectedMembers.length === 0}
            variant="destructive"
            className="w-full gap-2"
          >
            <X className="h-4 w-4" />
            Remove from Groups
          </Button>

          {selectedMembers.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Selected Members:</p>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {selectedMembers.map((id) => {
                  const member = members.find((m) => m._id === id);
                  return (
                    <div key={id} className="text-sm text-muted-foreground">
                      • {member?.fullName}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
