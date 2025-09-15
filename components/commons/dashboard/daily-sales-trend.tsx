"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { date: '2023-05-01', sales: 4000 },
  { date: '2023-05-02', sales: 3000 },
  { date: '2023-05-03', sales: 5000 },
  { date: '2023-05-04', sales: 2780 },
  { date: '2023-05-05', sales: 1890 },
  { date: '2023-05-06', sales: 2390 },
  { date: '2023-05-07', sales: 3490 },
]

export default function DailySalesTrend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Sales Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

