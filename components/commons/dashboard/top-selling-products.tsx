import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const topProducts = [
  { name: 'Smartphone X', sales: 1234, revenue: '$123,400' },
  { name: 'Laptop Pro', sales: 987, revenue: '$197,400' },
  { name: 'Wireless Earbuds', sales: 879, revenue: '$43,950' },
  { name: 'Smart Watch', sales: 765, revenue: '$76,500' },
  { name: 'Tablet Ultra', sales: 654, revenue: '$130,800' },
]

export default function TopSellingProducts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.map((product) => (
              <TableRow key={product.name}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sales}</TableCell>
                <TableCell>{product.revenue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

