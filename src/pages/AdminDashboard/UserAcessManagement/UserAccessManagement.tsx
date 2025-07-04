// src/pages/admin/UserAccessManagement.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { FiDownload, FiRefreshCcw, FiSearch, FiUpload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../../components/AdminDashboard/layout/BaseLayout';
import { db } from '../../../utils/firebase';

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  QueryDocumentSnapshot,
  DocumentData,
  setDoc
} from 'firebase/firestore';
import { UserRecord } from './UserDetailsPage';

const ACCENT = '#7C77C1';
const tabs = [
  { key: 'all',       label: 'All' },
  { key: 'active',    label: 'Active' },
  { key: 'pending',   label: 'Pending' },
  { key: 'vendor',    label: 'Vendor' },
  { key: 'buyer',     label: 'Buyer' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'rejected',  label: 'Rejected' },
];

export const statusPill = (status: string) => {
  switch (status) {
    case 'active':    return 'bg-green-100 text-green-800';
    case 'pending':   return 'bg-yellow-100 text-yellow-800';
    case 'suspended': return 'bg-red-100 text-red-800';
    case 'rejected':  return 'bg-gray-200 text-gray-800';
    default:          return 'bg-gray-100 text-gray-800';
  }
};

const UserAccessManagement: React.FC = () => {
  const [counts, setCounts]           = useState({ vendors:0, buyers:0, pending:0, suspended:0 });
  const [users, setUsers]             = useState<UserRecord[]>([]);
  const [filter, setFilter]           = useState<string>('all');
  const [search, setSearch]           = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const navigate                      = useNavigate();
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());


  const fetchData = async () => {
    const qV = query(collection(db,'users'), where('role','==','vendor'));
    const qB = query(collection(db,'users'), where('role','==','buyer'));
    const qP = query(collection(db,'users'), where('status','==','pending'));
    const qS = query(collection(db,'users'), where('status','==','suspended'));
    const [allSnap,snapV,snapB,snapP,snapS] = await Promise.all([
      getDocs(collection(db,'users')),
      getDocs(qV), getDocs(qB), getDocs(qP), getDocs(qS)
    ]);
    setCounts({
      vendors: snapV.size,
      buyers:  snapB.size,
      pending: snapP.size,
      suspended: snapS.size
    });
    setUsers(
      allSnap.docs.map((d:QueryDocumentSnapshot<DocumentData>) => {
        const data = d.data();
        return {
          id: d.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
          status: data.status,
          documents: Array.isArray(data.documents) ? data.documents : []
        };
      })
    );
    setSelectedIds(new Set());

    setLastUpdated(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      if (search && !name.includes(search.toLowerCase())) return false;
      switch(filter) {
        case 'all':       return true;
        case 'active':    return u.status==='active';
        case 'pending':   return u.status==='pending';
        case 'vendor':    return u.role==='vendor';
        case 'buyer':     return u.role==='buyer';
        case 'suspended': return u.status==='suspended';
        case 'rejected':  return u.status==='rejected';
        default:          return true;
      }
    });
  }, [users,filter,search]);

  const allFilteredSelected = filtered.length > 0 && filtered.every(u => selectedIds.has(u.id));

  const toggleSelectAll = () => {
    const newSet = new Set(selectedIds);
    if (allFilteredSelected) {
      filtered.forEach(u => newSet.delete(u.id));
    } else {
      filtered.forEach(u => newSet.add(u.id));
    }
    setSelectedIds(newSet);
  };

  const toggleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleImport = () => {
    // 1) create a hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
  
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
  
      // 2) read as text
      const text = await file.text();
  
      // 3) simple CSV parse: split lines & commas
      const rows = text.trim().split('\n');
      // assume first row is header: firstName,lastName,email,role,status
      for (let i = 1; i < rows.length; i++) {
        const [firstName, lastName, email, role, status] = rows[i].split(',').map(s => s.trim());
        if (!email) continue;
  
        // 4) upsert into Firestore (key by email or some other ID)
        const userRef = doc(db, 'users', email);
        await setDoc(userRef, { firstName, lastName, email, role, status }, { merge: true });
      }
  
      // 5) refresh the table
      fetchData();
    };
  
    // trigger the OS file picker
    input.click();
  };

  const handleExport = async () => {
    // 1) grab every user
    const snap = await getDocs(collection(db, 'users'));
  
    // 2) prepare CSV headers and rows
    const headers = ['firstName', 'lastName', 'email', 'role', 'status'];
    const rows = snap.docs.map(doc => {
      const d = doc.data() as Record<string,string>;
      return headers.map(h => JSON.stringify(d[h] || '')).join(',');
    });
  
    // 3) assemble full CSV text
    const csvContent = [headers.join(','), ...rows].join('\r\n');
  
    // 4) create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  

  const handleBulkAction = async (newStatus: 'active'|'suspended'|'rejected') => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to ${newStatus} ${selectedIds.size} user(s)?`)) return;
    // perform updates
    await Promise.all(Array.from(selectedIds).map(async id => {
      const user = users.find(u => u.id === id);
      if (!user) return;
      await updateDoc(doc(db,'users',id), { status: newStatus });
      const coll = user.role === 'vendor' ? 'Vendors' : 'Buyers';
      await updateDoc(doc(db,coll,id), { status: newStatus });
    }));
    // refresh
    fetchData();
  };

  return (
    <BaseLayout>
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
  {/* Title + Subtitle */}
  <div>
    <h1 className="text-2xl font-extrabold text-[#7C77C1]">
      User &amp; Access Management
    </h1>
    <p className="text-sm text-gray-500 mt-1">
      Manage roles, statuses, and permissions • Last updated: {lastUpdated /* e.g. 8:14:59 AM */}
    </p>
  </div>

  {/* Action Controls */}
  <div className="flex flex-wrap items-center space-x-2 mt-4 md:mt-0">
    {/* Invite New User */}
    <button
    disabled
      onClick={() => navigate('/admin/users/invite')}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm 
      disabled:bg-gray-300 
      disabled:text-gray-500 
      disabled:cursor-not-allowed 
      disabled:opacity-50"
    >
      Invite User
    </button>

    {/* Import / Export */}
    <button
      onClick={handleImport}
      className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm flex items-center"
    >
      <FiUpload className="mr-1" /> Import CSV
    </button>
    <button
      onClick={handleExport}
      className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm flex items-center"
    >
      <FiDownload className="mr-1" /> Export CSV
    </button>

    {/* Refresh */}
    <button
      onClick={fetchData}
      className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
      title="Refresh data"
    >
      <FiRefreshCcw />
    </button>

    {/* Search */}
    <div className="relative text-gray-400">
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" />
      <input
        type="text"
        placeholder="Search by name or email…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-[#7C77C1]/40 focus:border-[#7C77C1] text-sm"
      />
    </div>
  </div>
</div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        {[
          { label:'Vendors',    value:counts.vendors,    color: ACCENT },
          { label:'Buyers',     value:counts.buyers,     color: ACCENT },
          { label:'Pending',    value:counts.pending,    color:'text-yellow-600' },
          { label:'Suspended',  value:counts.suspended,  color:'text-red-600' },
        ].map(({label,value,color})=>(
          <div key={label} className="bg-white rounded-lg shadow p-5 flex items-center">
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-1 text-3xl font-bold" style={{ color }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:justify-between mb-4">
        <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
          {tabs.map(t=>(
            <button
              key={t.key}
              onClick={()=>setFilter(t.key)}
              className={`px-4 py-1 text-sm font-medium rounded-full transition ${
                filter===t.key
                  ? 'bg-[#F0ECF9] text-[#7C77C1]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >{t.label}</button>
          ))}
        </div>
        <div className="relative text-gray-400 focus-within:text-gray-600 w-full md:w-64">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2"/>
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={e=>setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-[#7C77C1]/40 focus:border-[#7C77C1]"
          />
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center space-x-3">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <button
            onClick={()=>handleBulkAction('active')}
            className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 text-sm"
          >Bulk Approve</button>
          <button
            onClick={()=>handleBulkAction('suspended')}
            className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 text-sm"
          >Bulk Suspend</button>
          <button
            onClick={()=>handleBulkAction('rejected')}
            className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
          >Bulk Reject</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              {['Name','Email','Role','Status','Actions'].map(h=>(
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.map(u=>(
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(u.id)}
                    onChange={()=>toggleSelectOne(u.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{u.firstName} {u.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{u.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${statusPill(u.status)}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={()=>navigate(`/admin/users/${u.id}`)}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >View</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No users match your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </BaseLayout>
  );
};

export default UserAccessManagement;
