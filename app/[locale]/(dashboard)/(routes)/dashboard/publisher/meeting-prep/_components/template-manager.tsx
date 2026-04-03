"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Copy, Star } from "lucide-react"
import {
  saveTemplate, deleteTemplate, MEETING_TYPES, PREPARATION_CATEGORIES,
  type ChecklistTemplate, type MeetingTypeId, type PreparationCategoryId,
} from "@/lib/db/meetingPrepDB"

interface TemplateManagerProps {
  templates: ChecklistTemplate[]
  onTemplatesChange: (templates: ChecklistTemplate[]) => void
}

export function TemplateManager({ templates, onTemplatesChange }: TemplateManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [templateType, setTemplateType] = useState<MeetingTypeId>("midweek")
  const [templateItems, setTemplateItems] = useState<Array<{
    title: string
    description: string
    category: PreparationCategoryId
    priority: "low" | "medium" | "high"
  }>>([])

  const handleCreateTemplate = async () => {
    if (!templateName.trim() || templateItems.length === 0) return

    const newTemplate: ChecklistTemplate = {
      id: Date.now().toString(),
      name: templateName,
      meetingType: templateType,
      items: templateItems,
      isDefault: false,
      createdAt: new Date().toISOString(),
    }

    await saveTemplate(newTemplate)
    onTemplatesChange([...templates, newTemplate])
    
    // Reset form
    setTemplateName("")
    setTemplateItems([])
    setShowCreateForm(false)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    await deleteTemplate(templateId)
    onTemplatesChange(templates.filter(t => t.id !== templateId))
  }

  const handleDuplicateTemplate = async (template: ChecklistTemplate) => {
    const duplicatedTemplate: ChecklistTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
    }

    await saveTemplate(duplicatedTemplate)
    onTemplatesChange([...templates, duplicatedTemplate])
  }

  const addTemplateItem = () => {
    setTemplateItems([...templateItems, {
      title: "",
      description: "",
      category: "bible_reading",
      priority: "medium"
    }])
  }

  const updateTemplateItem = (index: number, field: string, value: string) => {
    const updated = [...templateItems]
    updated[index] = { ...updated[index], [field]: value }
    setTemplateItems(updated)
  }

  const removeTemplateItem = (index: number) => {
    setTemplateItems(templateItems.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Template Management</h3>
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Template List */}
      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{template.name}</h4>
                  {template.isDefault && (
                    <Badge className="bg-blue-100 text-blue-700 gap-1">
                      <Star className="h-3 w-3" />
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  {!template.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{MEETING_TYPES.find(m => m.id === template.meetingType)?.label}</span>
                <span>•</span>
                <span>{template.items.length} items</span>
                <span>•</span>
                <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Template Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Create Custom Template
                <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Template Name</label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g. My Custom Preparation"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Meeting Type</label>
                  <select
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value as MeetingTypeId)}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    {MEETING_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium">Checklist Items</label>
                  <Button size="sm" onClick={addTemplateItem} className="gap-1">
                    <Plus className="h-3 w-3" />
                    Add Item
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {templateItems.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium">Item {index + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTemplateItem(index)}
                          className="text-red-600 h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                      <Input
                        value={item.title}
                        onChange={(e) => updateTemplateItem(index, 'title', e.target.value)}
                        placeholder="Item title"
                        className="text-sm"
                      />
                      <Input
                        value={item.description}
                        onChange={(e) => updateTemplateItem(index, 'description', e.target.value)}
                        placeholder="Description (optional)"
                        className="text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={item.category}
                          onChange={(e) => updateTemplateItem(index, 'category', e.target.value)}
                          className="text-sm border rounded p-1"
                        >
                          {PREPARATION_CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                          ))}
                        </select>
                        <select
                          value={item.priority}
                          onChange={(e) => updateTemplateItem(index, 'priority', e.target.value)}
                          className="text-sm border rounded p-1"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {templateItems.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No items added yet</p>
                      <p className="text-xs">Click "Add Item" to create your first checklist item</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateTemplate}
                  disabled={!templateName.trim() || templateItems.length === 0}
                  className="flex-1"
                >
                  Create Template
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}