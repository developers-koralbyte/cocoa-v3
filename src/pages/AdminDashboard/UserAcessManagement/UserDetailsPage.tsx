// src/pages/admin/UserDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BaseLayout from '../../../components/AdminDashboard/layout/BaseLayout';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import { FiMoreVertical, FiArrowLeft } from 'react-icons/fi';

type UserRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
};

type CompanyRecord = {
  avatar?: string;
  services?: string;
  industry?: string;
  businessName?: string;
  companyAddress?: string;
  countryRegion?: string;
  categories?: string[];
  createdAt?: { seconds: number; nanoseconds: number };
  documents?: string[];
};

const ACCENT = '#7C77C1';
const statusPill = (s: string) =>
  s === 'active'    ? 'bg-green-100 text-green-800' :
  s === 'pending'   ? 'bg-yellow-100 text-yellow-800' :
  s === 'suspended' ? 'bg-red-100 text-red-800' :
  s === 'rejected'  ? 'bg-gray-200 text-gray-800' :
                      'bg-gray-100 text-gray-800';

const tabs = ['Details','Company','Documents','Settings'] as const;
type TabKey = typeof tabs[number];

const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{id:string}>();
  const navigate = useNavigate();

  const [user, setUser]       = useState<UserRecord|null>(null);
  const [company, setCompany] = useState<CompanyRecord|null>(null);
  const [tab, setTab]         = useState<TabKey>('Details');
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string|null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      // fetch user
      const uSnap = await getDoc(doc(db,'users',id));
      if (!uSnap.exists()) return navigate(-1);
      const u = uSnap.data() as any;
      setUser({
        id,
        firstName: u.firstName,
        lastName:  u.lastName,
        email:     u.email,
        role:      u.role,
        status:    u.status,
      });

      // fetch company doc
      const collName = u.role === 'vendor' ? 'Vendors' : 'Buyers';
      const cSnap = await getDoc(doc(db,collName,id));
      if (cSnap.exists()) {
        setCompany(cSnap.data() as CompanyRecord);
      } else {
        console.warn(`No ${collName}/${id} doc found`);
      }
    })();
  }, [id, navigate]);

  if (!user) return null;
  const initials = `${user.firstName[0]||''}${user.lastName[0]||''}`.toUpperCase();
  const fmtDate = (ts?: { seconds:number }) => ts
    ? new Date(ts.seconds*1000).toLocaleDateString()
    : '—';

  const changeStatus = async (newStatus:'active'|'pending'|'suspended'|'rejected') => {
    if (!confirm(`Change status to "${newStatus}"?`)) return;
    setLoading(true);
    await updateDoc(doc(db,'users',user.id), { status:newStatus });
    const collName = user.role === 'vendor' ? 'Vendors' : 'Buyers';
    await updateDoc(doc(db,collName,user.id), { status:newStatus });
    setLoading(false);
    navigate(-1);
  };

  return (
    <BaseLayout>
      <div className="w-full bg-white rounded-xl shadow p-6 space-y-8">
        {/* BACK & HEADER */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/user-access')}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Back to users list"
          >
            <FiArrowLeft size={20} />
          </button>
          <div className="flex-1 flex items-center space-x-4 ml-4">
            {company?.avatar ? (
              <img
                src={company.avatar}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover border"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full bg-[#EDE8F7] flex items-center justify-center text-2xl font-bold"
                style={{ color: ACCENT }}
              >
                {initials}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span
                className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${statusPill(user.status)}`}
              >
                {user.status}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={user.status}
              onChange={e => changeStatus(e.target.value as any)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="pending">Review</option>
              <option value="active">Active</option>
              <option value="suspended">Suspend</option>
              <option value="rejected">Reject</option>
            </select>
            <button className="p-2 hover:bg-gray-100 rounded">
              <FiMoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            ['Role',           user.role],
            ['Business Name',  company?.businessName || '—'],
            ['Address',        company?.companyAddress || '—'],
            ['Region',         company?.countryRegion || '—'],
            ['Categories',     company?.categories?.join(', ') || '—'],
            ['Member Since',   fmtDate(company?.createdAt)],
          ].map(([label,val]) => (
            <div key={label}>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="font-medium">{val}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <nav className="border-b">
          <ul className="flex space-x-8">
            {tabs.map(t => (
              <li key={t}>
                <button
                  onClick={() => setTab(t)}
                  className={`pb-2 font-medium ${
                    tab === t
                      ? 'border-b-2 text-[#7C77C1]'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={tab === t ? { borderColor: ACCENT } : {}}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* TAB CONTENT */}
        <div>
          {tab === 'Details' && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                ['First Name', user.firstName],
                ['Last Name',  user.lastName],
                ['Email',      user.email],
                ['Status',     user.status],
              ].map(([k,v]) => (
                <div key={k}>
                  <dt className="text-sm text-gray-500">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {tab === 'Company' && (
            <dl className="space-y-4">
              {[
                ['Business Name',  company?.businessName],
                ['Company Address', company?.companyAddress],
                ['Region',          company?.countryRegion],
                ['Categories',      company?.categories?.join(', ')],
              ].map(([k,v]) => (
                <div key={k}>
                  <dt className="text-sm text-gray-500">{k}</dt>
                  <dd>{v || '—'}</dd>
                </div>
              ))}
            </dl>
          )}

          {tab === 'Documents' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(company?.documents || []).map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDoc(url)}
                    className={`
                      px-3 py-1 rounded transition
                      ${selectedDoc === url
                        ? 'bg-[#7C77C1] text-white'
                        : 'bg-[#F0ECF9] text-[#7C77C1] hover:bg-[#E0D8F7]'
                      }
                    `}
                  >
                    Document {i+1}
                  </button>
                ))}
              </div>
              {selectedDoc ? (
                <div className="mt-4 h-[75vh]">
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedDoc)}&embedded=true`}
                    title="Document Viewer"
                    className="w-full h-full border rounded"
                  />
                </div>
              ) : (
                <p className="text-gray-500">Select a document to preview.</p>
              )}
              {company?.documents?.length === 0 && (
                <p className="text-gray-500">No documents uploaded.</p>
              )}
            </div>
          )}

          {tab === 'Settings' && (
            <div className="flex flex-wrap gap-3">
              {user.status === 'pending' && (
                <>
                  <button
                    onClick={() => changeStatus('active')}
                    disabled={loading}
                    className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => changeStatus('rejected')}
                    disabled={loading}
                    className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
                  >
                    Reject
                  </button>
                </>
              )}
              {user.status === 'active' && (
                <button
                  onClick={() => changeStatus('suspended')}
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                >
                  Suspend
                </button>
              )}
              {user.status === 'suspended' && (
                <button
                  onClick={() => changeStatus('active')}
                  disabled={loading}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  Reinstate
                </button>
              )}
              <button
                onClick={() => navigate('/admin/user-access')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Back to List
              </button>
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default UserDetailsPage;
