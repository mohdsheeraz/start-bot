// app/api/admin/tasks/route.ts
import { NextResponse } from 'next/server';
import admin from '../../../../lib/firebaseAdmin';


export async function POST(req: Request) {
try {
const token = req.headers.get('x-admin-token');
if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });


const body = await req.json();
const { title, reward, type } = body;
if (!title) return NextResponse.json({ ok: false, error: 'missing title' }, { status: 400 });


const db = admin.firestore();
const docRef = await db.collection('tasks').add({ title, reward: reward || 0, type: type || 'generic', createdAt: admin.firestore.FieldValue.serverTimestamp() });
const doc = await docRef.get();
return NextResponse.json({ ok: true, task: { id: doc.id, ...(doc.data() as any) } });
} catch (e) {
console.error(e);
return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
}
}
