import React, { useState } from 'react';
import { CheckCircle, Building2, Phone, Mail, Globe, MapPin, Calendar, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { mockVendors } from '../../utils/mockData';
import { useAuthStore } from '../../store/authStore';

const VendorSettings = () => {
  const { user } = useAuthStore();
  const vendor = mockVendors.find(v => v.id === user?.vendorId) || mockVendors[0];

  // Profile form
  const [profile, setProfile] = useState({
    contactName: vendor.contactName,
    email: vendor.email,
    phone: vendor.businessInfo.phone,
    website: vendor.businessInfo.website || '',
    address: vendor.businessInfo.address,
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Password form
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false });
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    setPwdError('');
    if (pwd.newPwd.length < 8) { setPwdError('New password must be at least 8 characters.'); return; }
    if (pwd.newPwd !== pwd.confirm) { setPwdError('New passwords do not match.'); return; }
    if (!pwd.current) { setPwdError('Please enter your current password.'); return; }
    setPwdSaved(true);
    setPwd({ current: '', newPwd: '', confirm: '' });
    setTimeout(() => setPwdSaved(false), 3000);
  };

  const PwdInput = ({ field, label, placeholder }) => (
    <div>
      <label className="block text-sm font-semibold text-neutral mb-1">{label}</label>
      <div className="relative">
        <input
          type={showPwd[field] ? 'text' : 'password'}
          value={pwd[field]}
          onChange={e => setPwd({ ...pwd, [field]: e.target.value })}
          className="input-medical pr-10"
          placeholder={placeholder || '••••••••'}
        />
        <button type="button" onClick={() => setShowPwd({ ...showPwd, [field]: !showPwd[field] })}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {showPwd[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Verified Badge */}
      <div className="glass-card p-5 border border-green-200 bg-green-50/50">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-7 h-7 text-green-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Verified Vendor</p>
            <p className="text-sm text-green-600">
              Approved {new Date(vendor.approvedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · Commission rate: <strong>{vendor.commissionRate}%</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Read-only Business Info */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl text-neutral mb-1">Business Information</h2>
        <p className="text-xs text-gray-400 mb-4">To update official business details, contact <a href="mailto:support@aplusmeddepot.com" className="text-primary hover:underline">support@aplusmeddepot.com</a></p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Building2, label: 'Company', value: vendor.company },
            { icon: MapPin, label: 'Registered Address', value: vendor.businessInfo.address },
            { icon: Building2, label: 'Tax ID', value: vendor.businessInfo.taxId },
            { icon: Calendar, label: 'Member Since', value: new Date(vendor.registeredDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm text-neutral font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editable Contact Info */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl text-neutral mb-1">Contact & Profile</h2>
        <p className="text-xs text-gray-400 mb-5">You can update your contact information at any time.</p>

        {profileSaved && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" /> Profile updated successfully.
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral mb-1">Contact Name</label>
              <input type="text" value={profile.contactName} onChange={e => setProfile({ ...profile, contactName: e.target.value })} className="input-medical" />
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
                <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="input-medical pl-9" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral mb-1">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" value={profile.website} onChange={e => setProfile({ ...profile, website: e.target.value })} className="input-medical pl-9" placeholder="www.yourcompany.com" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-neutral mb-1">Business Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} className="input-medical pl-9" />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-medical px-8">Save Profile</button>
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

      {/* Categories */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl text-neutral mb-4">Approved Categories</h2>
        <div className="flex flex-wrap gap-2">
          {vendor.categories.map(cat => (
            <span key={cat} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">{cat}</span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Need to sell in additional categories? Contact your account manager.</p>
      </div>
    </div>
  );
};

export default VendorSettings;
