// app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import admin from '../../../lib/firebaseAdmin';


export async function GET(req: Request) {
try {
const url = new URL(req.url);
const userId = url.searchParams.get('userId') || 'demo-user-1';
const db = admin.firestore();
const doc = await db.collection('users').doc(userId).get();
const user = doc.exists ? doc.data() : { id: userId, points: 0, level: 1, lastClaimISO: null };
return NextResponse.json({ ok: true, data: user });
} catch (e) {
console.error(e);
return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
}
}
