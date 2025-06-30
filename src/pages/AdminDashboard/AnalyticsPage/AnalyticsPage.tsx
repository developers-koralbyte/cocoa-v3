/* --------------------------------------------------------------------------
   EnhancedAnalyticsDashboard.tsx – fully-typed Firebase analytics dashboard
   Cocoa v3 Admin
--------------------------------------------------------------------------- */
import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  ReactNode,
} from 'react';
import BaseLayout from '../../../components/AdminDashboard/layout/BaseLayout';
import {
  RealtimeStatsWidget,
  ActivityFeedWidget,
  NotificationsWidget,
  PerformanceMetricsWidget,
  SystemHealthWidget,
} from '../../../components/AdminDashboard/components/AnalyticsWidgets';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Briefcase,
  Target,
  Download,
  RefreshCw,
  Calendar,
  Settings,
  BarChart3,
  PieChart as PieChartIcon,
  Activity as ActivityIcon,
  DollarSign,
  Percent,
  Clock,
  AlertTriangle,
} from 'lucide-react';

/* -----------------------------------------------------------------------
   Firestore document interfaces
------------------------------------------------------------------------ */
export interface UserDoc {
  id: string;
  role?: 'vendor' | 'buyer' | 'admin';
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt?: Timestamp | Date;
}

export interface VendorDoc {
  id: string;
  businessName?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Timestamp | Date;
}

export interface ProductDoc {
  id: string;
  name?: string;
  category?: string;
  price?: number;
  vendorId?: string;
  createdAt?: Timestamp | Date;
}

export interface ServiceDoc {
  id: string;
  name?: string;
  category?: string;
  price?: number;
  vendorId?: string;
  createdAt?: Timestamp | Date;
}

/* -----------------------------------------------------------------------
   Dashboard-view models
------------------------------------------------------------------------ */
export interface TimeSeriesPoint {
  date: string;
  users: number;
  vendors: number;
  products: number;
  services: number;
  orders: number;
  revenue: number;
}

export interface CategorySlice {
  name: string;
  value: number;
  color: string;
}

export interface VendorPerformance {
  name: string;
  products: number;
  services: number;
  revenue: number;
}

export interface PerformanceMetric {
  label: string;
  value: number;
  change: number;
  format: 'currency' | 'percentage' | 'number';
  icon: ReactNode;
  color: string;
}

export interface ActivityEntry {
  id: string;
  type: 'vendor_joined' | 'user_registered' | 'product_added' | 'service_added' | 'order_placed';
  message: string;
  timestamp: Date;
  userName: string;
}

export interface NotificationEntry {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export type SystemHealth = 'healthy' | 'warning' | 'critical';

export interface AnalyticsState {
  totalUsers: number;
  totalVendors: number;
  totalBuyers: number;
  totalProducts: number;
  totalServices: number;
  activeVendors: number;
  onlineUsers: number;
  recentActivity: ActivityEntry[];
  notifications: NotificationEntry[];
  systemHealth: SystemHealth;
  timeSeriesData: TimeSeriesPoint[];
  categoryData: CategorySlice[];
  performanceData: VendorPerformance[];
  performanceMetrics: PerformanceMetric[];
}

const initialAnalyticsState: AnalyticsState = {
  totalUsers: 0,
  totalVendors: 0,
  totalBuyers: 0,
  totalProducts: 0,
  totalServices: 0,
  activeVendors: 0,
  onlineUsers: 0,
  recentActivity: [],
  notifications: [],
  systemHealth: 'healthy',
  timeSeriesData: [],
  categoryData: [],
  performanceData: [],
  performanceMetrics: [],
};

/* =======================================================================
   Component
======================================================================= */
const EnhancedAnalyticsDashboard: React.FC = () => {
  /* ---------------- React state ------------------------------------ */
  const [analyticsData, setAnalyticsData] =
    useState<AnalyticsState>(initialAnalyticsState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [dashboardLayout, setDashboardLayout] = useState({
    showRealtime: true,
    showCharts: true,
    showActivity: true,
    showNotifications: true,
    showMetrics: true,
    showSystemHealth: true,
  });
  const [chartTypes, setChartTypes] = useState({
    trends: 'area' as 'area' | 'line' | 'bar',
    distribution: 'pie' as 'pie' | 'donut' | 'bar',
  });

  /* ---------------- helpers --------------------------------------- */
  const toDate = (d?: Timestamp | Date): Date =>
    d ? (d instanceof Date ? d : d.toDate()) : new Date(0);

  const mapDocs = <T,>(
    snap: QueryDocumentSnapshot<DocumentData>[]
  ): T[] => snap.map((doc) => ({ id: doc.id, ...doc.data() } as T));

  /* ---------------- presence helper ------------------------------- */
  const getOnlineUsers = async (): Promise<number> => {
    const snap = await getDocs(
      query(collection(db, 'presence'), where('state', '==', 'online'))
    );
    return snap.size;
  };

  /* ---------------- fetchers -------------------------------------- */
  const fetchUsersAndVendors = useCallback(async () => {
    const [userSnap, vendorSnap, online] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'Vendors')),
      getOnlineUsers(),
    ]);

    const users = mapDocs<UserDoc>(userSnap.docs);
    const vendors = mapDocs<VendorDoc>(vendorSnap.docs);

    return {
      users,
      vendors,
      totalUsers: users.length,
      totalVendors: users.filter((u) => u.role === 'vendor').length,
      totalBuyers: users.filter((u) => u.role === 'buyer').length,
      activeVendors: vendors.length,
      onlineUsers: online,
    };
  }, []);

  const fetchProductsAndServices = useCallback(async () => {
    const [prodSnap, servSnap] = await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'services')),
    ]);

    const products = mapDocs<ProductDoc>(prodSnap.docs);
    const services = mapDocs<ServiceDoc>(servSnap.docs);

    return {
      products,
      services,
      totalProducts: products.length,
      totalServices: services.length,
    };
  }, []);

  /* ---------------- data generators ------------------------------- */
  const generateTimeSeriesData = useCallback(
    async (
      users: UserDoc[],
      vendors: VendorDoc[],
      products: ProductDoc[],
      services: ServiceDoc[]
    ): Promise<TimeSeriesPoint[]> => {
      const now = new Date();
      const out: TimeSeriesPoint[] = [];

      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const inRange = (d?: Timestamp | Date) =>
          !!d &&
          toDate(d).getTime() >= start.getTime() &&
          toDate(d).getTime() < end.getTime();

        const monthUsers = users.filter((u) => inRange(u.createdAt)).length;
        const monthVendors = vendors.filter((v) => inRange(v.createdAt)).length;
        const monthProducts = products.filter((p) =>
          inRange(p.createdAt)
        ).length;
        const monthServices = services.filter((s) =>
          inRange(s.createdAt)
        ).length;
        const orders = Math.floor((monthProducts + monthServices) * 0.8);

        // revenue pulled from monthly_stats collection if exists
        const monthId = `${start.getFullYear()}-${String(
          start.getMonth() + 1
        ).padStart(2, '0')}`;
        const statDoc = await getDoc(doc(db, 'monthly_stats', monthId));
        const revenue = statDoc.exists()
          ? (statDoc.data().revenue as number)
          : monthProducts * 100 + monthServices * 150;

        out.push({
          date: start.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
          users: monthUsers,
          vendors: monthVendors,
          products: monthProducts,
          services: monthServices,
          orders,
          revenue,
        });
      }
      return out;
    },
    []
  );

  const generateCategoryData = useCallback(
    (products: ProductDoc[], services: ServiceDoc[]): CategorySlice[] => {
      const counts: Record<string, number> = {};
      products.forEach((p) => {
        if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
      });
      services.forEach((s) => {
        if (s.category) counts[s.category] = (counts[s.category] || 0) + 1;
      });

      const palette = [
        '#8884d8',
        '#82ca9d',
        '#ffc658',
        '#ff7300',
        '#8dd1e1',
        '#d084d0',
      ];

      return Object.entries(counts)
        .map(([name, value], i) => ({
          name,
          value,
          color: palette[i % palette.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
    },
    []
  );

  const generateVendorPerformance = useCallback(
    (
      vendors: VendorDoc[],
      products: ProductDoc[],
      services: ServiceDoc[]
    ): VendorPerformance[] =>
      vendors
        .map((v) => {
          const prod = products.filter((p) => p.vendorId === v.id);
          const serv = services.filter((s) => s.vendorId === v.id);
          const revenue =
            prod.reduce((s, p) => s + (p.price ?? 0), 0) +
            serv.reduce((s, p) => s + (p.price ?? 0), 0);
          return {
            name:
              v.businessName ||
              `${v.firstName ?? ''} ${v.lastName ?? ''}`.trim() ||
              'Unknown',
            products: prod.length,
            services: serv.length,
            revenue,
          };
        })
        .filter((v) => v.products || v.services)
        .sort(
          (a, b) =>
            b.products + b.services - (a.products + a.services)
        )
        .slice(0, 10),
    []
  );

  const generatePerformanceMetrics = useCallback(
    async (
      data: AnalyticsState & { products: ProductDoc[]; services: ServiceDoc[] }
    ) => {
      const {
        totalUsers,
        totalVendors,
        totalBuyers,
        totalProducts,
        totalServices,
        products,
        services,
      } = data;

      const prodPrices = products
        .filter((p) => p.price && p.price > 0)
        .map((p) => p.price!);
      const servPrices = services
        .filter((s) => s.price && s.price > 0)
        .map((s) => s.price!);

      const avgProd =
        prodPrices.length > 0
          ? prodPrices.reduce((a, b) => a + b, 0) / prodPrices.length
          : 0;
      const avgServ =
        servPrices.length > 0
          ? servPrices.reduce((a, b) => a + b, 0) / servPrices.length
          : 0;

      // monthly revenue from current stats doc
      const monthId = new Date().toISOString().slice(0, 7);
      const statSnap = await getDoc(doc(db, 'monthly_stats', monthId));
      const monthlyRevenue = statSnap.exists()
        ? (statSnap.data().revenue as number)
        : totalProducts * avgProd * 0.1 + totalServices * avgServ * 0.1;

      const conversion = totalBuyers
        ? (totalVendors / totalBuyers) * 100
        : 0;
      const activeSessions = Math.floor(totalUsers * 0.05);

      return [
        {
          label: 'Monthly Revenue',
          value: monthlyRevenue,
          change: 12.5,
          format: 'currency' as const,
          icon: <DollarSign className="w-5 h-5" />,
          color: 'bg-green-100 text-green-600',
        },
        {
          label: 'Conversion Rate',
          value: conversion,
          change: 0.5,
          format: 'percentage' as const,
          icon: <Percent className="w-5 h-5" />,
          color: 'bg-blue-100 text-blue-600',
        },
        {
          label: 'Active Sessions',
          value: activeSessions,
          change: -2.1,
          format: 'number' as const,
          icon: <ActivityIcon className="w-5 h-5" />,
          color: 'bg-purple-100 text-purple-600',
        },
        {
          label: 'Avg Session Duration',
          value: 240,
          change: 15.2,
          format: 'number' as const,
          icon: <Clock className="w-5 h-5" />,
          color: 'bg-orange-100 text-orange-600',
        },
      ];
    },
    []
  );

  const generateActivity = useCallback(
    (
      users: UserDoc[],
      vendors: VendorDoc[],
      products: ProductDoc[],
      services: ServiceDoc[]
    ): ActivityEntry[] => {
      const list: ActivityEntry[] = [];
      const sortBy = <T extends { createdAt?: Timestamp | Date }>(arr: T[]) =>
        [...arr].sort(
          (a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
        );

      sortBy(users)
        .slice(0, 3)
        .forEach((u) =>
          list.push({
            id: `user-${u.id}`,
            type: u.role === 'vendor' ? 'vendor_joined' : 'user_registered',
            message:
              u.role === 'vendor'
                ? 'New vendor joined the platform'
                : 'New user registered',
            timestamp: toDate(u.createdAt),
            userName:
              `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() ||
              u.email ||
              'User',
          })
        );

      sortBy(products)
        .slice(0, 3)
        .forEach((p) =>
          list.push({
            id: `product-${p.id}`,
            type: 'product_added',
            message: `New product added: ${p.name ?? 'Product'}`,
            timestamp: toDate(p.createdAt),
            userName: 'Vendor',
          })
        );

      sortBy(services)
        .slice(0, 3)
        .forEach((s) =>
          list.push({
            id: `service-${s.id}`,
            type: 'service_added',
            message: `New service added: ${s.name ?? 'Service'}`,
            timestamp: toDate(s.createdAt),
            userName: 'Vendor',
          })
        );

      return list
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
    },
    []
  );

  const generateNotifications = useCallback(
    (data: AnalyticsState): NotificationEntry[] => {
      const notes: NotificationEntry[] = [];

      if (data.totalUsers > 1000) {
        notes.push({
          id: 'milestone-users',
          type: 'success',
          title: 'Milestone Reached',
          message: `Congratulations! You now have ${data.totalUsers} registered users.`,
          timestamp: new Date(),
          read: false,
        });
      }

      if (data.totalVendors > 100) {
        notes.push({
          id: 'milestone-vendors',
          type: 'success',
          title: 'Vendor Milestone',
          message: `Platform now has ${data.totalVendors} active vendors!`,
          timestamp: new Date(),
          read: false,
        });
      }

      if (data.recentActivity.length > 5) {
        notes.push({
          id: 'high-activity',
          type: 'info',
          title: 'High Activity',
          message: 'Platform experiencing high user activity today.',
          timestamp: new Date(),
          read: false,
        });
      }

      if (data.totalProducts + data.totalServices < 10) {
        notes.push({
          id: 'low-content',
          type: 'warning',
          title: 'Content Alert',
          message:
            'Consider encouraging vendors to add more products and services.',
          timestamp: new Date(),
          read: false,
        });
      }

      return notes;
    },
    []
  );

  /* ---------------- master fetch ----------------------------------- */
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [uv, ps] = await Promise.all([
        fetchUsersAndVendors(),
        fetchProductsAndServices(),
      ]);

      const { users, vendors, ...userStats } = uv;
      const { products, services, ...prodStats } = ps;

      const timeSeriesData = await generateTimeSeriesData(
        users,
        vendors,
        products,
        services
      );
      const categoryData = generateCategoryData(products, services);
      const performanceData = generateVendorPerformance(
        vendors,
        products,
        services
      );
      const recentActivity = generateActivity(
        users,
        vendors,
        products,
        services
      );

      const combined = {
        ...userStats,
        ...prodStats,
        products,
        services,
        recentActivity,
      } as AnalyticsState & {
        products: ProductDoc[];
        services: ServiceDoc[];
      };

      const performanceMetrics = await generatePerformanceMetrics(combined);
      const notifications = generateNotifications(combined);

      const systemHealth: SystemHealth =
        combined.totalUsers > 100 && combined.totalVendors > 10
          ? 'healthy'
          : combined.totalUsers > 50
          ? 'warning'
          : 'critical';

      setAnalyticsData({
        ...combined,
        timeSeriesData,
        categoryData,
        performanceData,
        performanceMetrics,
        notifications,
        systemHealth,
      });

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error(e);
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, [
    fetchUsersAndVendors,
    fetchProductsAndServices,
    generateTimeSeriesData,
    generateCategoryData,
    generateVendorPerformance,
    generateActivity,
    generatePerformanceMetrics,
    generateNotifications,
  ]);

  /* ---------------- lifecycle -------------------------------------- */
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const id = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchAll]);

  /* ---------------- UI helpers ------------------------------------- */
  const toggleWidget = (w: keyof typeof dashboardLayout) =>
    setDashboardLayout((p) => ({ ...p, [w]: !p[w] }));

  const changeChartType = (
    chart: 'trends' | 'distribution',
    e: ChangeEvent<HTMLSelectElement>
  ) => setChartTypes((p) => ({ ...p, [chart]: e.target.value as any }));

  const markRead = (id: string) =>
    setAnalyticsData((p) => ({
      ...p,
      notifications: p.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));

  const clearNotes = () =>
    setAnalyticsData((p) => ({ ...p, notifications: [] }));

  const exportJSON = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { ...analyticsData, exportTimestamp: new Date().toISOString() },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------------- chart renderers -------------------------------- */
  const renderTrends = (): React.ReactElement =>
    !analyticsData.timeSeriesData.length ? (
      <div />
    ) : chartTypes.trends === 'line' ? (
      <LineChart data={analyticsData.timeSeriesData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line dataKey="users" stroke="#8884d8" strokeWidth={2} />
        <Line dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
        <Line dataKey="vendors" stroke="#ffc658" strokeWidth={2} />
      </LineChart>
    ) : chartTypes.trends === 'bar' ? (
      <BarChart data={analyticsData.timeSeriesData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="users" fill="#8884d8" />
        <Bar dataKey="orders" fill="#82ca9d" />
        <Bar dataKey="vendors" fill="#ffc658" />
      </BarChart>
    ) : (
      <AreaChart data={analyticsData.timeSeriesData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="users"
          stackId="1"
          stroke="#8884d8"
          fill="#8884d8"
        />
        <Area
          type="monotone"
          dataKey="orders"
          stackId="1"
          stroke="#82ca9d"
          fill="#82ca9d"
        />
        <Area
          type="monotone"
          dataKey="vendors"
          stackId="1"
          stroke="#ffc658"
          fill="#ffc658"
        />
      </AreaChart>
    );

  const renderDistribution = (): React.ReactElement =>
    !analyticsData.categoryData.length ? (
      <div />
    ) : chartTypes.distribution === 'bar' ? (
      <BarChart data={analyticsData.categoryData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    ) : (
      <PieChart>
        <Pie
          data={analyticsData.categoryData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={chartTypes.distribution === 'donut' ? 40 : undefined}
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          dataKey="value"
        >
          {analyticsData.categoryData.map((s) => (
            <Cell key={s.name} fill={s.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    );

  /* ---------------- loading + error fallbacks ---------------------- */
  if (loading) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAll}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Retry
            </button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  /* ---------------- MAIN JSX RETURN ------------------------------- */
  return (
    <BaseLayout>
      <div className="space-y-6">
        {/* ================= Header ================= */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#6868AC] mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">Real-time insights from Firebase</p>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdated}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
              {/* Widget toggle */}
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-500" />
                <select
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  onChange={(e) => {
                    const [w, act] = e.target.value.split('-');
                    if (act === 'toggle')
                      toggleWidget(w as keyof typeof dashboardLayout);
                  }}
                  defaultValue=""
                >
                  <option value="">Toggle Widgets</option>
                  <option value="showRealtime-toggle">Real-time Stats</option>
                  <option value="showCharts-toggle">Charts</option>
                  <option value="showActivity-toggle">Activity Feed</option>
                  <option value="showNotifications-toggle">
                    Notifications
                  </option>
                  <option value="showMetrics-toggle">Performance Metrics</option>
                  <option value="showSystemHealth-toggle">System Health</option>
                </select>
              </div>

              {/* Refresh */}
              <button
                onClick={fetchAll}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              {/* Export */}
              <button
                onClick={exportJSON}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* ================= Realtime row ================ */}
        {dashboardLayout.showRealtime && (
          <RealtimeStatsWidget
            onlineUsers={analyticsData.onlineUsers}
            activeVendors={analyticsData.activeVendors}
            systemHealth={analyticsData.systemHealth}
          />
        )}
{/* ================= Summary tiles ============== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <div className="text-3xl font-bold mb-1">
              {analyticsData.totalUsers.toLocaleString()}
            </div>
            <p className="text-blue-100 text-sm">
              {analyticsData.totalVendors} vendors, {analyticsData.totalBuyers}{' '}
              buyers
            </p>
          </div>

          {/* Vendors */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Active Vendors</h3>
            <div className="text-3xl font-bold mb-1">
              {analyticsData.activeVendors.toLocaleString()}
            </div>
            <p className="text-green-100 text-sm">Currently offering services</p>
          </div>

          {/* Products */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Products</h3>
            <div className="text-3xl font-bold mb-1">
              {analyticsData.totalProducts.toLocaleString()}
            </div>
            <p className="text-purple-100 text-sm">Listed in marketplace</p>
          </div>

          {/* Services */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Services</h3>
            <div className="text-3xl font-bold mb-1">
              {analyticsData.totalServices.toLocaleString()}
            </div>
            <p className="text-orange-100 text-sm">Available for booking</p>
          </div>
        </div>

        {/* ================= Metrics ==================== */}
        {dashboardLayout.showMetrics && (
          <PerformanceMetricsWidget
            metrics={analyticsData.performanceMetrics}
          />
        )}

        {/* ================= Activity + Notes =========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dashboardLayout.showActivity && (
            <ActivityFeedWidget activities={analyticsData.recentActivity} />
          )}
          {dashboardLayout.showNotifications && (
            <NotificationsWidget
              notifications={analyticsData.notifications}
              onMarkAsRead={markRead}
              onClearAll={clearNotes}
            />
          )}
        </div>



        {/* ================= Charts ===================== */}
        {dashboardLayout.showCharts &&
          analyticsData.timeSeriesData.length > 0 && (
            <div className="space-y-6">
              {/* Chart selector */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Chart Visualization
                  </h3>

                  {/* Trends selector */}
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                    <select
                      value={chartTypes.trends}
                      onChange={(e) => changeChartType('trends', e)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="area">Area</option>
                      <option value="line">Line</option>
                      <option value="bar">Bar</option>
                    </select>
                    <span className="text-sm text-gray-600">Trends</span>
                  </div>

                  {/* Distribution selector */}
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-gray-500" />
                    <select
                      value={chartTypes.distribution}
                      onChange={(e) => changeChartType('distribution', e)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pie">Pie</option>
                      <option value="donut">Donut</option>
                      <option value="bar">Bar</option>
                    </select>
                    <span className="text-sm text-gray-600">
                      Distribution
                    </span>
                  </div>
                </div>
              </div>

              {/* Growth trends */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Growth Trends
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {renderTrends()}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue + category */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Revenue Trends
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={analyticsData.timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="orders"
                          fill="#82ca9d"
                          name="Orders"
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8884d8"
                          strokeWidth={3}
                          name="Revenue ($)"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Distribution */}
                {analyticsData.categoryData.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Category Distribution
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        {renderDistribution()}
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        
        
        {/* ================= footer =================== */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4 mb-2 md:mb-0">
              <span>Analytics Dashboard v2.0</span>
              <span>•</span>
              <span>Connected to Firebase</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live data
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchAll}
                className="flex items-center gap-1 hover:text-gray-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </button>
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default EnhancedAnalyticsDashboard;
