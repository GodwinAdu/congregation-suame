'use server';

import { connectToDB } from '@/lib/mongoose';
import Literature from '@/lib/models/literature.models';
import { revalidatePath } from 'next/cache';

export async function createLiterature(data: any) {
  try {
    await connectToDB();

    const literature = await Literature.create(data);


    revalidatePath('/dashboard/literature');
    return { success: true, data: JSON.parse(JSON.stringify(literature)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLiterature(id: string, data: any) {
  try {
    await connectToDB();

    const literature = await Literature.findByIdAndUpdate(id, data, { new: true });
    if (!literature) throw new Error('Literature not found');


    revalidatePath('/dashboard/literature');
    return { success: true, data: JSON.parse(JSON.stringify(literature)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLiterature(id: string) {
  try {
    await connectToDB();

    await Literature.findByIdAndDelete(id);


    revalidatePath('/dashboard/literature');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLiterature(congregationId: string) {
  try {
    await connectToDB();

    const literature = await Literature.find({ congregationId })
      .sort({ title: 1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(literature)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function recordPlacement(literatureId: string, placement: any) {
  try {
    await connectToDB();

    const literature = await Literature.findByIdAndUpdate(
      literatureId,
      { 
        $push: { placements: { ...placement, date: new Date() } },
        $inc: { stockQuantity: -placement.quantity }
      },
      { new: true }
    );

    if (!literature) throw new Error('Literature not found');


    revalidatePath('/dashboard/literature');
    return { success: true, data: JSON.parse(JSON.stringify(literature)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function recordContribution(literatureId: string, contribution: any) {
  try {
    await connectToDB();

    const literature = await Literature.findByIdAndUpdate(
      literatureId,
      { $push: { contributions: { ...contribution, date: new Date() } } },
      { new: true }
    );

    if (!literature) throw new Error('Literature not found');


    revalidatePath('/dashboard/literature');
    return { success: true, data: JSON.parse(JSON.stringify(literature)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createOrder(literatureId: string, order: any) {
  try {
    await connectToDB();

    const literature = await Literature.findByIdAndUpdate(
      literatureId,
      { $push: { orders: { ...order, orderDate: new Date(), status: 'pending' } } },
      { new: true }
    );

    if (!literature) throw new Error('Literature not found');


    revalidatePath('/dashboard/literature');
    return { success: true, data: JSON.parse(JSON.stringify(literature)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function receiveOrder(literatureId: string, orderIndex: number) {
  try {
    await connectToDB();

    const literature = await Literature.findById(literatureId);
    if (!literature) throw new Error('Literature not found');

    const order = literature.orders[orderIndex];
    if (!order) throw new Error('Order not found');

    literature.orders[orderIndex].status = 'received';
    literature.orders[orderIndex].receivedDate = new Date();
    literature.stockQuantity += order.quantity;

    await literature.save();


    revalidatePath('/dashboard/literature');
    return { success: true, data: JSON.parse(JSON.stringify(literature)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLowStock(congregationId: string) {
  try {
    await connectToDB();

    const lowStock = await Literature.find({
      congregationId,
      $expr: { $lte: ['$stockQuantity', '$reorderLevel'] }
    }).lean();

    return { success: true, data: JSON.parse(JSON.stringify(lowStock)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLiteratureStats(congregationId: string) {
  try {
    await connectToDB();

    const literature = await Literature.find({ congregationId }).lean();

    const totalItems = literature.length;
    const totalStock = literature.reduce((sum, l) => sum + l.stockQuantity, 0);
    const lowStockCount = literature.filter(l => l.stockQuantity <= l.reorderLevel).length;
    
    const totalPlacements = literature.reduce((sum, l) => 
      sum + (l.placements?.reduce((s: number, p: any) => s + p.quantity, 0) || 0), 0
    );
    
    const totalContributions = literature.reduce((sum, l) => 
      sum + (l.contributions?.reduce((s: number, c: any) => s + c.amount, 0) || 0), 0
    );

    const totalCost = literature.reduce((sum, l) => 
      sum + ((l.unitCost || 0) * l.stockQuantity), 0
    );

    return {
      success: true,
      data: {
        totalItems,
        totalStock,
        lowStockCount,
        totalPlacements,
        totalContributions,
        totalCost
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
