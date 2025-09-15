import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const transactionHistory = [
  { id: '1', date: '2023-06-01', description: 'Sale - Coffee Maker', amount: '+$129.99' },
  { id: '2', date: '2023-06-01', description: 'Sale - Blender', amount: '+$79.99' },
  { id: '3', date: '2023-06-01', description: 'Refund - Toaster', amount: '-$39.99' },
  { id: '4', date: '2023-05-31', description: 'Sale - Microwave', amount: '+$199.99' },
  { id: '5', date: '2023-05-31', description: 'Sale - Electric Kettle', amount: '+$49.99' },
  { id: '6', date: '2023-05-30', description: 'Inventory Restock', amount: '-$1000.00' },
  { id: '7', date: '2023-05-30', description: 'Sale - Coffee Grinder', amount: '+$89.99' },
  { id: '8', date: '2023-05-29', description: 'Sale - Food Processor', amount: '+$159.99' },
  { id: '9', date: '2023-05-29', description: 'Refund - Blender', amount: '-$79.99' },
  { id: '10', date: '2023-05-28', description: 'Sale - Espresso Machine', amount: '+$299.99' },
]

export default function TransactionHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full">
          <div className="space-y-4">
            {transactionHistory.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
                <div className={`text-sm font-medium ${transaction.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

