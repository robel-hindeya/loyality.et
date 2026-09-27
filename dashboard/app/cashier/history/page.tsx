'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { cashierService } from '@/services/cashier.service';
import { companyService } from '@/services/company.service';
import { StampLog, Company } from '@/types';
import {
  History,
  ArrowLeft,
  QrCode,
  Award,
  Calendar,
  CheckCircle2,
  Loader2,
  Store,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function CashierHistoryPage() {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<StampLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const loadHistory = async () => {
      try {
        setLoading(true);
        let compId = profile.company_id;
        if (!compId && profile.role === 'company') {
          const comp = await companyService.getCompanyByOwner(profile.id);
          if (comp) compId = comp.id;
        }

        if (compId) {
          const data = await cashierService.getRecentActivity(compId, profile.id);
          setLogs(data);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/cashier"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Scanner Counter
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Cashier Shift Scan History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audit log of all visit stamps and rewards processed during your shifts.
          </p>
        </div>

        <Link
          href="/cashier"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4" /> Open Scanner
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Program</th>
                <th className="py-3.5 px-6">Action</th>
                <th className="py-3.5 px-6">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No scan activity recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 text-slate-500">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {log.user?.full_name || 'Customer'}
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {log.program?.title || 'Loyalty Card'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        <Award className="w-3.5 h-3.5" /> +{log.stamps_added || 1} Stamp
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {log.notes || 'Counter visit verified'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
