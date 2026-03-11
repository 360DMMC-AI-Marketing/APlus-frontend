import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Search, Download } from 'lucide-react';

const AdminCompliance = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const vendors = [
    {
      id: 1,
      name: 'MedSupply Pro',
      oigStatus: 'passed',
      gsaStatus: 'passed',
      fdaStatus: 'verified',
      licenseExpiry: '2025-12-15',
      lastChecked: '2024-02-15'
    },
    {
      id: 2,
      name: 'HealthCare Supplies Inc',
      oigStatus: 'passed',
      gsaStatus: 'passed',
      fdaStatus: 'verified',
      licenseExpiry: '2024-04-20',
      lastChecked: '2024-02-10'
    },
    {
      id: 3,
      name: 'Medical Equipment Co',
      oigStatus: 'passed',
      gsaStatus: 'passed',
      fdaStatus: 'not_applicable',
      licenseExpiry: '2025-08-30',
      lastChecked: '2024-02-01'
    }
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'passed':
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'passed':
      case 'verified':
        return 'text-green-700 bg-green-50';
      case 'failed':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const isLicenseExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isLicenseExpired = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: vendors.length,
    compliant: vendors.filter(v => v.oigStatus === 'passed' && v.gsaStatus === 'passed').length,
    warnings: vendors.filter(v => isLicenseExpiringSoon(v.licenseExpiry)).length,
    failed: vendors.filter(v => v.oigStatus === 'failed' || v.gsaStatus === 'failed').length
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-display text-secondary mb-2">Compliance Dashboard</h1>
        <p className="text-gray-600">Monitor vendor compliance status and certifications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Vendors</p>
              <p className="text-3xl font-bold text-secondary">{stats.total}</p>
            </div>
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 mb-1">Compliant</p>
              <p className="text-3xl font-bold text-green-700">{stats.compliant}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 mb-1">Warnings</p>
              <p className="text-3xl font-bold text-yellow-700">{stats.warnings}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border-2 border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 mb-1">Failed</p>
              <p className="text-3xl font-bold text-red-700">{stats.failed}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search and Export */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Vendor Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">OIG LEIE</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">GSA Exclusion</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">FDA Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">License Expiry</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">Last Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-secondary">{vendor.name}</p>
                    <p className="text-sm text-gray-500">ID: {vendor.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(vendor.oigStatus)}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vendor.oigStatus)}`}>
                        {vendor.oigStatus.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(vendor.gsaStatus)}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vendor.gsaStatus)}`}>
                        {vendor.gsaStatus.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(vendor.fdaStatus)}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vendor.fdaStatus)}`}>
                        {vendor.fdaStatus === 'not_applicable' ? 'N/A' : vendor.fdaStatus.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isLicenseExpired(vendor.licenseExpiry) ? (
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-700 font-semibold">Expired</span>
                      </div>
                    ) : isLicenseExpiringSoon(vendor.licenseExpiry) ? (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <span className="text-yellow-700 font-semibold">{vendor.licenseExpiry}</span>
                      </div>
                    ) : (
                      <span className="text-gray-700">{vendor.licenseExpiry}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{vendor.lastChecked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCompliance;
