// app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import admin from '../../../lib/firebaseAdmin';


export async function GET() {
try {
const db = admin.firestore();
const snaps = await db.collection('tasks').orderBy('createdAt', 'desc').get();
const tasks = snaps.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
return NextResponse.json({ ok: true, data: tasks });
} catch (e) {
console.error(e);
return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
}
}
