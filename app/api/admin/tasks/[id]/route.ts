// app/api/tasks/[id]/complete/route.ts
// @ts-nocheck
import { NextResponse } from 'next/server';
import admin from '../../../../../lib/firebaseAdmin';

export async function POST(request: Request, context: any) {
  try {
    const body = await request.json();
    const userId = body.userId;
    if (!userId) return NextResponse.json({ ok: false, error: 'missing userId' }, { status: 400 });

    const { id } = context?.params || {};
    if (!id) return NextResponse.json({ ok: false, error: 'missing task id' }, { status: 400 });

    const db = admin.firestore();
    const taskRef = db.collection('tasks').doc(id);
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) return NextResponse.json({ ok: false, error: 'task not found' }, { status: 404 });
    const task = taskSnap.data() as any;

    const userTaskRef = db.collection('userTasks').doc(`${userId}_${id}`);
    const ut = await userTaskRef.get();
    if (ut.exists) return NextResponse.json({ ok: false, error: 'already completed' }, { status: 400 });

    // reward
    const uRef = db.collection('users').doc(userId);
    const uSnap = await uRef.get();
    const user = uSnap.exists ? (uSnap.data() as any) : { id: userId, points: 0, level: 1 };
    const newPoints = (user.points || 0) + (task?.reward || 0);

    await userTaskRef.set({ userId, taskId: id, completedAt: new Date().toISOString() });
    await uRef.set({ ...user, points: newPoints }, { merge: true });

    const newU = await uRef.get();
    return NextResponse.json({ ok: true, user: newU.data() });
  } catch (e) {
    console.error('task-complete error', e);
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
  }
}
