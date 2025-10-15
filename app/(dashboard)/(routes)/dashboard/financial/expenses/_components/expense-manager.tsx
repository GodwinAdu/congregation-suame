"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, DollarSign } from "lucide-react"

export function ExpenseManager() {
    const [expenses] = useState([])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Expenses</h2>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Expense
                </Button>
            </div>

            <Card>
                <CardContent className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No expenses recorded</h3>
                    <p className="text-muted-foreground">Start by adding your first expense</p>
                </CardContent>
            </Card>
        </div>
    )
}