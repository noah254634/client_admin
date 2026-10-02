import React, { useEffect, useState } from 'react';
import {
  Users,
  Eye,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Compass,
  RefreshCw,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  Trash2,
} from 'lucide-react';
import { getAnalyticsStats, deleteAnalyticsVisit, deleteAnalyticsByDevice } from '../api';
import PageHeader from '../components/PageHeader';

function formatDuration(seconds = 0) {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatTimeAgo(dateString) {
  if (!dateString) return 'Just now';
  const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(30);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnalyticsStats(timeframe);
      setStats(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Could not fetch analytics telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [timeframe]);

  const handleDeleteVisit = async (visitId) => {
    try {
      await deleteAnalyticsVisit(visitId);
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          recentVisits: prev.recentVisits.filter((v) => v._id !== visitId),
        };
      });
    } catch (err) {
      console.error('Failed to delete visit:', err);
    }
  };

  const handleDeleteDeviceLogs = async (deviceType) => {
    if (!window.confirm(`Are you sure you want to delete all ${deviceType.toUpperCase()} device logs?`)) {
      return;
    }
    try {
      await deleteAnalyticsByDevice(deviceType);
      loadStats();
    } catch (err) {
      console.error(`Failed to delete ${deviceType} logs:`, err);
    }
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <PageHeader
          badge="// TELEMETRY & TRAFFIC"
          title="Visitor Analytics"
          subtitle="Real-time visitor devices, location tracking, and session duration"
        />
        <div className="h-40 rounded-2xl bg-[var(--badge-bg)] animate-pulse" />
      </div>
    );
  }

  const {
    summary = {},
    devices = { desktop: 0, mobile: 0, tablet: 0 },
    topLocations = [],
    topBrowsers = [],
    topOS = [],
    topPages = [],
    recentVisits = [],
  } = stats || {};

  const totalDeviceVisits = (devices.desktop || 0) + (devices.mobile || 0) + (devices.tablet || 0) || 1;
  const desktopPct = Math.round(((devices.desktop || 0) / totalDeviceVisits) * 100);
  const mobilePct = Math.round(((devices.mobile || 0) / totalDeviceVisits) * 100);
  const tabletPct = Math.round(((devices.tablet || 0) / totalDeviceVisits) * 100);

  const topCountry = topLocations[0]?.country || 'No location data';

  return (
    <div className="space-y-8">
      {/* Header & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <PageHeader
          badge="// TELEMETRY & TRAFFIC"
          title="Visitor Analytics"
          subtitle="Real-time visitor devices, location tracking, and session duration"
        />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[var(--bg-card)] p-1 rounded-full border border-[var(--border-color)]">
            {[
              { label: '7 Days', days: 7 },
              { label: '30 Days', days: 30 },
              { label: '90 Days', days: 90 },
            ].map(({ label, days }) => (
              <button
                key={days}
                onClick={() => setTimeframe(days)}
                className={`px-3 py-1 text-xs font-mono-code rounded-full transition-all ${
                  timeframe === days
                    ? 'bg-[var(--accent-gold)] text-black font-bold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={loadStats}
            disabled={loading}
            className="p-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--accent-gold)] text-[var(--text-primary)] transition-all"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top Level Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Pageviews */}
        <div className="glass-card p-5 space-y-2 border border-[var(--border-color)] hover:border-[var(--accent-gold)] transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
              TOTAL PAGEVIEWS
            </span>
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="font-sans-title text-3xl font-extrabold text-[var(--text-primary)]">
            {(summary.totalVisits || 0).toLocaleString()}
          </p>
          <span className="font-mono-code text-[10px] text-[var(--text-muted)] block">
            Over the last {summary.timeframeDays || 30} days
          </span>
        </div>

        {/* Metric 2: Unique Visitors */}
        <div className="glass-card p-5 space-y-2 border border-[var(--border-color)] hover:border-[var(--accent-gold)] transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
              UNIQUE VISITORS
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="font-sans-title text-3xl font-extrabold text-[var(--text-primary)]">
            {(summary.uniqueVisitors || 0).toLocaleString()}
          </p>
          <span className="font-mono-code text-[10px] text-emerald-400 block">
            Distinct visitor sessions
          </span>
        </div>

        {/* Metric 3: Avg Time Spent */}
        <div className="glass-card p-5 space-y-2 border border-[var(--border-color)] hover:border-[var(--accent-gold)] transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
              AVG TIME ON SITE
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-sans-title text-3xl font-extrabold text-[var(--text-primary)]">
            {formatDuration(summary.avgDuration || 0)}
          </p>
          <span className="font-mono-code text-[10px] text-[var(--text-muted)] block">
            Active reading &amp; navigation duration
          </span>
        </div>

        {/* Metric 4: Top Location */}
        <div className="glass-card p-5 space-y-2 border border-[var(--border-color)] hover:border-[var(--accent-gold)] transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
              TOP REGION
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="font-sans-title text-2xl font-bold text-[var(--text-primary)] truncate">
            {topCountry}
          </p>
          <span className="font-mono-code text-[10px] text-[var(--text-muted)] block">
            {topLocations[0] ? `${topLocations[0].count} visits` : 'No data'}
          </span>
        </div>
      </div>

      {/* Device Breakdown & Geographic Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Device Breakdown (5 cols) */}
        <div className="lg:col-span-5 glass-card p-6 border border-[var(--border-color)] space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <span className="font-mono-code text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)] flex items-center gap-2">
                <Monitor className="w-4 h-4" /> Device Breakdown
              </span>
              <span className="font-mono-code text-[10px] text-[var(--text-muted)]">
                {totalDeviceVisits} TOTAL
              </span>
            </div>

            {/* Desktop Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-code">
                <span className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                  <Monitor className="w-4 h-4 text-sky-400" /> Desktop
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)]">
                    {devices.desktop || 0} ({desktopPct}%)
                  </span>
                  {devices.desktop > 0 && (
                    <button
                      onClick={() => handleDeleteDeviceLogs('desktop')}
                      className="p-1 rounded text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      title="Clear all Desktop logs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="h-2 w-full bg-[var(--badge-bg)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${desktopPct}%` }}
                />
              </div>
            </div>

            {/* Mobile Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-code">
                <span className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                  <Smartphone className="w-4 h-4 text-emerald-400" /> Mobile Phone
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)]">
                    {devices.mobile || 0} ({mobilePct}%)
                  </span>
                  {devices.mobile > 0 && (
                    <button
                      onClick={() => handleDeleteDeviceLogs('mobile')}
                      className="p-1 rounded text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      title="Clear all Mobile logs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="h-2 w-full bg-[var(--badge-bg)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${mobilePct}%` }}
                />
              </div>
            </div>

            {/* Tablet Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-code">
                <span className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                  <Tablet className="w-4 h-4 text-purple-400" /> Tablet
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)]">
                    {devices.tablet || 0} ({tabletPct}%)
                  </span>
                  {devices.tablet > 0 && (
                    <button
                      onClick={() => handleDeleteDeviceLogs('tablet')}
                      className="p-1 rounded text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      title="Clear all Tablet logs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="h-2 w-full bg-[var(--badge-bg)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${tabletPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Browser & OS Badges */}
          <div className="pt-4 border-t border-[var(--border-color)] grid grid-cols-2 gap-4">
            <div>
              <span className="font-mono-code text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                Top Browsers
              </span>
              <div className="flex flex-wrap gap-1.5">
                {topBrowsers.map((b) => (
                  <span
                    key={b.browser}
                    className="px-2 py-0.5 rounded-md bg-[var(--badge-bg)] border border-[var(--border-color)] text-[10px] font-mono-code text-[var(--text-secondary)]"
                  >
                    {b.browser}: {b.count}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-mono-code text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                Operating Systems
              </span>
              <div className="flex flex-wrap gap-1.5">
                {topOS.map((o) => (
                  <span
                    key={o.os}
                    className="px-2 py-0.5 rounded-md bg-[var(--badge-bg)] border border-[var(--border-color)] text-[10px] font-mono-code text-[var(--text-secondary)]"
                  >
                    {o.os}: {o.count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Geographic Locations & Top Pages (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 border border-[var(--border-color)] space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <span className="font-mono-code text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)] flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Top Visitor Geographics
            </span>
            <span className="font-mono-code text-[10px] text-[var(--text-muted)]">
              COUNTRY / CITY
            </span>
          </div>

          {topLocations.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] font-mono-code py-8 text-center">
              No geographical location records logged yet.
            </p>
          ) : (
            <div className="space-y-3">
              {topLocations.slice(0, 6).map((loc, idx) => {
                const pct = Math.round((loc.count / (summary.totalVisits || 1)) * 100);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] text-xs font-mono-code"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-[var(--badge-bg)] flex items-center justify-center font-bold text-[10px] text-[var(--accent-gold)] shrink-0">
                        {loc.countryCode !== 'XX' ? loc.countryCode : '🌐'}
                      </span>
                      <div className="min-w-0">
                        <span className="block font-bold text-[var(--text-primary)] truncate">
                          {loc.country}
                        </span>
                        <span className="block text-[10px] text-[var(--text-muted)] truncate">
                          {loc.city !== 'Unknown' ? loc.city : 'General Region'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-[var(--text-primary)] block">
                        {loc.count} visits
                      </span>
                      <span className="text-[10px] text-[var(--accent-gold)] block font-semibold">
                        {pct}% of total
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Live Visitor Activity Log Table */}
      <div className="glass-card p-6 border border-[var(--border-color)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <span className="font-mono-code text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)] flex items-center gap-2">
            <Layers className="w-4 h-4" /> Live Visitor Telemetry Stream
          </span>
          <span className="font-mono-code text-[10px] text-[var(--text-muted)]">
            RECENT {recentVisits.length} LOGS
          </span>
        </div>

        {recentVisits.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] font-mono-code py-8 text-center">
            No live visitor logs available yet. Visit your public portfolio to test tracking.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-code text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 px-4">Location</th>
                  <th className="pb-3 px-4">Device / OS / Browser</th>
                  <th className="pb-3 px-4">Page Path</th>
                  <th className="pb-3 px-4">Time Spent</th>
                  <th className="pb-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {recentVisits.map((visit) => (
                  <tr key={visit._id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="py-3 pr-4 text-[var(--text-muted)] whitespace-nowrap">
                      {formatTimeAgo(visit.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-[var(--text-primary)] font-bold whitespace-nowrap">
                      <span className="mr-1.5">{visit.countryCode !== 'XX' ? `[${visit.countryCode}]` : '🌐'}</span>
                      {visit.city !== 'Unknown' ? `${visit.city}, ` : ''}{visit.country}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-[var(--badge-bg)] border border-[var(--border-color)] text-[10px] uppercase font-bold text-[var(--accent-gold)]">
                          {visit.deviceType}
                        </span>
                        <span className="text-[var(--text-secondary)] text-[11px]">
                          {visit.os} • {visit.browser}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[var(--text-primary)] whitespace-nowrap font-bold">
                      {visit.path}
                    </td>

                    <td className="py-3 px-4 font-bold text-emerald-400 whitespace-nowrap">
                      {formatDuration(visit.durationSeconds)}
                    </td>

                    <td className="py-3 pl-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteVisit(visit._id)}
                        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-all inline-flex items-center justify-center"
                        title="Delete device log entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
