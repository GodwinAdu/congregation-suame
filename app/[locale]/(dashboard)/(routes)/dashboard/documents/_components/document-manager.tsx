"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FolderOpen, Upload } from "lucide-react"

export function DocumentManager() {
    const [documents] = useState([])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Documents</h2>
                <Button className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Document
                </Button>
            </div>

            <Card>
                <CardContent className="text-center py-12">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No documents</h3>
                    <p className="text-muted-foreground">Upload your first document</p>
                </CardContent>
            </Card>
        </div>
    )
}