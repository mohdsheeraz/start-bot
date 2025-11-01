'use client';
import React, { useEffect, useState } from 'react';

type User = { id:string, points:number, wallet?:string|null };

export default function WalletPage(){
  const [user,setUser] = useState<User|null>(null);
  const [saving,setSaving] = useState(false);
  const [addr,setAddr] = useState('');
  const userId = typeof window !== 'undefined' ? (localStorage.getItem('userId') || 'demo-user-1') : 'demo-user-1';

  useEffect(()=>{
    fetch(`/api/dashboard?userId=${userId}`).then(r=>r.json()).then(d=>{ if(d.ok){ setUser(d.data); setAddr(d.data?.wallet || ''); } });
  },[]);

  async function save(){
    setSaving(true);
    try{
      const res = await fetch('/api/user/save-wallet',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId, wallet: addr }) });
      const d = await res.json();
      if(!res.ok || !d.ok) throw new Error(d.error||'Save failed');
      setUser(d.user);
      alert('Wallet saved.');
    }catch(e:any){ alert(e.message||'Error'); }finally{ setSaving(false); }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Wallet</h1>
      <div>Balance: <strong>{user?.points ?? 0}</strong> pts</div>
      <div className="mt-4">
        <label className="block mb-2">TON Address</label>
        <input value={addr} onChange={(e)=>setAddr(e.target.value)} className="p-2 border rounded w-full" placeholder="Enter TON wallet address" />
        <div className="mt-2">
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save Address'}</button>
        </div>
      </div>
    </div>
  );
}
