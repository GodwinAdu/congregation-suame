'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, MapPin, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { parseKMLFile, createTerritory } from '@/lib/actions/territory.actions';

interface ParsedTerritory {
  name: string;
  coordinates: number[][];
  center: { latitude: number; longitude: number };
}

export function KMLImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedTerritories, setParsedTerritories] = useState<ParsedTerritory[]>([]);
  const [territoryData, setTerritoryData] = useState<Record<string, any>>({});

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.kml') && !selectedFile.name.toLowerCase().endsWith('.kmz')) {
      toast.error('Please select a KML or KMZ file');
      return;
    }

    setFile(selectedFile);
    setIsUploading(true);

    try {
      console.log('Reading file:', selectedFile.name, 'Size:', selectedFile.size);
      const text = await selectedFile.text();
      console.log('File content length:', text.length);
      console.log('File preview:', text.substring(0, 500));
      
      if (!text.includes('<kml') && !text.includes('<KML')) {
        throw new Error('File does not appear to be a valid KML file');
      }
      
      const parsed = await parseKMLFile(text);
      console.log('Parsed territories:', parsed);
      
      if (!parsed || parsed.length === 0) {
        throw new Error('No territories found in KML file. Make sure the file contains Placemark elements with Polygon geometries.');
      }
      
      setParsedTerritories(parsed);
      
      // Initialize territory data
      const initialData: Record<string, any> = {};
      parsed.forEach((territory, index) => {
        initialData[index] = {
          number: `T${(index + 1).toString().padStart(3, '0')}`,
          name: territory.name,
          description: '',
          difficulty: 'medium',
          type: 'residential',
          estimatedHours: 2,
          householdCount: '',
          notes: ''
        };
      });
      setTerritoryData(initialData);
      
      toast.success(`Successfully parsed ${parsed.length} territories from KML file`);
    } catch (error: any) {
      console.error('Error parsing KML:', error);
      toast.error(error.message || 'Failed to parse KML file. Please check the file format.');
    } finally {
      setIsUploading(false);
    }
  };

  const updateTerritoryData = (index: number, field: string, value: any) => {
    setTerritoryData(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value
      }
    }));
  };

  const handleImportTerritories = async () => {
    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < parsedTerritories.length; i++) {
        const parsed = parsedTerritories[i];
        const data = territoryData[i];

        try {
          console.log(`Creating territory ${data.number} with coordinates:`, parsed.coordinates.length, 'points');
          console.log('Territory data being sent:', {
            number: data.number,
            name: data.name,
            boundaries: { type: 'Polygon', coordinates: [parsed.coordinates] },
            center: parsed.center
          });
          
          const result = await createTerritory({
            number: data.number,
            name: data.name,
            description: data.description,
            boundaries: {
              type: 'Polygon',
              coordinates: [parsed.coordinates]
            },
            center: parsed.center,
            difficulty: data.difficulty,
            type: data.type,
            estimatedHours: Number(data.estimatedHours),
            householdCount: data.householdCount ? Number(data.householdCount) : undefined,
            notes: data.notes,
            kmlData: file ? await file.text() : undefined
          });
          console.log(`Territory ${data.number} created successfully:`, result);
          successCount++;
        } catch (error: any) {
          console.error(`Error creating territory ${data.number}:`, error);
          console.error('Full error details:', error.message, error.stack);
          toast.error(`Failed to create territory ${data.number}: ${error.message}`);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} territories`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} territories`);
      }

      // Reset form and refresh page to show new territories
      setFile(null);
      setParsedTerritories([]);
      setTerritoryData({});
      
      // Refresh the page to show newly imported territories
      window.location.reload();
    } catch (error) {
      toast.error('Failed to import territories');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import KML/KMZ File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center space-y-2">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <Label htmlFor="kml-file" className="text-sm font-medium cursor-pointer">
                  Choose KML or KMZ file
                </Label>
                <Input
                  id="kml-file"
                  type="file"
                  accept=".kml,.kmz"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Upload territory boundaries created in Google Earth or other mapping software
              </p>
            </div>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">{file.name}</span>
              <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
            </div>
          )}

          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing KML file...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            How to Create Territory Boundaries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium">Using Google Earth:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Open Google Earth on your computer</li>
              <li>Navigate to your congregation area</li>
              <li>Click "Add" → "Polygon" to draw territory boundaries</li>
              <li>Name each territory (e.g., "Territory 001", "Downtown Area")</li>
              <li>Save as KML file: Right-click folder → "Save Place As" → Choose KML format</li>
              <li>Upload the KML file here to import all territories at once</li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Tips for Better Results:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Use descriptive names for each territory polygon</li>
              <li>Ensure polygons are closed (start and end at the same point)</li>
              <li>Avoid overlapping territory boundaries</li>
              <li>Include street names or landmarks in territory names</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Parsed Territories */}
      {parsedTerritories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Parsed Territories ({parsedTerritories.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {parsedTerritories.map((territory, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Territory {index + 1}</span>
                    <Badge variant="outline">{territory.coordinates.length} points</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`number-${index}`}>Territory Number</Label>
                      <Input
                        id={`number-${index}`}
                        value={territoryData[index]?.number || ''}
                        onChange={(e) => updateTerritoryData(index, 'number', e.target.value)}
                        placeholder="T001"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`name-${index}`}>Territory Name</Label>
                      <Input
                        id={`name-${index}`}
                        value={territoryData[index]?.name || ''}
                        onChange={(e) => updateTerritoryData(index, 'name', e.target.value)}
                        placeholder="Downtown Area"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`difficulty-${index}`}>Difficulty</Label>
                      <Select
                        value={territoryData[index]?.difficulty || 'medium'}
                        onValueChange={(value) => updateTerritoryData(index, 'difficulty', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor={`type-${index}`}>Territory Type</Label>
                      <Select
                        value={territoryData[index]?.type || 'residential'}
                        onValueChange={(value) => updateTerritoryData(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="rural">Rural</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor={`hours-${index}`}>Estimated Hours</Label>
                      <Input
                        id={`hours-${index}`}
                        type="number"
                        value={territoryData[index]?.estimatedHours || ''}
                        onChange={(e) => updateTerritoryData(index, 'estimatedHours', e.target.value)}
                        placeholder="2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`households-${index}`}>Household Count</Label>
                      <Input
                        id={`households-${index}`}
                        type="number"
                        value={territoryData[index]?.householdCount || ''}
                        onChange={(e) => updateTerritoryData(index, 'householdCount', e.target.value)}
                        placeholder="50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={territoryData[index]?.description || ''}
                      onChange={(e) => updateTerritoryData(index, 'description', e.target.value)}
                      placeholder="Additional notes about this territory..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={handleImportTerritories}
                disabled={isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Import {parsedTerritories.length} Territories
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}