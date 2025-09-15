"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Coffee Maker', stock: 24 },
  { name: 'Blender', stock: 13 },
  { name: 'Toaster', stock: 98 },
  { name: 'Microwave', stock: 39 },
  { name: 'Electric Kettle', stock: 48 },
  { name: 'Electric Kettle', stock: 48 },
  { name: 'Electric Kettle', stock: 48 },
  { name: 'Electric Kettle', stock: 48 },
  { name: 'Electric Kettle', stock: 48 },
  { name: 'Electric Kettle', stock: 48 },
]

export default function InventoryStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="stock" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

