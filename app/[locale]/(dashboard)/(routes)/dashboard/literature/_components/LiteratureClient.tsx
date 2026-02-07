'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, AlertCircle, DollarSign, TrendingUp, ShoppingCart } from 'lucide-react';
import { LiteratureModal } from './LiteratureModal';
import { deleteLiterature, recordPlacement, recordContribution, createOrder, receiveOrder } from '@/lib/actions/literature.actions';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LiteratureClientProps {
  literature: any[];
  lowStock: any[];
  stats: any;
  members: any[];
  congregationId: string;
}

export function LiteratureClient({ literature, lowStock, stats, members, congregationId }: LiteratureClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [placementModal, setPlacementModal] = useState<any>(null);
  const [contributionModal, setContributionModal] = useState<any>(null);
  const [orderModal, setOrderModal] = useState<any>(null);
  const [placementData, setPlacementData] = useState({ memberId: '', quantity: '', notes: '' });
  const [contributionData, setContributionData] = useState({ amount: '', notes: '' });
  const [orderData, setOrderData] = useState({ quantity: '', cost: '' });

  const handleEdit = (item: any) => {
    setEditData(item);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteLiterature(deleteId);
    if (result.success) {
      toast.success('Literature deleted');
    } else {
      toast.error(result.error);
    }
    setDeleteId(null);
  };

  const handlePlacement = async () => {
    if (!placementModal) return;
    const result = await recordPlacement(placementModal._id, {
      memberId: placementData.memberId,
      quantity: Number(placementData.quantity),
      notes: placementData.notes
    });
    if (result.success) {
      toast.success('Placement recorded');
      setPlacementModal(null);
      setPlacementData({ memberId: '', quantity: '', notes: '' });
    } else {
      toast.error(result.error);
    }
  };

  const handleContribution = async () => {
    if (!contributionModal) return;
    const result = await recordContribution(contributionModal._id, {
      amount: Number(contributionData.amount),
      notes: contributionData.notes
    });
    if (result.success) {
      toast.success('Contribution recorded');
      setContributionModal(null);
      setContributionData({ amount: '', notes: '' });
    } else {
      toast.error(result.error);
    }
  };

  const handleOrder = async () => {
    if (!orderModal) return;
    const result = await createOrder(orderModal._id, {
      quantity: Number(orderData.quantity),
      cost: orderData.cost ? Number(orderData.cost) : undefined
    });
    if (result.success) {
      toast.success('Order created');
      setOrderModal(null);
      setOrderData({ quantity: '', cost: '' });
    } else {
      toast.error(result.error);
    }
  };

  const handleReceiveOrder = async (literatureId: string, orderIndex: number) => {
    const result = await receiveOrder(literatureId, orderIndex);
    if (result.success) {
      toast.success('Order received, stock updated');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStock || 0}</div>
            <p className="text-xs text-muted-foreground">Units available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStockCount || 0}</div>
            <p className="text-xs text-muted-foreground">Need reorder</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Placements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlacements || 0}</div>
            <p className="text-xs text-muted-foreground">Total distributed</p>
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Low Stock Alert ({lowStock.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {lowStock.map((item: any) => (
                <div key={item._id} className="flex justify-between items-center p-3 bg-white rounded border border-orange-200">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.type} • {item.language}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-red-100 text-red-800">{item.stockQuantity} left</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Reorder at {item.reorderLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="inventory" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="placements">Placements</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          <Button onClick={() => { setEditData(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Literature
          </Button>
        </div>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Literature Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Title</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Language</th>
                      <th className="text-center p-2">Stock</th>
                      <th className="text-center p-2">Reorder</th>
                      <th className="text-center p-2">Cost</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {literature.map((item: any) => (
                      <tr key={item._id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{item.title}</td>
                        <td className="p-2 capitalize">{item.type}</td>
                        <td className="p-2">{item.language}</td>
                        <td className="p-2 text-center">
                          <Badge className={item.stockQuantity <= item.reorderLevel ? 'bg-red-100 text-red-800' : ''}>
                            {item.stockQuantity}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">{item.reorderLevel}</td>
                        <td className="p-2 text-center">{item.unitCost ? `$${item.unitCost}` : '-'}</td>
                        <td className="p-2 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="outline" size="sm" onClick={() => setPlacementModal(item)}>Place</Button>
                            <Button variant="outline" size="sm" onClick={() => setOrderModal(item)}><ShoppingCart className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => setDeleteId(item._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Placements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {literature.flatMap(lit => 
                  (lit.placements || []).map((p: any, idx: number) => ({
                    ...p,
                    literatureTitle: lit.title,
                    key: `${lit._id}-${idx}`
                  }))
                ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20).map((placement: any) => (
                  <div key={placement.key} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{placement.literatureTitle}</p>
                      <p className="text-sm text-muted-foreground">{new Date(placement.date).toLocaleDateString()}</p>
                    </div>
                    <Badge>{placement.quantity} placed</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Literature Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {literature.flatMap(lit => 
                  (lit.orders || []).map((o: any, idx: number) => ({
                    ...o,
                    literatureTitle: lit.title,
                    literatureId: lit._id,
                    orderIndex: idx,
                    key: `${lit._id}-${idx}`
                  }))
                ).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).map((order: any) => (
                  <div key={order.key} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{order.literatureTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        Ordered: {new Date(order.orderDate).toLocaleDateString()}
                        {order.receivedDate && ` • Received: ${new Date(order.receivedDate).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{order.quantity} units</Badge>
                      <Badge className={
                        order.status === 'received' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>{order.status}</Badge>
                      {order.status === 'pending' && (
                        <Button size="sm" onClick={() => handleReceiveOrder(order.literatureId, order.orderIndex)}>Receive</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <LiteratureModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        congregationId={congregationId}
        editData={editData}
      />

      <Dialog open={!!placementModal} onOpenChange={() => setPlacementModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Placement - {placementModal?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Member</Label>
              <Select value={placementData.memberId} onValueChange={(v) => setPlacementData({ ...placementData, memberId: v })}>
                <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                <SelectContent>
                  {members.map((m: any) => (
                    <SelectItem key={m._id} value={m._id}>{m.firstName} {m.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={placementData.quantity} onChange={(e) => setPlacementData({ ...placementData, quantity: e.target.value })} />
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Input value={placementData.notes} onChange={(e) => setPlacementData({ ...placementData, notes: e.target.value })} />
            </div>
            <Button onClick={handlePlacement}>Record Placement</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!orderModal} onOpenChange={() => setOrderModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Order - {orderModal?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={orderData.quantity} onChange={(e) => setOrderData({ ...orderData, quantity: e.target.value })} />
            </div>
            <div>
              <Label>Total Cost (Optional)</Label>
              <Input type="number" step="0.01" value={orderData.cost} onChange={(e) => setOrderData({ ...orderData, cost: e.target.value })} />
            </div>
            <Button onClick={handleOrder}>Create Order</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Literature</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this literature item? This will remove all placement and order history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
