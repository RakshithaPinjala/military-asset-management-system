import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Purchases: React.FC = () => {
  const [purchases, setPurchases] = useState([]);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user?.baseId) {
      apiClient.get('/purchases', { params: { baseId: user.baseId } })
        .then(res => setPurchases(res.data))
        .catch(err => console.error('Failed to load purchases', err));
    }
  }, [user]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="font-stencil text-2xl tracking-widest uppercase">Purchase Manifests</h2>
      <div className="dimension-line"></div>
      
      <div className="callout-box p-0 overflow-hidden">
        <table className="w-full text-left text-sm font-mono">
          <thead className="border-b-2 border-stencil-ink bg-stencil-ink text-stencil-bg">
            <tr>
              <th className="p-3 uppercase tracking-wider">Date</th>
              <th className="p-3 uppercase tracking-wider">Equipment</th>
              <th className="p-3 uppercase tracking-wider">Supplier</th>
              <th className="p-3 uppercase tracking-wider text-right">Qty</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center opacity-50 italic">NO DATA LOGGED</td></tr>
            ) : purchases.map((p: any) => (
              <tr key={p.id} className="border-b border-stencil-ink/20 hover:bg-stencil-ink/10 transition-colors">
                <td className="p-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="p-3 font-bold">{p.equipmentType.name}</td>
                <td className="p-3 opacity-70">{p.supplier || 'UNKNOWN'}</td>
                <td className="p-3 text-right font-bold">{p.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
