// app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import admin from '../../../lib/firebaseAdmin';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'User ID required' });
    }

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();

    if (doc.exists) {
      const userData = doc.data();
      return NextResponse.json({ 
        ok: true, 
        data: {
          id: userId,
          points: userData?.points || 0,
          level: userData?.level || 1,
          miningPower: userData?.miningPower || 1,
          lastClaimISO: userData?.lastClaimISO || null,
          wallet: userData?.wallet || null,
          username: userData?.username || null,
          completedTasks: userData?.completedTasks || [],
          totalEarned: userData?.totalEarned || 0,
          createdAt: userData?.createdAt || new Date().toISOString()
        }
      });
    } else {
      // Create new user with complete structure
      const newUser = {
        id: userId,
        points: 0,
        level: 1,
        miningPower: 1,
        lastClaimISO: null,
        wallet: null,
        username: null,
        completedTasks: [],
        totalEarned: 0,
        createdAt: new Date().toISOString()
      };
      
      await userRef.set(newUser);
      return NextResponse.json({ ok: true, data: newUser });
    }
  } catch (e) {
    console.error('Dashboard API error:', e);
    return NextResponse.json({ 
      ok: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
}
