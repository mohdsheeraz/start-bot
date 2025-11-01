// app/api/user/save-wallet/route.ts
import { NextResponse } from 'next/server';
import admin from '../../../lib/firebaseAdmin';


export async function POST(req: Request) {
try {
const body = await req.json();
const { userId, wallet } = body;
if (!userId) return NextResponse.json({ ok: false, error: 'missing userId' }, { status: 400 });


const db = admin.firestore();
const uRef = db.collection('users').doc(userId);
await uRef.set({ wallet }, { merge: true });
const newSnap = await uRef.get();
return NextResponse.json({ ok: true, user: newSnap.data() });
} catch (e) {
console.error(e);
return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
}
}
