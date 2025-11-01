'use client';
import React, { useEffect, useState } from 'react';

type User = { id:string, points:number, level:number, lastClaimISO?:string|null, wallet?:string|null, username?:string };

export default function DashboardPage(){
  const [user,setUser] = useState<User|null>(null);
  const [loading,setLoading] = useState(true);
  const [claiming,setClaiming] = useState(false);
  const userId = typeof window !== 'undefined' ? (localStorage.getItem('userId') || 'demo-user-1') : 'demo-user-1';

  useEffect(()=>{
    fetch(`/api/dashboard?userId=${userId}`).then(r=>r.json()).then(d=>{ if(d.ok) setUser(d.data); setLoading(false); }).catch(()=>setLoading(false));
  },[]);

  function canClaimNow(){
    if(!user?.lastClaimISO) return true;
    const last = new Date(user.lastClaimISO).getTime();
    return Date.now() - last >= 24*60*60*1000;
  }

  async function handleClaim(){
    if(!user) return;
    setClaiming(true);
    try{
      const res = await fetch('/api/claim',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId: user.id }) });
      const d = await res.json();
      if(!res.ok || !d.ok) throw new Error(d.error||'Claim failed');
      setUser(d.user);
    }catch(e:any){
      alert(e.message||'Claim error');
    }finally{ setClaiming(false); }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mining Dashboard</h1>
      {loading ? <div>Loading...</div> : (
        <>
          <div className="mb-4">
            <div>Points: <strong>{user?.points ?? 0}</strong></div>
            <div>Level: <strong>{user?.level ?? 1}</strong></div>
            <div>Wallet: <strong>{user?.wallet ?? 'Not set'}</strong></div>
            <div>Last claim: <strong>{user?.lastClaimISO ?? 'Never'}</strong></div>
          </div>

          <button onClick={handleClaim} disabled={!canClaimNow() || claiming}
            className={`px-4 py-2 rounded ${canClaimNow() ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
            {claiming ? 'Claiming...' : canClaimNow() ? 'Tap to Claim 24h Reward' : 'Claim available after 24h'}
          </button>

          <p className="mt-4 text-sm text-gray-500">Tap once every 24 hours to claim mining reward. Upgrade level in Shop to increase rewards.</p>
        </>
      )}
    </div>
  );
}
