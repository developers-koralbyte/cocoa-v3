// components/AnalyticsWidgets.tsx
import React from 'react';
import {
  Activity,
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Clock,
  Users,
  Zap,
  DollarSign,
  Percent,
  Globe,
  Shield,
  Server,
} from 'lucide-react';

/* ------------------------------------------------------------------
   TypeScript interfaces
------------------------------------------------------------------- */
interface RealtimeStatsProps {
  onlineUsers: number;
  activeVendors: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export interface ActivityItem {
  id: string;
  type:
    | 'user_registered'
    | 'vendor_joined'
    | 'product_added'
    | 'service_added'
    | 'order_placed';
  message: string;
  timestamp: Date;
  userName?: string;
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface PerformanceMetric {
  label: string;
  value: number;
  change: number;
  format: 'number' | 'currency' | 'percentage';
  icon: React.ReactNode;
  color: string;
}

interface PerformanceMetricsProps {
  metrics: PerformanceMetric[];
}

interface SystemHealthProps {
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: number;
  errorRate: number;
}

/* ==================================================================
   Realtime-stats widget
================================================================== */
export const RealtimeStatsWidget: React.FC<RealtimeStatsProps> = ({
  onlineUsers,
  activeVendors,
  systemHealth,
}) => {
  const getHealthColor = (h: string) => {
    switch (h) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (h: string) => {
    switch (h) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
        return <X className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Real-time Status
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-500">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Online users */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">ONLINE</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {onlineUsers}
          </div>
          <div className="text-sm text-blue-600">Active Users</div>
        </div>

        {/* Live vendors */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">ACTIVE</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {activeVendors}
          </div>
          <div className="text-sm text-purple-600">Live Vendors</div>
        </div>

        {/* System health */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600 font-medium">SYSTEM</span>
          </div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(
              systemHealth
            )}`}
          >
            {getHealthIcon(systemHealth)}
            {systemHealth.charAt(0).toUpperCase() + systemHealth.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==================================================================
   Activity-feed widget
================================================================== */
interface ActivityFeedProps {
  activities: ActivityItem[];
}

export const ActivityFeedWidget: React.FC<ActivityFeedProps> = ({
  activities,
}) => {
  const getActivityIcon = (t: string) => {
    switch (t) {
      case 'user_registered':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'vendor_joined':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'product_added':
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      case 'service_added':
        return <Zap className="w-4 h-4 text-orange-500" />;
      case 'order_placed':
        return <Activity className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (t: string) => {
    switch (t) {
      case 'user_registered':
        return 'bg-blue-50 border-blue-200';
      case 'vendor_joined':
        return 'bg-green-50 border-green-200';
      case 'product_added':
        return 'bg-purple-50 border-purple-200';
      case 'service_added':
        return 'bg-orange-50 border-orange-200';
      case 'order_placed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatAgo = (d: Date) => {
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Recent Activity
        </h3>
        <Activity className="w-5 h-5 text-gray-500" />
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((a) => (
            <div
              key={a.id}
              className={`p-3 rounded-lg border hover:shadow-sm transition-all ${getActivityColor(
                a.type
              )}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getActivityIcon(a.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {a.message}
                  </p>
                  {a.userName && (
                    <p className="text-xs text-gray-600 mt-1">
                      by {a.userName}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatAgo(a.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ==================================================================
   Notifications widget
================================================================== */
interface NotificationsWidgetProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationsWidget: React.FC<NotificationsWidgetProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  const getNotifIcon = (t: string) => {
    switch (t) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotifColor = (t: string, read: boolean) => {
    const fade = read ? 'opacity-60' : '';
    switch (t) {
      case 'info':
        return `bg-blue-50 border-blue-200 ${fade}`;
      case 'warning':
        return `bg-yellow-50 border-yellow-200 ${fade}`;
      case 'error':
        return `bg-red-50 border-red-200 ${fade}`;
      case 'success':
        return `bg-green-50 border-green-200 ${fade}`;
      default:
        return `bg-gray-50 border-gray-200 ${fade}`;
    }
  };

  const formatAgo = (d: Date) => {
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800">
            Notifications
          </h3>
          {unread > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unread}
            </span>
          )}
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${getNotifColor(
                n.type,
                n.read
              )}`}
              onClick={() => !n.read && onMarkAsRead(n.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getNotifIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-800">
                      {n.title}
                    </h4>
                    {!n.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatAgo(n.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ==================================================================
   Performance-metrics widget
================================================================== */
export const PerformanceMetricsWidget: React.FC<PerformanceMetricsProps> = ({
  metrics,
}) => {
  const fmtVal = (v: number, f: string) => {
    switch (f) {
      case 'currency':
        return `$${v.toLocaleString()}`;
      case 'percentage':
        return `${v.toFixed(1)}%`;
      default:
        return v.toLocaleString();
    }
  };
  const chg = (c: number) => `${c >= 0 ? '+' : ''}${c.toFixed(1)}%`;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Key Performance Metrics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${m.color}`}>{m.icon}</div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  m.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {m.change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4 rotate-180" />
                )}
                {chg(m.change)}
              </div>
            </div>

            <div className="text-2xl font-bold text-gray-800 mb-1">
              {fmtVal(m.value, m.format)}
            </div>
            <div className="text-sm text-gray-600">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==================================================================
   System-health widget
================================================================== */
export const SystemHealthWidget: React.FC<SystemHealthProps> = ({
  systemHealth,
  uptime,
  responseTime,
  errorRate,
}) => {
  const status = (() => {
    switch (systemHealth) {
      case 'healthy':
        return {
          color: 'text-green-600 bg-green-100',
          icon: <CheckCircle className="w-5 h-5" />,
          msg: 'All systems operational',
        };
      case 'warning':
        return {
          color: 'text-yellow-600 bg-yellow-100',
          icon: <AlertTriangle className="w-5 h-5" />,
          msg: 'Some services degraded',
        };
      case 'critical':
        return {
          color: 'text-red-600 bg-red-100',
          icon: <X className="w-5 h-5" />,
          msg: 'Service disruption detected',
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-100',
          icon: <Info className="w-5 h-5" />,
          msg: 'Status unknown',
        };
    }
  })();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        System Health
      </h3>

      <div className="space-y-4">
        <div
          className={`inline-flex items-center gap-3 px-4 py-3 rounded-lg ${status.color}`}
        >
          {status.icon}
          <div>
            <div className="font-medium">
              {systemHealth.charAt(0).toUpperCase() +
                systemHealth.slice(1)}
            </div>
            <div className="text-sm opacity-80">{status.msg}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-800">
              {uptime}
            </div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-800">
              {responseTime}ms
            </div>
            <div className="text-sm text-gray-600">Response Time</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-800">
              {errorRate.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600">Error Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==================================================================
   Quick-stats card (helper)
================================================================== */
interface QuickStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; isPositive: boolean };
}

export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend && (
          <div
            className={`flex items-center mt-2 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
            )}
            {trend.value}% vs last period
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>{icon}</div>
    </div>
  </div>
);

/* ==================================================================
   Loading / error / empty-state helpers
================================================================== */
export const LoadingWidget: React.FC<{ message?: string }> = ({
  message = 'Loading...',
}) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  </div>
);

export const ErrorWidget: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200">
    <div className="text-center py-8">
      <X className="w-8 h-8 text-red-500 mx-auto mb-4" />
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

export const EmptyStateWidget: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: { label: string; onClick: () => void };
}> = ({ title, description, icon, action }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="text-center py-8">
      <div className="text-gray-300 mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  </div>
);
