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
} from '../../../components/AdminDashboard/components/AnalyticsWidgets';
import {
  collection,
  getDocs,
  getDoc,
  setDoc, 
  doc,
  query,
  where,
  limit,
  orderBy, // ✅ Added missing import
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
  Download,
  RefreshCw,
  Settings,
  BarChart3,
  PieChart as PieChartIcon,
  Activity as ActivityIcon,
  DollarSign,
  Percent,
  Clock,
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
    try {
      const snap = await getDocs(
        query(collection(db, 'presence'), where('state', '==', 'online'))
      );
      return snap.size;
    } catch (error) {
      console.log('No presence collection found, returning 0');
      return 0;
    }
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
        try {
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
        } catch (error) {
          // If monthly_stats doesn't exist, use estimated revenue
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
            revenue: monthProducts * 100 + monthServices * 150,
          });
        }
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

  /* -----------------------------------------------------------------------
    //Key performance metrics generator
  ------------------------------------------------------------------------ */

  // Helper function to calculate monthly stats dynamically from existing data
  const calculateMonthlyStats = async (year: number, month: number) => {
    // Month range (e.g., July 2025)
    const startOfMonth = new Date(year, month - 1, 1); // month-1 because JS months are 0-indexed
    const endOfMonth = new Date(year, month, 1);

    try {
      // Get all data for the specific month using date filters
      const [usersSnap, vendorsSnap, productsSnap, servicesSnap] = await Promise.all([
        getDocs(query(
          collection(db, 'users'),
          where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
          where('createdAt', '<', Timestamp.fromDate(endOfMonth))
        )),
        getDocs(query(
          collection(db, 'Vendors'),
          where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
          where('createdAt', '<', Timestamp.fromDate(endOfMonth))
        )),
        getDocs(query(
          collection(db, 'products'),
          where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
          where('createdAt', '<', Timestamp.fromDate(endOfMonth))
        )),
        getDocs(query(
          collection(db, 'services'),
          where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
          where('createdAt', '<', Timestamp.fromDate(endOfMonth))
        ))
      ]);

      // Try to get appointments and reviews, but handle if they don't exist
      let appointmentsSnap, reviewsSnap;
      try {
        [appointmentsSnap, reviewsSnap] = await Promise.all([
          getDocs(query(
            collection(db, 'appointments'),
            where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
            where('createdAt', '<', Timestamp.fromDate(endOfMonth))
          )),
          getDocs(query(
            collection(db, 'reviews'),
            where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
            where('createdAt', '<', Timestamp.fromDate(endOfMonth))
          ))
        ]);
      } catch (error) {
        console.log('Appointments or reviews collection not found, using empty data');
        appointmentsSnap = { docs: [], size: 0 } as any;
        reviewsSnap = { docs: [], size: 0 } as any;
      }

      // Calculate revenue from actual transactions
      let monthlyRevenue = 0;
      
      // Revenue from appointments (services booked)
      if (appointmentsSnap && appointmentsSnap.docs) {
        appointmentsSnap.docs.forEach((doc: any) => {
          const appointment = doc.data();
          if (appointment.status === 'completed' && appointment.price) {
            monthlyRevenue += appointment.price;
          }
        });
      }

      // Revenue from product sales (estimate)
      productsSnap.docs.forEach(doc => {
        const product = doc.data();
        if (product.price) {
          // Estimate: assume 10% of products listed in a month get sold
          monthlyRevenue += (product.price * 0.1);
        }
      });

      // Revenue from service listings
      servicesSnap.docs.forEach(doc => {
        const service = doc.data();
        if (service.price) {
          // Estimate: assume 15% of services listed get booked
          monthlyRevenue += (service.price * 0.15);
        }
      });

      // Calculate other metrics
      const newUsersThisMonth = usersSnap.size;
      const newVendorsThisMonth = vendorsSnap.size;
      const newProductsThisMonth = productsSnap.size;
      const newServicesThisMonth = servicesSnap.size;
      
      // Get total counts (all time)
      const [totalUsersSnap, totalVendorsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'Vendors'))
      ]);

      const totalUsers = totalUsersSnap.size;
      const totalVendors = totalVendorsSnap.size;

      // Estimate active sessions based on activity
      const appointmentCount = appointmentsSnap ? appointmentsSnap.size : 0;
      const activityLevel = (newProductsThisMonth + newServicesThisMonth + appointmentCount) / Math.max(newUsersThisMonth, 1);
      const estimatedActiveSessions = Math.floor(totalUsers * Math.min(0.1, activityLevel * 0.02));

      // Estimate session duration based on platform engagement
      const reviewCount = reviewsSnap ? reviewsSnap.size : 0;
      const engagementScore = (reviewCount + appointmentCount) / Math.max(newUsersThisMonth, 1);
      const avgSessionDuration = Math.round(180 + (engagementScore * 60)); // 3-8 minutes based on engagement

      // Conversions = vendors who actually listed something
      const activeVendorsSnap = await getDocs(query(
        collection(db, 'Vendors'),
        where('createdAt', '<=', Timestamp.fromDate(endOfMonth))
      ));
      
      let conversions = 0;
      for (const vendorDoc of activeVendorsSnap.docs) {
        const vendorId = vendorDoc.id;
        
        // Check if this vendor has any products or services
        const [vendorProducts, vendorServices] = await Promise.all([
          getDocs(query(collection(db, 'products'), where('vendorId', '==', vendorId), limit(1))),
          getDocs(query(collection(db, 'services'), where('vendorId', '==', vendorId), limit(1)))
        ]);
        
        if (vendorProducts.size > 0 || vendorServices.size > 0) {
          conversions++;
        }
      }

      return {
        revenue: Math.round(monthlyRevenue * 100) / 100, // Round to 2 decimal places
        totalVendors: totalVendors,
        totalUsers: totalUsers,
        newUsersThisMonth: newUsersThisMonth,
        newVendorsThisMonth: newVendorsThisMonth,
        activeSessions: estimatedActiveSessions,
        avgSessionDuration: avgSessionDuration,
        conversions: conversions,
        timestamp: Timestamp.fromDate(startOfMonth)
      };

    } catch (error) {
      console.error('Error calculating monthly stats:', error);
      return null;
    }
  };

  // Function to create or update monthly stats
  const updateMonthlyStats = async (year: number, month: number) => {
    const stats = await calculateMonthlyStats(year, month);
    
    if (stats) {
      const monthId = `${year}-${String(month).padStart(2, '0')}`;
      await setDoc(doc(db, 'monthly_stats', monthId), stats);
      console.log(`Updated monthly stats for ${monthId}:`, stats);
      return stats;
    }
    return null;
  };

  // Updated generatePerformanceMetrics function that auto-creates missing stats
  const generatePerformanceMetrics = useCallback(
    async (
      data: AnalyticsState & { products: ProductDoc[]; services: ServiceDoc[] }
    ) => {
      const {
        totalUsers,
        totalVendors,
        onlineUsers,
      } = data;

      // Get current and previous month
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      const currentMonthId = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      const previousMonthId = `${previousYear}-${String(previousMonth).padStart(2, '0')}`;

      try {
        // Try to get existing stats
        let [currentStatSnap, previousStatSnap] = await Promise.all([
          getDoc(doc(db, 'monthly_stats', currentMonthId)),
          getDoc(doc(db, 'monthly_stats', previousMonthId))
        ]);

        // If current month stats don't exist, calculate them
        let currentStats;
        if (!currentStatSnap.exists()) {
          console.log(`Calculating stats for ${currentMonthId}...`);
          currentStats = await updateMonthlyStats(currentYear, currentMonth);
        } else {
          currentStats = currentStatSnap.data();
        }

        // If previous month stats don't exist, calculate them
        let previousStats;
        if (!previousStatSnap.exists()) {
          console.log(`Calculating stats for ${previousMonthId}...`);
          previousStats = await updateMonthlyStats(previousYear, previousMonth);
        } else {
          previousStats = previousStatSnap.data();
        }

        // Use calculated stats or fallbacks
        const currentRevenue = currentStats?.revenue || 0;
        const previousRevenue = previousStats?.revenue || 0;
        const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        const currentConversions = currentStats?.conversions || totalVendors;
        const previousConversions = previousStats?.conversions || Math.floor(totalVendors * 0.9);
        const conversionRate = totalUsers > 0 ? (currentConversions / totalUsers) * 100 : 0;
        const conversionChange = previousConversions > 0 ? ((currentConversions - previousConversions) / previousConversions) * 100 : 0;

        const activeSessions = currentStats?.activeSessions || Math.max(onlineUsers, Math.floor(totalUsers * 0.05));
        const previousActiveSessions = previousStats?.activeSessions || Math.floor(activeSessions * 0.9);
        const sessionChange = previousActiveSessions > 0 ? ((activeSessions - previousActiveSessions) / previousActiveSessions) * 100 : 0;

        const avgSessionDuration = currentStats?.avgSessionDuration || 240;
        const previousAvgDuration = previousStats?.avgSessionDuration || 230;
        const durationChange = previousAvgDuration > 0 ? ((avgSessionDuration - previousAvgDuration) / previousAvgDuration) * 100 : 0;

        return [
          {
            label: 'Monthly Revenue',
            value: currentRevenue,
            change: revenueChange,
            format: 'currency' as const,
            icon: <DollarSign className="w-5 h-5" />,
            color: 'bg-green-100 text-green-600',
          },
          {
            label: 'Conversion Rate',
            value: conversionRate,
            change: conversionChange,
            format: 'percentage' as const,
            icon: <Percent className="w-5 h-5" />,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Active Sessions',
            value: activeSessions,
            change: sessionChange,
            format: 'number' as const,
            icon: <ActivityIcon className="w-5 h-5" />,
            color: 'bg-purple-100 text-purple-600',
          },
          {
            label: 'Avg Session Duration',
            value: avgSessionDuration,
            change: durationChange,
            format: 'number' as const,
            icon: <Clock className="w-5 h-5" />,
            color: 'bg-orange-100 text-orange-600',
          },
        ];

      } catch (error) {
        console.error('Error generating performance metrics:', error);
        // Return basic fallback metrics
        return [
          {
            label: 'Monthly Revenue',
            value: 0,
            change: 0,
            format: 'currency' as const,
            icon: <DollarSign className="w-5 h-5" />,
            color: 'bg-green-100 text-green-600',
          },
          {
            label: 'Conversion Rate',
            value: totalUsers > 0 ? (totalVendors / totalUsers) * 100 : 0,
            change: 0,
            format: 'percentage' as const,
            icon: <Percent className="w-5 h-5" />,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Active Sessions',
            value: Math.max(onlineUsers, Math.floor(totalUsers * 0.05)),
            change: 0,
            format: 'number' as const,
            icon: <ActivityIcon className="w-5 h-5" />,
            color: 'bg-purple-100 text-purple-600',
          },
          {
            label: 'Avg Session Duration',
            value: 240,
            change: 0,
            format: 'number' as const,
            icon: <Clock className="w-5 h-5" />,
            color: 'bg-orange-100 text-orange-600',
          },
        ];
      }
    },
    []
  );

  // Enhanced generateActivity function - make it fully dynamic from Firebase
  const generateActivity = useCallback(
    async (): Promise<ActivityEntry[]> => {
      try {
        const list: ActivityEntry[] = [];

        // Option 1: If you have an 'activities' collection (recommended)
        try {
          const activitiesSnap = await getDocs(
            query(
              collection(db, 'activities'),
              orderBy('timestamp', 'desc'),
              limit(10)
            )
          );

          if (activitiesSnap.size > 0) {
            activitiesSnap.docs.forEach(doc => {
              const activity = doc.data();
              list.push({
                id: doc.id,
                type: activity.type,
                message: activity.message,
                timestamp: activity.timestamp.toDate(),
                userName: activity.userName || 'User'
              });
            });
            return list;
          }
        } catch (error) {
          console.log('No activities collection found, generating from other collections...');
        }

        // Option 2: Generate from existing collections with real-time queries
        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [recentUsers, recentVendors, recentProducts, recentServices] = await Promise.all([
          getDocs(query(
            collection(db, 'users'),
            where('createdAt', '>=', Timestamp.fromDate(last7Days)),
            orderBy('createdAt', 'desc'),
            limit(5)
          )),
          getDocs(query(
            collection(db, 'Vendors'),
            where('createdAt', '>=', Timestamp.fromDate(last7Days)),
            orderBy('createdAt', 'desc'),
            limit(5)
          )),
          getDocs(query(
            collection(db, 'products'),
            where('createdAt', '>=', Timestamp.fromDate(last7Days)),
            orderBy('createdAt', 'desc'),
            limit(5)
          )),
          getDocs(query(
            collection(db, 'services'),
            where('createdAt', '>=', Timestamp.fromDate(last7Days)),
            orderBy('createdAt', 'desc'),
            limit(5)
          ))
        ]);

        // Add recent users
        recentUsers.docs.forEach(doc => {
          const user = doc.data();
          list.push({
            id: `user-${doc.id}`,
            type: user.role === 'vendor' ? 'vendor_joined' : 'user_registered',
            message: user.role === 'vendor' 
              ? 'New vendor joined the platform'
              : 'New user registered',
            timestamp: toDate(user.createdAt),
            userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User'
          });
        });

        // Add recent vendors
        recentVendors.docs.forEach(doc => {
          const vendor = doc.data();
          list.push({
            id: `vendor-${doc.id}`,
            type: 'vendor_joined',
            message: 'New vendor joined the platform',
            timestamp: toDate(vendor.createdAt),
            userName: vendor.businessName || `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || 'Vendor'
          });
        });

        // Add recent products
        recentProducts.docs.forEach(doc => {
          const product = doc.data();
          list.push({
            id: `product-${doc.id}`,
            type: 'product_added',
            message: `New product added: ${product.name || 'Product'}`,
            timestamp: toDate(product.createdAt),
            userName: 'Vendor'
          });
        });

        // Add recent services
        recentServices.docs.forEach(doc => {
          const service = doc.data();
          list.push({
            id: `service-${doc.id}`,
            type: 'service_added',
            message: `New service added: ${service.name || 'Service'}`,
            timestamp: toDate(service.createdAt),
            userName: 'Vendor'
          });
        });

        // Try to add recent appointments/orders if available
        try {
          const recentAppointments = await getDocs(query(
            collection(db, 'appointments'),
            where('createdAt', '>=', Timestamp.fromDate(last7Days)),
            orderBy('createdAt', 'desc'),
            limit(3)
          ));

          recentAppointments.docs.forEach(doc => {
            const appointment = doc.data();
            list.push({
              id: `appointment-${doc.id}`,
              type: 'order_placed',
              message: `New appointment booked: ${appointment.serviceName || 'Service'}`,
              timestamp: toDate(appointment.createdAt),
              userName: appointment.buyerName || 'Customer'
            });
          });
        } catch (error) {
          console.log('No appointments collection for recent activity');
        }

        // Sort by timestamp and return top 10
        return list
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10);

      } catch (error) {
        console.error('Error generating activity:', error);
        return [];
      }
    },
    []
  );

  // Enhanced generateNotifications function - make it dynamic based on real metrics
  const generateNotifications = useCallback(
    async (data: AnalyticsState): Promise<NotificationEntry[]> => {
      try {
        const notes: NotificationEntry[] = [];

        // Get recent stats for comparison
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Check for growth milestones
        if (data.totalUsers >= 1000 && data.totalUsers < 1010) {
          notes.push({
            id: 'milestone-users-1000',
            type: 'success',
            title: 'Major Milestone! 🎉',
            message: `Congratulations! You've reached ${data.totalUsers.toLocaleString()} registered users!`,
            timestamp: new Date(),
            read: false,
          });
        }

        if (data.totalVendors >= 100 && data.totalVendors < 105) {
          notes.push({
            id: 'milestone-vendors-100',
            type: 'success',
            title: 'Vendor Milestone! 🚀',
            message: `Amazing! Platform now has ${data.totalVendors} active vendors!`,
            timestamp: new Date(),
            read: false,
          });
        }

        // Check daily growth
        const [yesterdayUsers, lastWeekUsers] = await Promise.all([
          getDocs(query(
            collection(db, 'users'),
            where('createdAt', '>=', Timestamp.fromDate(yesterday))
          )),
          getDocs(query(
            collection(db, 'users'),
            where('createdAt', '>=', Timestamp.fromDate(lastWeek))
          ))
        ]);

        if (yesterdayUsers.size > 10) {
          notes.push({
            id: 'high-signups-today',
            type: 'info',
            title: 'High Activity Today! 📈',
            message: `${yesterdayUsers.size} new users signed up in the last 24 hours!`,
            timestamp: new Date(),
            read: false,
          });
        }

        if (lastWeekUsers.size > 50) {
          notes.push({
            id: 'weekly-growth',
            type: 'success',
            title: 'Great Weekly Growth! 🔥',
            message: `${lastWeekUsers.size} new users joined this week!`,
            timestamp: new Date(),
            read: false,
          });
        }

        // Check for low activity warnings
        if (data.recentActivity.length < 3) {
          notes.push({
            id: 'low-activity',
            type: 'warning',
            title: 'Low Activity Alert ⚠️',
            message: 'Platform activity seems quiet today. Consider running a promotion!',
            timestamp: new Date(),
            read: false,
          });
        }

        // Check content warnings
        if (data.totalProducts + data.totalServices < 10) {
          notes.push({
            id: 'low-content',
            type: 'warning',
            title: 'Content Alert 📦',
            message: 'Consider encouraging vendors to add more products and services.',
            timestamp: new Date(),
            read: false,
          });
        }

        // Check for system health issues
        if (data.systemHealth === 'warning') {
          notes.push({
            id: 'system-warning',
            type: 'warning',
            title: 'System Performance ⚠️',
            message: 'Some services may be running slower than usual.',
            timestamp: new Date(),
            read: false,
          });
        }

        if (data.systemHealth === 'critical') {
          notes.push({
            id: 'system-critical',
            type: 'error',
            title: 'System Issues! 🚨',
            message: 'Critical system issues detected. Please check server status.',
            timestamp: new Date(),
            read: false,
          });
        }

        // Check for revenue milestones
        const currentRevenue = data.performanceMetrics.find(m => m.label === 'Monthly Revenue')?.value || 0;
        if (currentRevenue > 10000 && currentRevenue < 10500) {
          notes.push({
            id: 'revenue-milestone',
            type: 'success',
            title: 'Revenue Milestone! 💰',
            message: `Monthly revenue has exceeded ${(currentRevenue/1000).toFixed(1)}K!`,
            timestamp: new Date(),
            read: false,
          });
        }

        // Sort by timestamp (newest first) and limit to 5
        return notes
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 5);

      } catch (error) {
        console.error('Error generating notifications:', error);
        return [{
          id: 'error-notification',
          type: 'error',
          title: 'System Error',
          message: 'Unable to load notifications at this time.',
          timestamp: new Date(),
          read: false,
        }];
      }
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

      // ✅ Generate activity dynamically from Firebase (await the promise)
      const recentActivity = await generateActivity();

      const combined = {
        ...userStats,
        ...prodStats,
        products,
        services,
        recentActivity, // ✅ Now properly awaited
      } as AnalyticsState & {
        products: ProductDoc[];
        services: ServiceDoc[];
      };

      const performanceMetrics = await generatePerformanceMetrics(combined);
      
      // ✅ Generate notifications dynamically based on current data (await the promise)
      const notifications = await generateNotifications(combined);

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
        notifications, // ✅ Now properly awaited
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
    generateActivity, // ✅ Now fully dynamic
    generatePerformanceMetrics,
    generateNotifications, // ✅ Now fully dynamic
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
                className="px-3 py-1 text-sm bg-buttonBg text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
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