import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import Member from '@/lib/models/user.models';

export async function GET() {
  try {
    await connectToDB();
    
    const members = await Member.find({
      'location.latitude': { $exists: true, $ne: null },
      'location.longitude': { $exists: true, $ne: null }
    }).select('fullName phone location role');
    
    console.log(`Found ${members.length} members with location data`);
    
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching members with location:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}