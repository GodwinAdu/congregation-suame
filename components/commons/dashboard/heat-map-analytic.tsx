'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, XAxis, YAxis, Tooltip, ScatterChart, Scatter, Cell } from 'recharts'

const data = [
  { hour: '00:00', day: 'Mon', value: 12 },
  { hour: '00:00', day: 'Tue', value: 24 },
  { hour: '00:00', day: 'Wed', value: 33 },
  { hour: '00:00', day: 'Thu', value: 27 },
  { hour: '00:00', day: 'Fri', value: 19 },
  { hour: '00:00', day: 'Sat', value: 42 },
  { hour: '00:00', day: 'Sun', value: 36 },
  { hour: '04:00', day: 'Mon', value: 22 },
  { hour: '04:00', day: 'Tue', value: 31 },
  { hour: '04:00', day: 'Wed', value: 29 },
  { hour: '04:00', day: 'Thu', value: 35 },
  { hour: '04:00', day: 'Fri', value: 43 },
  { hour: '04:00', day: 'Sat', value: 25 },
  { hour: '04:00', day: 'Sun', value: 18 },
  { hour: '08:00', day: 'Mon', value: 35 },
  { hour: '08:00', day: 'Tue', value: 38 },
  { hour: '08:00', day: 'Wed', value: 30 },
  { hour: '08:00', day: 'Thu', value: 41 },
  { hour: '16:00', day: 'Wed', value: 69 },
  { hour: '20:00', day: 'Thu', value: 58 },
  { hour: '20:00', day: 'Fri', value: 65 },
  { hour: '20:00', day: 'Sat', value: 59 },
  { hour: '20:00', day: 'Sun', value: 45 },
]

// const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
// const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const getColor = (value: number) => {
  const minValue = Math.min(...data.map(d => d.value))
  const maxValue = Math.max(...data.map(d => d.value))
  const normalizedValue = (value - minValue) / (maxValue - minValue)
  return `rgb(255, ${Math.floor(255 - normalizedValue * 255)}, 0)`
}

export default function HeatmapAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 60,
              }}
            >
              <XAxis type="category" dataKey="day" name="day" interval={0} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="hour" name="hour" interval={0} tickLine={false} axisLine={false} reversed />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={data} fill="#8884d8">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
