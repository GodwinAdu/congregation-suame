"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', John: 4000, Jane: 2400, Bob: 2400 },
  { name: 'Feb', John: 3000, Jane: 1398, Bob: 2210 },
  { name: 'Mar', John: 2000, Jane: 9800, Bob: 2290 },
  { name: 'Apr', John: 2780, Jane: 3908, Bob: 2000 },
  { name: 'May', John: 1890, Jane: 4800, Bob: 2181 },
  { name: 'Jun', John: 2390, Jane: 3800, Bob: 2500 },
]

export default function EmployeePerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="John" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="Jane" stroke="#82ca9d" />
            <Line type="monotone" dataKey="Bob" stroke="#ffc658" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

