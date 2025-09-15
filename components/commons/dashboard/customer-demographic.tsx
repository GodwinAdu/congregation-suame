"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { age: '18-24', male: 20, female: 25 },
  { age: '25-34', male: 30, female: 35 },
  { age: '35-44', male: 25, female: 30 },
  { age: '45-54', male: 15, female: 20 },
  { age: '55+', male: 10, female: 15 },
]

export default function CustomerDemographics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Demographics</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="male" fill="#8884d8" />
            <Bar dataKey="female" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

