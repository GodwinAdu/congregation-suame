"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { assignMembersToGroup, removeMembersFromGroup } from "@/lib/actions/group-assignment.actions";

interface DragDropViewProps {
  members: any[];
  groups: any[];
  onUpdate: () => void;
}

export default function DragDropView({ members, groups, onUpdate }: DragDropViewProps) {
  const [draggedMember, setDraggedMember] = useState<any>(null);

  const unassignedMembers = members.filter((m) => !m.groupId);

  const getMembersInGroup = (groupId: string) => {
    return members.filter((m) => m.groupId?._id === groupId);
  };

  const handleDragStart = (e: React.DragEvent, member: any) => {
    setDraggedMember(member);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, groupId: string | null) => {
    e.preventDefault();
    if (!draggedMember) return;

    try {
      if (groupId) {
        await assignMembersToGroup([draggedMember._id], groupId);
        toast.success(`Assigned ${draggedMember.fullName} to group`);
      } else {
        await removeMembersFromGroup([draggedMember._id]);
        toast.success(`Removed ${draggedMember.fullName} from group`);
      }
      onUpdate();
    } catch (error) {
      toast.error("Failed to update member assignment");
      console.error(error);
    } finally {
      setDraggedMember(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        className="border-dashed"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, null)}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Unassigned ({unassignedMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {unassignedMembers.map((member) => (
                <div
                  key={member._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, member)}
                  className="p-3 rounded-lg border bg-card hover:bg-accent cursor-move flex items-center gap-2"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.fullName}</p>
                    <p className="text-xs text-muted-foreground">{member.gender}</p>
                  </div>
                  {member.pioneerStatus !== "none" && (
                    <Badge variant="secondary" className="text-xs">
                      {member.pioneerStatus}
                    </Badge>
                  )}
                </div>
              ))}
              {unassignedMembers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No unassigned members
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {groups.map((group) => {
        const groupMembers = getMembersInGroup(group._id);
        return (
          <Card
            key={group._id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, group._id)}
            className="border-primary/20"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {group.name}
                </span>
                <Badge variant="outline">{groupMembers.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {groupMembers.map((member) => (
                    <div
                      key={member._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, member)}
                      className="p-3 rounded-lg border bg-card hover:bg-accent cursor-move flex items-center gap-2"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{member.fullName}</p>
                        <p className="text-xs text-muted-foreground">{member.gender}</p>
                      </div>
                      {member.pioneerStatus !== "none" && (
                        <Badge variant="secondary" className="text-xs">
                          {member.pioneerStatus}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {groupMembers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Drop members here
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
