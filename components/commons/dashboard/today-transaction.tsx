import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const todayTransactions = [
  { id: '1', time: '09:15 AM', product: 'Coffee Maker', amount: '$129.99' },
  { id: '2', time: '10:30 AM', product: 'Blender', amount: '$79.99' },
  { id: '3', time: '11:45 AM', product: 'Toaster', amount: '$39.99' },
  { id: '4', time: '01:20 PM', product: 'Microwave', amount: '$199.99' },
  { id: '5', time: '03:05 PM', product: 'Electric Kettle', amount: '$49.99' },
]

export default function TodayTransactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {todayTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.time}</TableCell>
                <TableCell>{transaction.product}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

