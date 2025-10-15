"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, PieChart } from "lucide-react"

export function BudgetManager() {
    const [budgets] = useState([])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Annual Budgets</h2>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Budget
                </Button>
            </div>

            <Card>
                <CardContent className="text-center py-12">
                    <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No budgets created</h3>
                    <p className="text-muted-foreground">Create your first annual budget</p>
                </CardContent>
            </Card>
        </div>
    )
}