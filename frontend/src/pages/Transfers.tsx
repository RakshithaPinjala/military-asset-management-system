import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Transfers: React.FC = () => {
  const [transfers, setTransfers] = useState([]);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user?.baseId) {
      apiClient.get('/transfers', { params: { baseId: user.baseId } })
        .then(res => setTransfers(res.data))
        .catch(err => console.error('Failed to load transfers', err));
    }
  }, [user]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="font-stencil text-2xl tracking-widest uppercase">Transfer Manifests</h2>
      <div className="dimension-line"></div>
      
      <div className="callout-box p-0 overflow-hidden">
        <table className="w-full text-left text-sm font-mono">
          <thead className="border-b-2 border-stencil-ink bg-stencil-ink text-stencil-bg">
            <tr>
              <th className="p-3 uppercase tracking-wider">Date</th>
              <th className="p-3 uppercase tracking-wider">Type</th>
              <th className="p-3 uppercase tracking-wider">Equipment</th>
              <th className="p-3 uppercase tracking-wider">Route</th>
              <th className="p-3 uppercase tracking-wider text-right">Qty</th>
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center opacity-50 italic">NO DATA LOGGED</td></tr>
            ) : transfers.map((t: any) => {
              const isInbound = t.destinationBaseId === user?.baseId;
              return (
                <tr key={t.id} className="border-b border-stencil-ink/20 hover:bg-stencil-ink/10 transition-colors">
                  <td className="p-3">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className={`p-3 font-bold ${isInbound ? 'text-stencil-olive' : 'text-stencil-hazard'}`}>
                    {isInbound ? 'INBOUND' : 'OUTBOUND'}
                  </td>
                  <td className="p-3 font-bold">{t.equipmentType.name}</td>
                  <td className="p-3 text-xs opacity-70">
                    {t.sourceBase.name} → {t.destinationBase.name}
                  </td>
                  <td className="p-3 text-right font-bold">{t.quantity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
