import { NextResponse } from 'next/server';
import admin from '../../../lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'User ID required' });
    }

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ ok: false, error: 'User not found' });
    }

    const userData = userDoc.data();
    const now = new Date();
    const lastClaim = userData?.lastClaimISO ? new Date(userData.lastClaimISO) : null;
    
    // Check if 24 hours have passed
    if (lastClaim && (now.getTime() - lastClaim.getTime()) < 24 * 60 * 60 * 1000) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Claim available only every 24 hours' 
      });
    }

    // Calculate reward based on level
    const baseReward = 100;
    const levelMultiplier = (userData?.level || 1) * 0.5;
    const reward = Math.floor(baseReward * (1 + levelMultiplier));

    // Update user
    await userRef.update({
      points: admin.firestore.FieldValue.increment(reward),
      lastClaimISO: now.toISOString(),
      totalEarned: admin.firestore.FieldValue.increment(reward || 0)
    });

    // Get updated user
    const updatedDoc = await userRef.get();
    
    return NextResponse.json({ 
      ok: true, 
      user: updatedDoc.data() 
    });

  } catch (e) {
    console.error('Claim error:', e);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
