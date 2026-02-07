"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Printer, Search } from "lucide-react";
import { getTerritoryPrintData } from "@/lib/actions/territory-management.actions";
import { toast } from "sonner";

interface PrintViewProps {
  territories: any[];
}

export default function PrintView({ territories }: PrintViewProps) {
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTerritories = territories.filter((t) =>
    t.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedTerritories.length === filteredTerritories.length) {
      setSelectedTerritories([]);
    } else {
      setSelectedTerritories(filteredTerritories.map((t) => t._id));
    }
  };

  const handleSelectTerritory = (territoryId: string) => {
    setSelectedTerritories((prev) =>
      prev.includes(territoryId)
        ? prev.filter((id) => id !== territoryId)
        : [...prev, territoryId]
    );
  };

  const handlePrint = async () => {
    if (selectedTerritories.length === 0) {
      toast.error("Please select at least one territory");
      return;
    }

    try {
      const printData = await Promise.all(
        selectedTerritories.map((id) => getTerritoryPrintData(id))
      );

      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const html = generatePrintHTML(printData);
      printWindow.document.write(html);
      printWindow.document.close();

      toast.success(`Printing ${selectedTerritories.length} territories`);
    } catch (error) {
      toast.error("Failed to print territories");
      console.error(error);
    }
  };

  const generatePrintHTML = (data: any[]) => {
    const mapsData = data.map((item, index) => {
      if (!item.territory.boundaries) return null;
      return {
        index,
        coords: item.territory.boundaries.coordinates[0],
        centerLat: item.territory.center.latitude,
        centerLng: item.territory.center.longitude
      };
    }).filter(Boolean);

    return `<!DOCTYPE html>
<html>
<head>
  <title>Territory Cards</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    @page { size: A4; margin: 10mm; }
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .territory-card { page-break-after: always; border: 2px solid #000; padding: 20px; margin-bottom: 20px; height: 100vh; display: flex; flex-direction: column; }
    .territory-card:last-child { page-break-after: auto; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
    .territory-number { font-size: 48px; font-weight: bold; }
    .territory-name { font-size: 24px; margin-top: 10px; }
    .map-container { width: 100%; height: 400px; margin: 20px 0; border: 2px solid #ddd; }
    .info-section { margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
    .label { font-weight: bold; }
    .assignment-history { margin-top: auto; }
    .history-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .history-table th, .history-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
    .history-table th { background-color: #f2f2f2; }
    @media print { .territory-card { page-break-inside: avoid; } }
  </style>
</head>
<body>
${data.map((item, index) => `
  <div class="territory-card">
    <div class="header">
      <div class="territory-number">${item.territory.number}</div>
      <div class="territory-name">${item.territory.name}</div>
    </div>
    ${item.territory.boundaries ? `<div id="map-${index}" class="map-container"></div>` : ''}
    <div class="info-section">
      <div class="info-row"><span class="label">Type:</span><span>${item.territory.type}</span></div>
      <div class="info-row"><span class="label">Difficulty:</span><span>${item.territory.difficulty}</span></div>
      <div class="info-row"><span class="label">Estimated Hours:</span><span>${item.territory.estimatedHours} hours</span></div>
      ${item.territory.householdCount ? `<div class="info-row"><span class="label">Households:</span><span>${item.territory.householdCount}</span></div>` : ''}
      ${item.currentAssignment ? `<div class="info-row"><span class="label">Currently Assigned To:</span><span>${item.currentAssignment.publisherId.fullName}</span></div>
      <div class="info-row"><span class="label">Assigned Date:</span><span>${new Date(item.currentAssignment.assignedDate).toLocaleDateString()}</span></div>` : ''}
    </div>
    ${item.territory.notes ? `<div class="info-section"><div class="label">Notes:</div><p>${item.territory.notes}</p></div>` : ''}
    <div class="assignment-history">
      <div class="label">Assignment History:</div>
      <table class="history-table">
        <thead><tr><th>Publisher</th><th>Date</th></tr></thead>
        <tbody>${item.assignmentHistory.slice(0, 5).map((h: any) => `<tr><td>${h.publisherId.fullName}</td><td>${new Date(h.assignedDate).toLocaleDateString()}</td></tr>`).join('')}</tbody>
      </table>
    </div>
  </div>
`).join('')}
<script>
window.onload = function() {
  var mapsData = ${JSON.stringify(mapsData)};
  mapsData.forEach(function(mapData) {
    if (!mapData) return;
    var map = L.map('map-' + mapData.index).setView([mapData.centerLat, mapData.centerLng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    var coords = mapData.coords.map(function(c) { return [c[1], c[0]]; });
    var polygon = L.polygon(coords, {
      color: '#2563eb',
      fillColor: '#3388ff',
      fillOpacity: 0.25,
      weight: 3
    }).addTo(map);
    L.marker([mapData.centerLat, mapData.centerLng]).addTo(map);
    setTimeout(function() {
      map.invalidateSize();
      map.fitBounds(polygon.getBounds(), { padding: [20, 20] });
    }, 100);
  });
  setTimeout(function() { window.print(); }, 2000);
};
<\/script>
</body>
</html>`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Territories to Print</CardTitle>
            <Button
              onClick={handlePrint}
              disabled={selectedTerritories.length === 0}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print {selectedTerritories.length > 0 && `(${selectedTerritories.length})`}
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search territories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 border-b">
              <Checkbox
                checked={selectedTerritories.length === filteredTerritories.length && filteredTerritories.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="font-medium">Select All ({filteredTerritories.length})</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {filteredTerritories.map((territory) => (
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
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{territory.type}</Badge>
                      <Badge variant="secondary">{territory.difficulty}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
