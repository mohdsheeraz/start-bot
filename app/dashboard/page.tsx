'use client';
import React, { useEffect, useState } from 'react';

type User = { 
  id: string;
  points: number; 
  level: number;
  miningPower: number;
  lastClaimISO?: string | null;
  wallet?: string | null;
  username?: string;
  completedTasks: string[];
  totalEarned: number;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [currentEarnings, setCurrentEarnings] = useState(0);

  // Initialize Telegram user
  useEffect(() => {
    const initTelegram = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        WebApp.expand();

        if (WebApp.initDataUnsafe?.user) {
          const tgUser = WebApp.initDataUnsafe.user;
          const tgUserId = tgUser.id.toString();
          setUserId(tgUserId);
          localStorage.setItem('userId', tgUserId);
        } else {
          // Fallback for development
          const fallbackId = localStorage.getItem('userId') || 'demo-user-' + Math.random().toString(36).substr(2, 9);
          setUserId(fallbackId);
        }
      } catch (error) {
        console.error('Telegram init error:', error);
        const fallbackId = localStorage.getItem('userId') || 'demo-user-' + Math.random().toString(36).substr(2, 9);
        setUserId(fallbackId);
      }
    };

    initTelegram();
  }, []);

  // Fetch user data
  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Mining simulation effect
  useEffect(() => {
    if (!user) return;

    const earningsPerSecond = (user.level * 0.1) + (user.miningPower * 0.05);
    const interval = setInterval(() => {
      setCurrentEarnings(prev => prev + earningsPerSecond);
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard?userId=${userId}`);
      const data = await response.json();
      
      if (data.ok) {
        setUser(data.data);
      } else {
        console.error('Failed to fetch user:', data.error);
      }
    } catch (error) {
      console.error('Fetch user error:', error);
    } finally {
      setLoading(false);
    }
  };

  function canClaimNow() {
    if (!user?.lastClaimISO) return true;
    const lastClaimTime = new Date(user.lastClaimISO).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - lastClaimTime >= twentyFourHours;
  }

  function getTimeUntilNextClaim() {
    if (!user?.lastClaimISO) return 'Now';
    
    const lastClaimTime = new Date(user.lastClaimISO).getTime();
    const nextClaimTime = lastClaimTime + (24 * 60 * 60 * 1000);
    const timeLeft = nextClaimTime - Date.now();
    
    if (timeLeft <= 0) return 'Now';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  async function handleClaim() {
    if (!user) return;
    
    setClaiming(true);
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Claim failed');
      }
      
      setUser(data.user);
      setCurrentEarnings(0); // Reset current earnings after claim
      alert(`Successfully claimed reward! +${data.reward || 'unknown'} points`);
    } catch (error: any) {
      console.error('Claim error:', error);
      alert(error.message || 'Claim error occurred');
    } finally {
      setClaiming(false);
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  }

  // Calculate estimated daily earnings
  const estimatedDailyEarnings = user ? Math.floor((user.level * 0.1 + user.miningPower * 0.05) * 86400) : 0;

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Mining Dashboard</h1>
        <p className="text-gray-600 mt-2">Earn points by mining and completing tasks</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-700">{user?.points ?? 0}</div>
          <div className="text-sm text-blue-600">Total Points</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-700">Level {user?.level ?? 1}</div>
          <div className="text-sm text-green-600">Mining Level</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-700">{user?.miningPower ?? 1}</div>
          <div className="text-sm text-purple-600">Mining Power</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-700">{user?.completedTasks?.length ?? 0}</div>
          <div className="text-sm text-orange-600">Tasks Done</div>
        </div>
      </div>

      {/* Mining Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Active Mining</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Current Session:</span>
            <span className="font-semibold">{Math.floor(currentEarnings)} points</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Estimated Daily:</span>
            <span className="font-semibold">{estimatedDailyEarnings} points</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Earned:</span>
            <span className="font-semibold">{user?.totalEarned ?? 0} points</span>
          </div>
        </div>
      </div>

      {/* Claim Reward Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Daily Reward</h2>
        
        <button 
          onClick={handleClaim}
          disabled={!canClaimNow() || claiming}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
            canClaimNow() 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          } ${claiming ? 'opacity-70' : ''}`}
        >
          {claiming ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Claiming...
            </div>
          ) : canClaimNow() ? (
            'Claim 24-Hour Mining Reward'
          ) : (
            `Next Claim in ${getTimeUntilNextClaim()}`
          )}
        </button>
        
        <div className="mt-3 text-sm text-gray-600">
          <p>🎯 Base Reward: 100 points + Level Bonus</p>
          <p>⏰ Available every 24 hours</p>
          <p>📈 Higher levels = More rewards</p>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Account Info</h2>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">User ID:</span>
            <span className="font-mono text-sm">{user?.id}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Wallet Address:</span>
            <span className="font-mono text-sm truncate max-w-[150px]">
              {user?.wallet || 'Not set'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Last Claim:</span>
            <span className="text-sm">{formatDate(user?.lastClaimISO)}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <a 
          href="/shop" 
          className="bg-green-600 text-white py-2 px-4 rounded text-center hover:bg-green-700 transition-colors"
        >
          🛍️ Shop
        </a>
        <a 
          href="/tasks" 
          className="bg-purple-600 text-white py-2 px-4 rounded text-center hover:bg-purple-700 transition-colors"
        >
          📋 Tasks
        </a>
        <a 
          href="/wallet" 
          className="bg-orange-600 text-white py-2 px-4 rounded text-center hover:bg-orange-700 transition-colors"
        >
          💰 Wallet
        </a>
        <button 
          onClick={fetchUserData}
          className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}
