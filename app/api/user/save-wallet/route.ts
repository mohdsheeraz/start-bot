import { NextResponse } from 'next/server';
import admin from '../../../lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const { userId, wallet } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'User ID required' });
    }

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    
    // Check if user exists, create if not
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      await userRef.set({
        id: userId,
        points: 0,
        level: 1,
        wallet: wallet,
        lastClaimISO: null,
        completedTasks: [],
        totalEarned: 0,
        createdAt: new Date().toISOString()
      });
    } else {
      await userRef.update({ wallet });
    }

    // Get updated user
    const updatedDoc = await userRef.get();
    
    return NextResponse.json({ 
      ok: true, 
      user: updatedDoc.data() 
    });

  } catch (e) {
    console.error('Save wallet error:', e);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
