"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shuffle, BarChart3, Home } from "lucide-react";
import { distributeTerritoriesToGroups } from "@/lib/actions/territory-management.actions";
import { toast } from "sonner";

interface DistributeDialogProps {
  open: boolean;
  onClose: () => void;
  onDistribute: () => void;
}

export default function DistributeDialog({ open, onClose, onDistribute }: DistributeDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDistribute = async (strategy: string) => {
    try {
      setLoading(true);
      await distributeTerritoriesToGroups(strategy as any);
      toast.success(`Territories distributed using ${strategy} strategy`);
      onDistribute();
      onClose();
    } catch (error) {
      toast.error("Failed to distribute territories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const strategies = [
    {
      id: "equal",
      title: "Equal Distribution",
      description: "Distribute territories evenly across all groups",
      icon: Shuffle,
    },
    {
      id: "difficulty",
      title: "By Difficulty",
      description: "Distribute based on territory difficulty level",
      icon: BarChart3,
    },
    {
      id: "size",
      title: "By Size",
      description: "Distribute based on household count",
      icon: Home,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Auto Distribute Territories</DialogTitle>
          <DialogDescription>
            Choose a strategy to automatically distribute territories across groups
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {strategies.map((strategy) => (
            <Card
              key={strategy.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => !loading && handleDistribute(strategy.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <strategy.icon className="h-5 w-5" />
                  {strategy.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {strategy.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDistribute(strategy.id);
                  }}
                >
                  {loading ? "Distributing..." : "Apply"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
