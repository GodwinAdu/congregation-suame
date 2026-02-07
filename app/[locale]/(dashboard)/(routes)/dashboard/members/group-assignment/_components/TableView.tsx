"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Save, X } from "lucide-react";
import { toast } from "sonner";
import { assignMembersToGroup, removeMembersFromGroup } from "@/lib/actions/group-assignment.actions";

interface TableViewProps {
  members: any[];
  groups: any[];
  onUpdate: () => void;
}

export default function TableView({ members, groups, onUpdate }: TableViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editedMembers, setEditedMembers] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);

  const filteredMembers = members.filter((member) =>
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGroupChange = (memberId: string, groupId: string | null) => {
    setEditedMembers((prev) => ({
      ...prev,
      [memberId]: groupId,
    }));
  };

  const handleSaveChanges = async () => {
    const changes = Object.entries(editedMembers);
    if (changes.length === 0) {
      toast.info("No changes to save");
      return;
    }

    try {
      setSaving(true);

      const assignPromises = changes
        .filter(([_, groupId]) => groupId !== null)
        .map(([memberId, groupId]) => assignMembersToGroup([memberId], groupId as string));

      const removePromises = changes
        .filter(([_, groupId]) => groupId === null)
        .map(([memberId]) => removeMembersFromGroup([memberId]));

      await Promise.all([...assignPromises, ...removePromises]);

      toast.success(`Updated ${changes.length} member assignments`);
      setEditedMembers({});
      onUpdate();
    } catch (error) {
      toast.error("Failed to save changes");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelChanges = () => {
    setEditedMembers({});
    toast.info("Changes cancelled");
  };

  const hasChanges = Object.keys(editedMembers).length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Table View</CardTitle>
            <CardDescription>Edit group assignments inline</CardDescription>
          </div>
          {hasChanges && (
            <div className="flex gap-2">
              <Button onClick={handleCancelChanges} variant="outline" size="sm" className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSaveChanges} disabled={saving} size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes ({Object.keys(editedMembers).length})
              </Button>
            </div>
          )}
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Member Name</th>
                  <th className="p-3 text-left font-medium">Gender</th>
                  <th className="p-3 text-left font-medium">Pioneer Status</th>
                  <th className="p-3 text-left font-medium">Current Group</th>
                  <th className="p-3 text-left font-medium">Assign to Group</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const currentGroupId = editedMembers[member._id] !== undefined
                    ? editedMembers[member._id]
                    : member.groupId?._id || null;
                  const hasEdit = editedMembers[member._id] !== undefined;

                  return (
                    <tr key={member._id} className={`border-b hover:bg-muted/50 ${hasEdit ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}`}>
                      <td className="p-3 font-medium">{member.fullName}</td>
                      <td className="p-3 text-muted-foreground">{member.gender}</td>
                      <td className="p-3">
                        {member.pioneerStatus !== "none" ? (
                          <Badge variant="secondary">{member.pioneerStatus}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        {member.groupId?.name ? (
                          <Badge variant="outline">{member.groupId.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Select
                          value={currentGroupId || "unassigned"}
                          onValueChange={(value) =>
                            handleGroupChange(member._id, value === "unassigned" ? null : value)
                          }
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {groups.map((group) => (
                              <SelectItem key={group._id} value={group._id}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredMembers.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No members found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
