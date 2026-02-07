"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Award, Shield, Home } from "lucide-react";

interface BalanceDialogProps {
  open: boolean;
  onClose: () => void;
  onBalance: (strategy: string) => void;
  loading: boolean;
}

export default function BalanceDialog({ open, onClose, onBalance, loading }: BalanceDialogProps) {
  const strategies = [
    {
      id: "simple",
      title: "Simple Balance",
      description: "Distribute members evenly across all groups",
      icon: Users,
    },
    {
      id: "gender",
      title: "Balance by Gender",
      description: "Ensure equal male/female distribution",
      icon: UserCheck,
    },
    {
      id: "pioneer",
      title: "Balance by Pioneer Status",
      description: "Distribute pioneers evenly across groups",
      icon: Award,
    },
    {
      id: "privilege",
      title: "Balance by Privilege",
      description: "Distribute elders and MS evenly",
      icon: Shield,
    },
    {
      id: "family",
      title: "Balance by Family",
      description: "Keep families together in same group",
      icon: Home,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Balance Groups</DialogTitle>
          <DialogDescription>
            Choose a balancing strategy to redistribute members across groups
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {strategies.map((strategy) => (
            <Card
              key={strategy.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => !loading && onBalance(strategy.id)}
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
                    onBalance(strategy.id);
                  }}
                >
                  {loading ? "Balancing..." : "Apply"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
