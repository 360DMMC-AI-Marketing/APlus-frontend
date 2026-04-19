import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, X, User, Mail, Phone, Building2, ShoppingBag } from 'lucide-react';
import { getAdminUsers, getAdminUserById, approveUser, rejectUser } from '../../api/admin';

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    getAdminUsers({ limit: 100 })
      .then((data) => {
        const list = data.users || data.data || data;
        setUsers(Array.isArray(list) ? list : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleViewUser = async (userId) => {
    setDetailLoading(true);
    try {
      const data = await getAdminUserById(userId);
      setSelectedUser(data.user || data.data || data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const name = user.firstName ? `${user.firstName} ${user.lastName}` : (user.first_name ? `${user.first_name} ${user.last_name}` : (user.name || ''));
    const email = user.email || '';
    const company = user.companyName || user.company_name || '';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleApprove = async (userId) => {
    try {
      await approveUser(userId);
      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: 'approved' } : user
      ));
    } catch (err) {
      console.error('Failed to approve user:', err);
    }
  };

  const handleReject = async (userId) => {
    try {
      await rejectUser(userId);
      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: 'rejected' } : user
      ));
    } catch (err) {
      console.error('Failed to reject user:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const displayName = user.firstName
                  ? `${user.firstName} ${user.lastName || ''}`
                  : user.first_name
                    ? `${user.first_name} ${user.last_name || ''}`
                    : user.name || '—';
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-neutral text-sm">{displayName.trim()}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge-status text-xs ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'supplier' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt || user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge-status ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {user.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(user.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500">No users found</div>
      )}

      {/* User Detail Modal */}
      {(selectedUser || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !detailLoading && setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {detailLoading ? (
              <div className="p-12 text-center text-gray-500">Loading user details...</div>
            ) : selectedUser && (
              <>
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="font-display text-xl text-neutral">User Details</h2>
                  <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Basic Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral text-lg">
                        {selectedUser.firstName || selectedUser.first_name || ''} {selectedUser.lastName || selectedUser.last_name || ''}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge-status text-xs ${getStatusColor(selectedUser.status)}`}>{selectedUser.status}</span>
                        <span className={`badge-status text-xs ${
                          selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          selectedUser.role === 'supplier' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{selectedUser.role}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{selectedUser.email}</span>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{selectedUser.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Registered: {new Date(selectedUser.createdAt || selectedUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Supplier Info */}
                  {selectedUser.supplierInfo && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-neutral mb-3">Supplier Details</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-400">Business Name</p>
                          <p className="font-semibold text-neutral">{selectedUser.supplierInfo.businessName || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Tax ID</p>
                          <p className="font-semibold text-neutral">{selectedUser.supplierInfo.taxId || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Commission Rate</p>
                          <p className="font-semibold text-neutral">{selectedUser.supplierInfo.commissionRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Balance</p>
                          <p className="font-semibold text-primary">${Number(selectedUser.supplierInfo.currentBalance || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Supplier Status</p>
                          <span className={`badge-status text-xs ${getStatusColor(selectedUser.supplierInfo.status)}`}>{selectedUser.supplierInfo.status}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Customer Stats */}
                  {selectedUser.customerStats && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-neutral mb-3 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-gray-400" /> Customer Stats
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-400">Total Orders</p>
                          <p className="font-bold text-neutral text-lg">{selectedUser.customerStats.totalOrders}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Total Spent</p>
                          <p className="font-bold text-primary text-lg">${Number(selectedUser.customerStats.totalSpent || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
