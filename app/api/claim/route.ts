// app/api/claim/route.ts
import { NextResponse } from 'next/server';
import admin from '../../../lib/firebaseAdmin';


export async function POST(req: Request) {
try {
const body = await req.json();
const userId = body.userId || 'demo-user-1';
const db = admin.firestore();
const uRef = db.collection('users').doc(userId);
const snap = await uRef.get();
const u = snap.exists ? (snap.data() as any) : { id: userId, points: 0, level: 1, lastClaimISO: null };


const last = u.lastClaimISO ? new Date(u.lastClaimISO).getTime() : 0;
const canClaim = Date.now() - last >= 24 * 60 * 60 * 1000;
if (!canClaim) return NextResponse.json({ ok: false, error: 'Claim not ready' }, { status: 400 });


const reward = 10 + ((u.level || 1) - 1) * 2;
await uRef.set({ ...u, points: (u.points || 0) + reward, lastClaimISO: new Date().toISOString() }, { merge: true });


const newSnap = await uRef.get();
return NextResponse.json({ ok: true, user: newSnap.data() });
} catch (e) {
console.error(e);
return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
}
}
