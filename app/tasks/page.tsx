'use client';
import React, { useEffect, useState } from 'react';

type Task = { id:string, title:string, reward:number, type?:string, completed?:boolean };

export default function TasksPage(){
  const [tasks,setTasks] = useState<Task[]>([]);
  const [loading,setLoading] = useState(true);
  const userId = typeof window !== 'undefined' ? (localStorage.getItem('userId') || 'demo-user-1') : 'demo-user-1';

  useEffect(()=>{
    fetch('/api/tasks').then(r=>r.json()).then(d=>{ if(d.ok) setTasks(d.data); setLoading(false); }).catch(()=>setLoading(false));
  },[]);

  async function completeTask(id:string){
    try{
      const res = await fetch(`/api/tasks/${id}/complete`,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId }) });
      const d = await res.json();
      if(!res.ok || !d.ok) throw new Error(d.error||'Failed');
      setTasks(ts => ts.map(t => t.id === id ? { ...t, completed: true } : t));
      alert('Task completed. Reward added.');
    }catch(e:any){ alert(e.message||'Error'); }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>
      {loading ? <div>Loading...</div> : (
        tasks.length === 0 ? <div>No tasks</div> : (
          tasks.map(t => (
            <div key={t.id} className="p-3 border rounded mb-2 flex justify-between items-center">
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-sm text-gray-500">Reward: {t.reward} pts</div>
              </div>
              <div>
                <button disabled={t.completed} onClick={()=>completeTask(t.id)} className={`px-3 py-1 rounded ${t.completed ? 'bg-green-100' : 'bg-blue-50'}`}>
                  {t.completed ? 'Done' : 'Complete'}
                </button>
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
}
