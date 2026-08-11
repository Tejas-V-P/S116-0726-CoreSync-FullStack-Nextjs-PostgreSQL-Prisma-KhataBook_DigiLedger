import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Edit2, Trash2, Mail, Phone, MapPin, X, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import { API_BASE } from '../../config/api';

export default function Customers() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const storageKey = user ? `khatabook_customers_${user.email || user.id}` : null;

  const [customers, setCustomers] = useState(() => {
    if (!storageKey) return [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'cust-1',
        name: 'Retail Store A',
        email: 'contact@retaila.com',
        phone: '+91 98765 43210',
        address: 'Bangalore, Karnataka',
        totalPurchased: 65000,
        lastOrder: '2024-07-18',
      },
      {
        id: 'cust-2',
        name: 'Shop B',
        email: 'info@shopb.com',
        phone: '+91 87654 32109',
        address: 'Pune, Maharashtra',
        totalPurchased: 42500,
        lastOrder: '2024-07-16',
      },
    ];
  });

  const [loading, setLoading] = useState(() => customers.length === 0);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    totalPurchased: 0,
  });
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchCustomers = async () => {
    if (!user) return;
    if (customers.length === 0) setLoading(true);
    const key = `khatabook_customers_${user.email || user.id}`;
    try {
      const res = await fetch(`${API_BASE}/customers?shopkeeperId=${user.shopkeeperId || user.id}`);
      const data = await res.json();
      if (res.ok) {
        setCustomers(data.data || []);
        localStorage.setItem(key, JSON.stringify(data.data || []));
      } else {
        throw new Error(data.error || 'Failed to fetch customers');
      }
    } catch (error) {
      const saved = localStorage.getItem(key);
      if (saved) {
        setCustomers(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Customer name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const key = `khatabook_customers_${user.email || user.id}`;

    try {
      const payload = {
        shopkeeperId: user.shopkeeperId || user.id,
        ...formData,
      };

      const url = editingCustomer
        ? `${API_BASE}/customers/${editingCustomer.id}`
        : `${API_BASE}/customers`;
      const method = editingCustomer ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Operation failed');

      showToast(editingCustomer ? 'Customer updated successfully' : 'Customer added successfully');
      setShowForm(false);
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', address: '', totalPurchased: 0 });
      fetchCustomers();
    } catch (error) {
      let updated;
      if (editingCustomer) {
        updated = customers.map((c) => (c.id === editingCustomer.id ? { ...formData, id: c.id } : c));
      } else {
        updated = [...customers, { ...formData, id: `cust-${Date.now()}`, lastOrder: new Date().toISOString() }];
      }
      setCustomers(updated);
      localStorage.setItem(key, JSON.stringify(updated));
      showToast(editingCustomer ? 'Customer updated' : 'Customer added');
      setShowForm(false);
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', address: '', totalPurchased: 0 });
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      totalPurchased: customer.totalPurchased || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    const key = `khatabook_customers_${user.email || user.id}`;

    try {
      await fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE' });
      showToast('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      const updated = customers.filter((c) => c.id !== id);
      setCustomers(updated);
      localStorage.setItem(key, JSON.stringify(updated));
      showToast('Customer deleted');
    }
  };

  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', address: '', totalPurchased: 0 });
    setShowForm(true);
  };

  if (!user) return null;

  return (
    <div className="pb-12">

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-500 dark:text-indigo-400" /> Customer Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Track customer accounts, contact details, and total purchases
            </p>
          </div>

          <button
            onClick={handleAddNew}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-5 h-5" />
            <span>Add Customer</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            Loading customers list...
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-400 font-medium">No customers added yet.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Click "Add Customer" to record your customer directory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl relative backdrop-blur-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                      {customer.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center text-slate-700 dark:text-slate-300 gap-2">
                      <Mail className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>

                    <div className="flex items-center text-slate-700 dark:text-slate-300 gap-2">
                      <Phone className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      <span>{customer.phone}</span>
                    </div>

                    {customer.address && (
                      <div className="flex items-center text-slate-500 dark:text-slate-400 gap-2">
                        <MapPin className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                        <span className="truncate">{customer.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <ShoppingBag className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span>Total Purchased</span>
                  </div>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{parseFloat(customer.totalPurchased || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Customer Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="Retail Store A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="contact@customer.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Address (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="City, State"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  {editingCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}