import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Assignments: React.FC = () => {
  const [assignments, setAssignments] = useState([]);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user?.baseId) {
      apiClient.get('/assignments', { params: { baseId: user.baseId } })
        .then(res => setAssignments(res.data))
        .catch(err => console.error('Failed to load assignments', err));
    }
  }, [user]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="font-stencil text-2xl tracking-widest uppercase">Active Assignments</h2>
      <div className="dimension-line"></div>
      
      <div className="callout-box p-0 overflow-hidden">
        <table className="w-full text-left text-sm font-mono">
          <thead className="border-b-2 border-stencil-ink bg-stencil-ink text-stencil-bg">
            <tr>
              <th className="p-3 uppercase tracking-wider">Date</th>
              <th className="p-3 uppercase tracking-wider">Equipment</th>
              <th className="p-3 uppercase tracking-wider">Assigned To</th>
              <th className="p-3 uppercase tracking-wider">Status</th>
              <th className="p-3 uppercase tracking-wider text-right">Qty</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center opacity-50 italic">NO DATA LOGGED</td></tr>
            ) : assignments.map((a: any) => (
              <tr key={a.id} className="border-b border-stencil-ink/20 hover:bg-stencil-ink/10 transition-colors">
                <td className="p-3">{new Date(a.createdAt).toLocaleDateString()}</td>
                <td className="p-3 font-bold">{a.equipmentType.name}</td>
                <td className="p-3 uppercase">{a.assignedTo}</td>
                <td className={`p-3 font-bold ${a.status === 'ACTIVE' ? 'text-stencil-olive' : 'opacity-50'}`}>
                  {a.status}
                </td>
                <td className="p-3 text-right font-bold">{a.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
