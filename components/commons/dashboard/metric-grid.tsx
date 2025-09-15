import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchCurrentMonthRevenue, totalRevenues } from '@/lib/actions/revenue-summary.actions'
import { DollarSign, ShoppingCart, Package, TrendingUp, BarChart } from 'lucide-react'


export default async function MetricsGrid() {
  const totalRevenue = await totalRevenues()
  const sales = await fetchCurrentMonthRevenue()
  console.log(totalRevenue)
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

      <Card className="bg-primary/5 border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRevenue}</div>
          {/* <p className="text-xs text-muted-foreground">{metric.change}</p> */}
        </CardContent>
      </Card>
      <Card className="bg-primary/5 border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Month Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sales}</div>
          {/* <p className="text-xs text-muted-foreground">{metric.change}</p> */}
        </CardContent>
      </Card>
      <Card className="bg-primary/5 border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{0.00}</div>
          {/* <p className="text-xs text-muted-foreground">{metric.change}</p> */}
        </CardContent>
      </Card>
      <Card className="bg-primary/5 border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{0.00}</div>
          {/* <p className="text-xs text-muted-foreground">{metric.change}</p> */}
        </CardContent>
      </Card>
      <Card className="bg-primary/5 border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{0.00}</div>
          {/* <p className="text-xs text-muted-foreground">{metric.change}</p> */}
        </CardContent>
      </Card>

    </div>
  )
}

