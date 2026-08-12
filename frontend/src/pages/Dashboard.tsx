import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type StatRow = {
  equipmentTypeId: string;
  equipmentName: string;
  category: string;
  openingBalance: number;
  purchases: number;
  transfersIn: number;
  transfersOut: number;
  netMovement: number;
  assignments: number;
  expenditures: number;
  closingBalance: number;
};

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/dashboard/stats', {
          params: { baseId: user?.baseId }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.baseId) fetchStats();
  }, [user]);

  if (loading) return <div className="font-mono text-sm tracking-widest uppercase">Initializing Ledger...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="font-stencil text-2xl tracking-widest uppercase">Live Ledger // Global</h2>
        <div className="text-xs font-mono font-bold tracking-widest border border-stencil-ink px-3 py-1">
          {new Date().toISOString().split('T')[0]}
        </div>
      </div>

      <div className="dimension-line"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.equipmentTypeId} className="callout-box bg-stencil-bg group hover:bg-stencil-ink transition-colors duration-300">
            <h3 className="font-stencil text-xl tracking-wider mb-2 group-hover:text-stencil-bg">{stat.equipmentName}</h3>
            <div className="text-xs font-mono opacity-70 mb-4 group-hover:text-stencil-bg/70 uppercase">CAT: {stat.category}</div>
            
            <div className="space-y-2 font-mono text-sm group-hover:text-stencil-bg">
              <div className="flex justify-between border-b border-stencil-ink/20 pb-1">
                <span>STOCK:</span>
                <span className="font-bold">{stat.closingBalance}</span>
              </div>
              <div className="flex justify-between border-b border-stencil-ink/20 pb-1">
                <span>ASSIGNED:</span>
                <span className="font-bold">{stat.assignments}</span>
              </div>
              <div className={`flex justify-between pb-1 ${stat.expenditures > 0 ? 'text-stencil-hazard' : ''}`}>
                <span>EXPENDED:</span>
                <span className="font-bold">{stat.expenditures}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dimension-line"></div>

      <div className="callout-box h-80 pt-6">
        <h3 className="font-stencil text-lg tracking-widest mb-6 px-4">Stock Visualization</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats}>
            <XAxis dataKey="equipmentName" stroke="#101010" tick={{fontFamily: 'Space Grotesk', fontSize: 12}} />
            <YAxis stroke="#101010" tick={{fontFamily: 'Space Grotesk', fontSize: 12}} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#F4F2EC', border: '1px solid #101010', borderRadius: 0, fontFamily: 'Space Grotesk' }}
              cursor={{fill: '#101010', opacity: 0.1}}
            />
            <Bar dataKey="closingBalance" fill="#101010" />
            <Bar dataKey="assignments" fill="#3C4A3D" />
            <Bar dataKey="expenditures" fill="#E8B009" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
