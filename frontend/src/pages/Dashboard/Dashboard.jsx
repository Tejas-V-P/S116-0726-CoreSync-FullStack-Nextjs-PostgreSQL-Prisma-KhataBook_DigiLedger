import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionList from '../../components/TransactionList';
import TransactionForm from '../../components/TransactionForm';
import AuditModal from '../../components/AuditModal';
import { Plus, Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import { API_BASE } from '../../config/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const storageKey = user ? `khatabook_txs_${user.email || user.id}` : null;

  const [transactions, setTransactions] = useState(() => {
    if (!storageKey) return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [balanceData, setBalanceData] = useState(() => {
    let totalCredits = 0;
    let totalDebits = 0;
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const list = JSON.parse(saved);
          list.forEach((tx) => {
            if (tx.type === 'CREDIT') totalCredits += parseFloat(tx.amount) || 0;
            if (tx.type === 'DEBIT') totalDebits += parseFloat(tx.amount) || 0;
          });
        }
      } catch (e) {}
    }
    return { balance: totalCredits - totalDebits, totalCredits, totalDebits };
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(() => transactions.length === 0);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [auditTransactionId, setAuditTransactionId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchTransactions = async (page = 1) => {
    if (!user) return;
    if (transactions.length === 0) setLoading(true);
    const key = `khatabook_txs_${user.email || user.id}`;
    try {
      const res = await fetch(
        `${API_BASE}/transactions?shopkeeperId=${user.shopkeeperId || user.id}&page=${page}&limit=10`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch transactions');

      setTransactions(data.data || []);
      setCurrentPage(data.pagination?.page || 1);
      setTotalPages(data.pagination?.totalPages || 1);
      localStorage.setItem(key, JSON.stringify(data.data || []));
    } catch (error) {
      console.warn('Backend server offline or endpoint error:', error.message);
      const saved = localStorage.getItem(key);
      if (saved) {
        setTransactions(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `${API_BASE}/balance?shopkeeperId=${user.shopkeeperId || user.id}`
      );
      const data = await res.json();
      if (res.ok) {
        setBalanceData({
          balance: parseFloat(data.balance) || 0,
          totalCredits: parseFloat(data.totalCredits) || 0,
          totalDebits: parseFloat(data.totalDebits) || 0,
        });
      }
    } catch (error) {
      console.error('Balance error:', error);
    }
  };

  const refreshData = () => {
    fetchTransactions(currentPage);
    fetchBalance();
  };

  useEffect(() => {
    if (user) {
      fetchTransactions(1);
      fetchBalance();
    }
  }, [user]);

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to soft-delete this transaction entry?')) return;

    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || user.shopkeeperId,
          shopkeeperId: user.shopkeeperId || user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete transaction');

      showToast('Transaction soft-deleted with audit entry', 'success');
      refreshData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingTransaction(null);
    refreshData();
    showToast(editingTransaction ? 'Transaction updated' : 'Transaction created', 'success');
  };

  if (!user) return null;

  return (
    <div className="pb-12">

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium border transition-all animate-bounce ${
            toastType === 'error'
              ? 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40'
              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
          }`}
        >
          {toastMessage}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Ledger Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Shopkeeper account: <span className="font-semibold text-indigo-600 dark:text-indigo-300">{user.email}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleAddTransaction}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-5 h-5" />
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Net Balance Card */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Net Running Balance
              </span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div
                className={`text-3xl font-extrabold font-mono ${
                  balanceData.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                ₹{balanceData.balance.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Net = Total Received (Credit) - Total Given (Debit)
              </p>
            </div>
          </div>

          {/* Total Credit Card */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Credit (Received)
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                ₹{balanceData.totalCredits.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Incoming payments / collections</p>
            </div>
          </div>

          {/* Total Debit Card */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Debit (Given)
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
                ₹{balanceData.totalDebits.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Outgoing credit / pending collections</p>
            </div>
          </div>
        </div>

        {/* Transactions Table Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transaction History</h2>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Showing Page {currentPage} of {totalPages}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              Loading digital ledger records...
            </div>
          ) : (
            <TransactionList
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onViewAudit={(id) => setAuditTransactionId(id)}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => fetchTransactions(currentPage - 1)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-all shadow-sm"
              >
                Previous
              </button>

              <span className="text-xs text-slate-500 dark:text-slate-400">
                Page {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => fetchTransactions(currentPage + 1)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm">
          <TransactionForm
            transaction={editingTransaction}
            user={user}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
            onShowToast={showToast}
          />
        </div>
      )}

      {/* Audit History Modal */}
      {auditTransactionId && (
        <AuditModal
          transactionId={auditTransactionId}
          onClose={() => setAuditTransactionId(null)}
        />
      )}
    </div>
  );
}
