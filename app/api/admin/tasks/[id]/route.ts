// app/api/admin/tasks/[id]/route.ts
import { NextResponse } from 'next/server';
import admin from '../../../../../lib/firebaseAdmin';

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const token = request.headers.get('x-admin-token');
    if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, reward, type } = body;
    const { id } = context.params;

    if (!title && reward === undefined && !type) {
      return NextResponse.json({ ok: false, error: 'nothing to update' }, { status: 400 });
    }

    const db = admin.firestore();
    await db.collection('tasks').doc(id).set(
      {
        ...(title !== undefined ? { title } : {}),
        ...(reward !== undefined ? { reward } : {}),
        ...(type !== undefined ? { type } : {}),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const updated = await db.collection('tasks').doc(id).get();
    return NextResponse.json({ ok: true, task: { id: updated.id, ...(updated.data() as any) } });
  } catch (e) {
    console.error(e);
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
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
  }
}
