import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, Lock, User } from 'lucide-react';

import { API_BASE } from '../config/api';

export default function TransactionForm({ transaction, user, onSubmit, onCancel, onShowToast }) {
  const isEditing = Boolean(transaction);
  const [type, setType] = useState(transaction?.type || 'CREDIT');
  const [amount, setAmount] = useState(transaction?.amount ? String(transaction.amount) : '');
  const [partyName, setPartyName] = useState(transaction?.partyName || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [lockAcquired, setLockAcquired] = useState(false);

  // Acquire edit lock if editing
  useEffect(() => {
    let isMounted = true;
    if (isEditing && transaction?.id && user) {
      fetch(`${API_BASE}/transactions/${transaction.id}/lock?userId=${user.id || user.shopkeeperId}`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) {
            if (data.success) {
              setLockAcquired(true);
            } else if (data.error) {
              onShowToast(data.error || 'Transaction locked by another user', 'error');
              onCancel();
            }
          }
        })
        .catch((err) => {
          console.error('Failed to acquire edit lock:', err);
        });
    }

    return () => {
      isMounted = false;
      // Release lock on unmount
      if (isEditing && transaction?.id && user) {
        fetch(`${API_BASE}/transactions/${transaction.id}/lock?userId=${user.id || user.shopkeeperId}`, {
          method: 'DELETE',
        }).catch(() => {});
      }
    };
  }, [isEditing, transaction?.id, user]);

  const validate = () => {
    const newErrors = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        shopkeeperId: user.shopkeeperId || user.id,
        userId: user.id || user.shopkeeperId,
        type,
        amount: parseFloat(amount),
        partyName: partyName.trim(),
        description: description.trim(),
        version: transaction?.version,
      };

      const url = isEditing
        ? `${API_BASE}/transactions/${transaction.id}`
        : `${API_BASE}/transactions`;

      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Operation failed');
      }

      onSubmit();
    } catch (err) {
      onShowToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-slate-900 dark:text-slate-100 transition-colors">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {isEditing ? (
            <>
              <Lock className="w-5 h-5 text-amber-500 dark:text-amber-400" /> Edit Transaction
            </>
          ) : (
            '➕ New Transaction'
          )}
        </h2>
        <button
          onClick={onCancel}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('CREDIT')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm border transition-all ${
                type === 'CREDIT'
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/50 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              CREDIT (Got)
            </button>

            <button
              type="button"
              onClick={() => setType('DEBIT')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm border transition-all ${
                type === 'DEBIT'
                  ? 'bg-rose-500/10 text-rose-700 border-rose-500/40 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/50 shadow-md shadow-rose-500/10'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              DEBIT (Gave)
            </button>
          </div>
        </div>

        {/* Person / Organization Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Person / Organization Name
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Ramesh Kumar or Acme Corp"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          {errors.amount && <p className="text-rose-500 text-xs mt-1.5">{errors.amount}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Description / Reason
          </label>
          <textarea
            rows="3"
            placeholder="e.g. Received payment for groceries"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
          {errors.description && (
            <p className="text-rose-500 text-xs mt-1.5">{errors.description}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/30"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}