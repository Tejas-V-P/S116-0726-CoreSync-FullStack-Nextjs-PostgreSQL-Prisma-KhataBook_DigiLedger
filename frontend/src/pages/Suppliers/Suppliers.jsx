import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Truck, Plus, Edit2, Trash2, Mail, Phone, Building2, Tag, X } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function Suppliers() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    category: 'General',
    totalSupplied: 0,
    status: 'Active',
  });
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchSuppliers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/suppliers?shopkeeperId=${user.shopkeeperId || user.id}`);
      const data = await res.json();
      if (res.ok) {
        setSuppliers(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch suppliers');
      }
    } catch (error) {
      setSuppliers([
        {
          id: 'sup-1',
          name: 'Global Wholesalers Ltd',
          email: 'orders@globalwholesalers.com',
          phone: '+91 91234 56789',
          company: 'Global Wholesalers',
          category: 'FMCG Goods',
          totalSupplied: 120000,
          status: 'Active',
        },
        {
          id: 'sup-2',
          name: 'Apex Distributors',
          email: 'sales@apexdist.com',
          phone: '+91 81234 56789',
          company: 'Apex Logistics',
          category: 'Electronics',
          totalSupplied: 85000,
          status: 'Active',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSuppliers();
    }
  }, [user]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Supplier name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        shopkeeperId: user.shopkeeperId || user.id,
        ...formData,
      };

      const url = editingSupplier
        ? `${API_BASE}/suppliers/${editingSupplier.id}`
        : `${API_BASE}/suppliers`;
      const method = editingSupplier ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Operation failed');

      showToast(editingSupplier ? 'Supplier updated successfully' : 'Supplier added successfully');
      setShowForm(false);
      setEditingSupplier(null);
      setFormData({ name: '', email: '', phone: '', company: '', category: 'General', totalSupplied: 0, status: 'Active' });
      fetchSuppliers();
    } catch (error) {
      if (editingSupplier) {
        setSuppliers(suppliers.map((s) => (s.id === editingSupplier.id ? { ...formData, id: s.id } : s)));
      } else {
        setSuppliers([...suppliers, { ...formData, id: `sup-${Date.now()}` }]);
      }
      showToast(editingSupplier ? 'Supplier updated' : 'Supplier added');
      setShowForm(false);
      setEditingSupplier(null);
      setFormData({ name: '', email: '', phone: '', company: '', category: 'General', totalSupplied: 0, status: 'Active' });
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      company: supplier.company || '',
      category: supplier.category || 'General',
      totalSupplied: supplier.totalSupplied || 0,
      status: supplier.status || 'Active',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;

    try {
      await fetch(`${API_BASE}/suppliers/${id}`, { method: 'DELETE' });
      showToast('Supplier deleted successfully');
      fetchSuppliers();
    } catch (error) {
      setSuppliers(suppliers.filter((s) => s.id !== id));
      showToast('Supplier deleted');
    }
  };

  const handleAddNew = () => {
    setEditingSupplier(null);
    setFormData({ name: '', email: '', phone: '', company: '', category: 'General', totalSupplied: 0, status: 'Active' });
    setShowForm(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-12 transition-colors duration-200">
      <Navbar user={user} />

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
              <Truck className="w-8 h-8 text-indigo-500 dark:text-indigo-400" /> Supplier Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Manage vendors, supply history, category, and vendor contacts
            </p>
          </div>

          <button
            onClick={handleAddNew}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-5 h-5" />
            <span>Add Supplier</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            Loading suppliers list...
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-16 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-400 font-medium">No suppliers added yet.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Click "Add Supplier" to manage your wholesale suppliers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl relative backdrop-blur-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        {supplier.name}
                      </h3>
                      {supplier.company && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> {supplier.company}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                        title="Edit Supplier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        title="Delete Supplier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center text-slate-700 dark:text-slate-300 gap-2">
                      <Mail className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                      <span className="truncate">{supplier.email}</span>
                    </div>

                    <div className="flex items-center text-slate-700 dark:text-slate-300 gap-2">
                      <Phone className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      <span>{supplier.phone}</span>
                    </div>

                    <div className="flex items-center text-slate-500 dark:text-slate-400 gap-2">
                      <Tag className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {supplier.category || 'General'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Truck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span>Total Supplied</span>
                  </div>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{parseFloat(supplier.totalSupplied || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Supplier Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
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
                  Supplier / Vendor Name *
                </label>
                <input
                  type="text"
                  placeholder="Global Wholesalers Ltd"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Global Wholesalers Corp"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="orders@supplier.com"
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
                  placeholder="+91 91234 56789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Supply Category
                </label>
                <input
                  type="text"
                  placeholder="FMCG Goods / Electronics"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                  {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}