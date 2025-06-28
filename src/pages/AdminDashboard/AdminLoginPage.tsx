import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../utils/firebase';
import cocoaLogo from '../../assets/img/cocoa-logo.png';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { toast } from 'react-toastify';
import { useAuth } from '../../utils/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  // Redirect already‐logged‐in users away
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin-dashboard', { replace: true });
          break;
        case 'vendor':
          navigate('/vendor-dashboard', { replace: true });
          break;
        case 'buyer':
          navigate('/buyer-dashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation helpers
  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return 'Please enter a valid email address';
    return '';
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation
    const emailError = validateEmail(email);
    if (emailError) {
      toast.error(emailError);
      setLoading(false);
      return;
    }
    
    
    try {
      await setPersistence(auth, browserLocalPersistence);
      const res = await signInWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      // fetch role from Firestore
      const q = query(collection(db, 'users'), where('id', '==', uid));
      const snap = await getDocs(q);
      if (snap.empty) throw new Error('User record not found.');
      const data = snap.docs[0].data();

      if (data.role !== 'admin') {
        toast.error('You are not an admin');
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify({ uid, role: 'admin' }));
      toast.success('Welcome, Admin!');
      navigate('/admin-dashboard');
    } catch (err: any) {
      console.error("Admin login error:", err);
  
      // Always show this for *any* sign-in failure
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // show spinner while auth context initializes or redirecting
  if (authLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F0FF]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Cocoa logo at the top */}
        <img src={cocoaLogo} alt="Cocoa Logo" className="mx-auto h-20 mb-4" />
        {/* subtle caption instead of huge heading */}
        <p className="text-center text-lg text-gray-600 mb-6">
          Administrator Access
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C77C1]"
            />
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C77C1]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-500 mt-5" />
              ) : (
                <Eye className="h-5 w-5 text-gray-500 mt-5" />
              )}
            </button>
          </div>

          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-sm text-[#7C77C1] hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 bg-[#7C77C1] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Cocoa Inc.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
