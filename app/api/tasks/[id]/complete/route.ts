import { NextResponse } from 'next/server';
import admin from '../../../../../lib/firebaseAdmin';

export async function POST(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const body = await request.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Missing userId' }, { status: 400 });
    }

    const db = admin.firestore();
    const taskRef = db.collection('tasks').doc(id);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) {
      return NextResponse.json({ ok: false, error: 'Task not found' }, { status: 404 });
    }

    const task = taskSnap.data();
    const userTaskRef = db.collection('userTasks').doc(`${userId}_${id}`);
    const userTaskSnap = await userTaskRef.get();

    if (userTaskSnap.exists) {
      return NextResponse.json({ ok: false, error: 'Already completed' }, { status: 400 });
    }

    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    const user = userSnap.exists ? userSnap.data() : { id: userId, points: 0, level: 1 };

    const newPoints = (user.points || 0) + (task?.reward || 0);

    await userTaskRef.set({
      userId,
      taskId: id,
      completedAt: new Date().toISOString(),
    });

    await userRef.set({ ...user, points: newPoints }, { merge: true });

    const updatedUser = await userRef.get();
    return NextResponse.json({ ok: true, user: updatedUser.data() });
  } catch (error) {
    console.error('Task complete error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
