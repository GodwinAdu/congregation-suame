import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const recentTransactions = [
  { id: '1', product: 'Coffee Maker', amount: '$129.99', date: '2023-06-01' },
  { id: '2', product: 'Blender', amount: '$79.99', date: '2023-06-01' },
  { id: '3', product: 'Toaster', amount: '$39.99', date: '2023-05-31' },
  { id: '4', product: 'Microwave', amount: '$199.99', date: '2023-05-31' },
  { id: '5', product: 'Electric Kettle', amount: '$49.99', date: '2023-05-30' },
]

export default function RecentTransactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.product}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>{transaction.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

