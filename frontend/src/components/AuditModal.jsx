import React, { useEffect, useState } from 'react';
import { X, History, Clock } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function AuditModal({ transactionId, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!transactionId) return;
    setLoading(true);
    fetch(`${API_BASE}/transactions/${transactionId}/audit`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLogs(data.data || []);
        } else {
          setError(data.error || 'Failed to fetch audit log');
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [transactionId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Audit Log History
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
          {loading ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading audit history...</div>
          ) : error ? (
            <div className="text-center py-12 text-rose-500 dark:text-rose-400">{error}</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">No audit records found.</div>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6">
              {logs.map((log) => {
                const formattedDate = new Date(log.timestamp).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                const isCreate = log.changeType === 'CREATE';
                const isUpdate = log.changeType === 'UPDATE';

                return (
                  <div key={log.id} className="relative pl-6">
                    {/* Dot Icon */}
                    <div
                      className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                        isCreate
                          ? 'bg-emerald-500'
                          : isUpdate
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />

                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            isCreate
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : isUpdate
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {log.changeType}
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300">
                        <strong>Changed Fields:</strong>{' '}
                        {Array.isArray(log.fieldsChanged)
                          ? log.fieldsChanged.join(', ')
                          : 'N/A'}
                      </div>

                      {log.newValues && (
                        <div className="mt-2 bg-slate-100 dark:bg-slate-900/80 p-3 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-300 space-y-1">
                          {Object.entries(log.newValues).map(([key, val]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">{key}:</span>
                              <span className="text-indigo-600 dark:text-indigo-300">
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
