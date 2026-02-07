"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Scissors } from "lucide-react";
import { divideTerritoryIntoSubTerritories } from "@/lib/actions/territory-management.actions";
import { toast } from "sonner";

interface DivideViewProps {
  territories: any[];
  onUpdate: () => void;
}

export default function DivideView({ territories, onUpdate }: DivideViewProps) {
  const [selectedTerritory, setSelectedTerritory] = useState("");
  const [divisions, setDivisions] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleDivide = async () => {
    if (!selectedTerritory) {
      toast.error("Please select a territory");
      return;
    }

    try {
      setLoading(true);
      await divideTerritoryIntoSubTerritories(selectedTerritory, divisions);
      toast.success(`Territory divided into ${divisions} sub-territories`);
      setSelectedTerritory("");
      setDivisions(2);
      onUpdate();
    } catch (error) {
      toast.error("Failed to divide territory");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Divide Territory into Sub-Territories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Territory</label>
          <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a territory" />
            </SelectTrigger>
            <SelectContent>
              {territories.map((t) => (
                <SelectItem key={t._id} value={t._id}>
                  {t.number} - {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Divisions</label>
          <Input
            type="number"
            min={2}
            max={10}
            value={divisions}
            onChange={(e) => setDivisions(parseInt(e.target.value) || 2)}
          />
        </div>

        <Button
          onClick={handleDivide}
          disabled={loading || !selectedTerritory}
          className="w-full gap-2"
        >
          <Scissors className="h-4 w-4" />
          {loading ? "Dividing..." : `Divide into ${divisions} Parts`}
        </Button>
      </CardContent>
    </Card>
  );
}
