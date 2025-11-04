import { NextResponse } from 'next/server';
import admin from '../../../lib/firebaseAdmin';

export async function GET() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('tasks')
      .where('isActive', '==', true)
      .get();
    
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ ok: true, data: tasks });
  } catch (e) {
    console.error('Tasks error:', e);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
