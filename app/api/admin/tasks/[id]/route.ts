import { NextResponse } from 'next/server';
import admin from '../../../../../lib/firebaseAdmin';

// ✅ GET: Fetch a task by ID
export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const db = admin.firestore();
    const taskRef = db.collection('tasks').doc(id);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) {
      return NextResponse.json({ ok: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, task: taskSnap.data() });
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// ✅ PUT: Update a task
export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const data = await request.json();
    const db = admin.firestore();
    await db.collection('tasks').doc(id).set(data, { merge: true });

    return NextResponse.json({ ok: true, message: 'Task updated' });
  } catch (error) {
    console.error('Admin PUT error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// ✅ DELETE: Remove a task
export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const db = admin.firestore();
    await db.collection('tasks').doc(id).delete();

    return NextResponse.json({ ok: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Admin DELETE error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
