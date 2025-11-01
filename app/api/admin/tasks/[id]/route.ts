// app/api/admin/tasks/[id]/route.ts
import { NextResponse } from 'next/server';
import admin from '../../../../../lib/firebaseAdmin';


export async function PUT(req: Request, { params }: { params: { id: string } }) {
try {
const token = req.headers.get('x-admin-token');
if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });


const body = await req.json();
const { title, reward, type } = body;
const db = admin.firestore();
await db.collection('tasks').doc(params.id).set({ title, reward, type }, { merge: true });
const updated = await db.collection('tasks').doc(params.id).get();
return NextResponse.json({ ok: true, task: { id: updated.id, ...(updated.data() as any) } });
} catch (e) {
console.error(e);
return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
}
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
try {
const token = req.headers.get('x-admin-token');
if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });


const db = admin.firestore();
await db.collection('tasks').doc(params.id).delete();
return NextResponse.json({ ok: true });
} catch (e) {
console.error(e);
return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
}
}
