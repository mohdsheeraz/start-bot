// app/api/admin/tasks/[id]/route.ts
import { NextResponse } from 'next/server';
import admin from '../../../../../lib/firebaseAdmin';

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const db = admin.firestore();
    const doc = await db.collection('tasks').doc(id).get();

    if (!doc.exists) return NextResponse.json({ ok: false, error: 'Task not found' }, { status: 404 });
    return NextResponse.json({ ok: true, task: { id: doc.id, ...(doc.data() as any) } });
  } catch (err) {
    console.error('admin tasks GET error', err);
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const token = request.headers.get('x-admin-token');
    if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const body = await request.json();
    const db = admin.firestore();

    await db.collection('tasks').doc(id).set(
      {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.reward !== undefined ? { reward: body.reward } : {}),
        ...(body.type !== undefined ? { type: body.type } : {}),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const updated = await db.collection('tasks').doc(id).get();
    return NextResponse.json({ ok: true, task: { id: updated.id, ...(updated.data() as any) } });
  } catch (err) {
    console.error('admin tasks PUT error', err);
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    const token = request.headers.get('x-admin-token');
    if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const db = admin.firestore();
    await db.collection('tasks').doc(id).delete();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('admin tasks DELETE error', err);
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
  }
}
