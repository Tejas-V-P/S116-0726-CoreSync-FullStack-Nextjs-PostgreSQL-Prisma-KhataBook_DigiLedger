import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Edit2, Trash2, History } from 'lucide-react';

export default function TransactionList({ transactions, onEdit, onDelete, onViewAudit }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-600 dark:text-slate-400 font-medium">No transactions recorded yet.</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add a CREDIT or DEBIT entry to populate your digital ledger.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm dark:shadow-xl backdrop-blur-md transition-colors">
      <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
        <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="py-3.5 px-4">Date & Time</th>
            <th className="py-3.5 px-4">Type</th>
            <th className="py-3.5 px-4">Description</th>
            <th className="py-3.5 px-4 text-right">Amount</th>
            <th className="py-3.5 px-4 text-center">Version</th>
            <th className="py-3.5 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map((tx) => {
            const isCredit = tx.type?.toUpperCase() === 'CREDIT';
            const formattedDate = new Date(tx.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {formattedDate}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      isCredit
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {isCredit ? (
                      <>
                        <ArrowUpRight className="w-3.5 h-3.5" /> CREDIT (Received)
                      </>
                    ) : (
                      <>
                        <ArrowDownLeft className="w-3.5 h-3.5" /> DEBIT (Given)
                      </>
                    )}
                  </span>
                </td>

                <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-200">
                  {tx.description}
                </td>

                <td
                  className={`py-3.5 px-4 text-right font-semibold font-mono text-base whitespace-nowrap ${
                    isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isCredit ? '+' : '-'} ₹{parseFloat(tx.amount).toFixed(2)}
                </td>

                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    v{tx.version || 1}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onViewAudit(tx.id)}
                      className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                      title="View Audit History"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                      title="Edit Transaction"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(tx.id)}
                      className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}