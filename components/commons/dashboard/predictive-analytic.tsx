'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', actual: 4000, predicted: 4200 },
  { name: 'Feb', actual: 3000, predicted: 3100 },
  { name: 'Mar', actual: 2000, predicted: 2300 },
  { name: 'Apr', actual: 2780, predicted: 2900 },
  { name: 'May', actual: 1890, predicted: 2100 },
  { name: 'Jun', actual: 2390, predicted: 2500 },
  { name: 'Jul', actual: null, predicted: 3200 },
  { name: 'Aug', actual: null, predicted: 3400 },
  { name: 'Sep', actual: null, predicted: 3100 },
]

export default function PredictiveAnalytics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="predicted" stroke="#82ca9d" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

