import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building2, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getOrders, getOrderById } from '../api/orders';
import { updateProfile, changePassword } from '../api/users';
import { Link } from 'react-router-dom';

const CustomerProfile = () => {
  const { user } = useAuthStore();
  const [recentOrders, setRecentOrders] = useState([]);

  const [profile, setProfile] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    company: user?.company || '',
    phone: '',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false });
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    getOrders({ limit: 2 })
      .then(async (data) => {
        const list = data.orders || data.data || data;
        const orderList = Array.isArray(list) ? list.slice(0, 2) : [];
        // Fetch full details (with items) for each order
        const detailed = await Promise.all(
          orderList.map(async (order) => {
            try {
              const detail = await getOrderById(order.id);
              const full = detail.order || detail.data || detail;
              return { ...order, ...full };
            } catch {
              return order;
            }
          })
        );
        setRecentOrders(detailed);
      })
      .catch(() => setRecentOrders([]));
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        companyName: profile.company,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update profile');
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPwdError('');
    if (!pwd.current) { setPwdError('Please enter your current password.'); return; }
    if (pwd.newPwd.length < 8) { setPwdError('New password must be at least 8 characters.'); return; }
    if (pwd.newPwd !== pwd.confirm) { setPwdError('Passwords do not match.'); return; }
    try {
      await changePassword({
        currentPassword: pwd.current,
        newPassword: pwd.newPwd,
      });
      setPwdSaved(true);
      setPwd({ current: '', newPwd: '', confirm: '' });
      setTimeout(() => setPwdSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setPwdError(err.message || 'Failed to change password');
    }
  };

  const PwdInput = ({ field, label }) => (
    <div>
      <label className="block text-sm font-semibold text-neutral mb-1">{label}</label>
      <div className="relative">
        <input
          type={showPwd[field] ? 'text' : 'password'}
          value={pwd[field]}
          onChange={e => setPwd({ ...pwd, [field]: e.target.value })}
          className="input-medical pr-10"
          placeholder="••••••••"
        />
        <button type="button" onClick={() => setShowPwd({ ...showPwd, [field]: !showPwd[field] })}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {showPwd[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white to-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-display text-2xl">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <h1 className="font-display text-3xl text-neutral">{user?.name}</h1>
            <p className="text-gray-500 text-sm">{user?.email} · Customer Account</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-neutral">Recent Orders</h2>
            <Link to="/orders" className="text-primary text-sm font-semibold hover:text-primary/80">View All →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map(order => {
                const items = order.items || order.order_items || [];
                return (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-neutral text-sm">{order.order_number || order.id}</p>
                          <p className="text-xs text-gray-400">{new Date(order.created_at || order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary text-sm">${Number(order.total_amount || order.total || 0).toFixed(2)}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'payment_confirmed' || order.status === 'awaiting_fulfillment' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'fully_shipped' || order.status === 'partially_shipped' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{(order.status || 'pending').replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    {items.length > 0 && (
                      <div className="ml-11 space-y-1.5 border-t border-gray-200 pt-2">
                        {items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-gray-600">{item.name || item.product_name} <span className="text-gray-400">× {item.quantity}</span></span>
                            <span className="font-semibold text-neutral">${(Number(item.unit_price || item.price || 0) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <p className="text-xs text-gray-400">+ {items.length - 3} more item{items.length - 3 > 1 ? 's' : ''}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Editable Profile */}
        <div className="glass-card p-6">
          <h2 className="font-display text-xl text-neutral mb-1">Personal Information</h2>
          <p className="text-xs text-gray-400 mb-5">Update your contact and account details.</p>

          {profileSaved && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" /> Profile updated successfully.
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">First Name</label>
                <input type="text" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} className="input-medical" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">Last Name</label>
                <input type="text" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} className="input-medical" placeholder="Smith" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="input-medical pl-9" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="input-medical pl-9" placeholder="(555) 123-4567" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-neutral mb-1">Company / Organization</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" value={profile.company} onChange={e => setProfile({ ...profile, company: e.target.value })} className="input-medical pl-9" placeholder="City Hospital" />
                </div>
              </div>
            </div>
            <button type="submit" className="btn-medical px-8">Save Changes</button>
          </form>
        </div>

        {/* Change Password */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <Lock className="w-5 h-5 text-neutral" />
            <h2 className="font-display text-xl text-neutral">Change Password</h2>
          </div>
          <p className="text-xs text-gray-400 mb-5">Use a strong password with at least 8 characters.</p>

          {pwdSaved && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" /> Password changed successfully.
            </div>
          )}
          {pwdError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {pwdError}
            </div>
          )}

          <form onSubmit={handlePasswordSave} className="space-y-4">
            <PwdInput field="current" label="Current Password" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PwdInput field="newPwd" label="New Password" />
              <PwdInput field="confirm" label="Confirm New Password" />
            </div>
            <button type="submit" className="btn-medical px-8">Update Password</button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default CustomerProfile;
