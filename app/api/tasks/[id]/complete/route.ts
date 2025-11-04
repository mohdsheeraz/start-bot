import { NextResponse } from 'next/server';
import admin from '../../../../lib/firebaseAdmin';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await req.json();
    const taskId = params.id;

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'User ID required' });
    }

    const db = admin.firestore();
    
    // Get task details
    const taskDoc = await db.collection('tasks').doc(taskId).get();
    if (!taskDoc.exists) {
      return NextResponse.json({ ok: false, error: 'Task not found' });
    }

    const task = taskDoc.data();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ ok: false, error: 'User not found' });
    }

    const userData = userDoc.data();
    const completedTasks = userData?.completedTasks || [];

    // Check if already completed
    if (completedTasks.includes(taskId)) {
      return NextResponse.json({ ok: false, error: 'Task already completed' });
    }

    // Update user with reward
    await userRef.update({
      points: admin.firestore.FieldValue.increment(task?.reward || 0),
      completedTasks: [...completedTasks, taskId]
    });

    return NextResponse.json({ ok: true });

  } catch (e) {
    console.error('Complete task error:', e);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
