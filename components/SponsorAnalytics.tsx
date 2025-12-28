'use client';

import { useState, useEffect } from 'react';
import { connectWallet, getSponsorTrials, getTrialPublicInfo, getTrialCount } from '@/lib/web3Client';
import { useWalletConnection } from '@/lib/hooks/useWalletConnection';

interface Trial {
  trialId: number;
  trialName: string;
  description: string;
  sponsor: string;
  isActive: boolean;
  createdAt: number;
  participantCount: number;
  trialPhase?: string;
  compensation?: string;
  location?: string;
  durationWeeks?: number;
  studyType?: string;
}

interface TrialStats {
  totalTrials: number;
  activeTrials: number;
  totalParticipants: number;
  avgParticipantsPerTrial: number;
  trialsByPhase: Record<string, number>;
  trialsByStudyType: Record<string, number>;
  trialsByLocation: Record<string, number>;
  recentTrials: Trial[];
  topPerformingTrials: Trial[];
}

export default function SponsorAnalytics() {
  const { isConnected, address } = useWalletConnection();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TrialStats | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');

  useEffect(() => {
    if (isConnected && address) {
      loadAnalytics();
    }
  }, [isConnected, address, timeRange]);

  const loadAnalytics = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      const { provider } = await connectWallet();

      // Get sponsor's trials
      const trialIds = await getSponsorTrials(provider, address);

      const trials: Trial[] = [];
      for (const trialId of trialIds) {
        const trial = await getTrialPublicInfo(provider, trialId);
        trials.push(trial);
      }

      // Filter by time range
      const now = Math.floor(Date.now() / 1000);
      const timeRangeSeconds =
        timeRange === '7d' ? 7 * 24 * 60 * 60 :
        timeRange === '30d' ? 30 * 24 * 60 * 60 :
        timeRange === '90d' ? 90 * 24 * 60 * 60 :
        Infinity;

      const filteredTrials = trials.filter(t =>
        now - t.createdAt <= timeRangeSeconds
      );

      // Calculate stats
      const activeTrials = filteredTrials.filter(t => t.isActive);
      const totalParticipants = filteredTrials.reduce((sum, t) => sum + t.participantCount, 0);
      const avgParticipants = filteredTrials.length > 0
        ? totalParticipants / filteredTrials.length
        : 0;

      // Group by phase
      const trialsByPhase: Record<string, number> = {};
      filteredTrials.forEach(t => {
        if (t.trialPhase) {
          trialsByPhase[t.trialPhase] = (trialsByPhase[t.trialPhase] || 0) + 1;
        }
      });

      // Group by study type
      const trialsByStudyType: Record<string, number> = {};
      filteredTrials.forEach(t => {
        if (t.studyType) {
          trialsByStudyType[t.studyType] = (trialsByStudyType[t.studyType] || 0) + 1;
        }
      });

      // Group by location
      const trialsByLocation: Record<string, number> = {};
      filteredTrials.forEach(t => {
        if (t.location) {
          trialsByLocation[t.location] = (trialsByLocation[t.location] || 0) + 1;
        }
      });

      // Recent trials (last 5)
      const recentTrials = [...filteredTrials]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);

      // Top performing trials (by participants)
      const topPerformingTrials = [...filteredTrials]
        .sort((a, b) => b.participantCount - a.participantCount)
        .slice(0, 5);

      setStats({
        totalTrials: filteredTrials.length,
        activeTrials: activeTrials.length,
        totalParticipants,
        avgParticipantsPerTrial: Math.round(avgParticipants * 10) / 10,
        trialsByPhase,
        trialsByStudyType,
        trialsByLocation,
        recentTrials,
        topPerformingTrials,
      });
    } catch (error) {
      console.error('[SponsorAnalytics] Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Not Connected</h3>
          <p className="text-sm text-gray-600">
            Please connect your wallet to view your analytics dashboard
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-sm text-gray-600">
            Register your first clinical trial to see analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sponsor Analytics Dashboard</h2>
          <p className="text-sm text-gray-600">Track your clinical trial performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Trials"
          value={stats.totalTrials.toString()}
          icon="📋"
          color="blue"
        />
        <MetricCard
          title="Active Trials"
          value={stats.activeTrials.toString()}
          icon="✅"
          color="green"
        />
        <MetricCard
          title="Total Participants"
          value={stats.totalParticipants.toString()}
          icon="👥"
          color="purple"
        />
        <MetricCard
          title="Avg Participants/Trial"
          value={stats.avgParticipantsPerTrial.toString()}
          icon="📊"
          color="indigo"
        />
      </div>

      {/* Charts and Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trials by Phase */}
        <StatCard
          title="Trials by Phase"
          data={stats.trialsByPhase}
          icon="🔬"
          emptyMessage="No trial phase data"
        />

        {/* Trials by Study Type */}
        <StatCard
          title="Trials by Study Type"
          data={stats.trialsByStudyType}
          icon="🔍"
          emptyMessage="No study type data"
        />

        {/* Trials by Location */}
        <StatCard
          title="Trials by Location"
          data={stats.trialsByLocation}
          icon="📍"
          emptyMessage="No location data"
        />

        {/* Quick Stats */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📈</span>
            <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Active Rate</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.totalTrials > 0
                  ? Math.round((stats.activeTrials / stats.totalTrials) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Top Trial Performance</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.topPerformingTrials[0]?.participantCount || 0} participants
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trials */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🕐</span>
          <h3 className="text-lg font-semibold text-gray-900">Recent Trials</h3>
        </div>
        {stats.recentTrials.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No recent trials</p>
        ) : (
          <div className="space-y-3">
            {stats.recentTrials.map((trial) => (
              <div
                key={trial.trialId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{trial.trialName}</h4>
                  <p className="text-xs text-gray-500">
                    {trial.trialPhase} • {trial.studyType}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {trial.participantCount} participants
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(trial.createdAt * 1000).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Performing Trials */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏆</span>
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Trials</h3>
        </div>
        {stats.topPerformingTrials.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No trials yet</p>
        ) : (
          <div className="space-y-3">
            {stats.topPerformingTrials.map((trial, index) => (
              <div
                key={trial.trialId}
                className="flex items-center justify-between p-3 bg-yellow-50 rounded hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-200 text-yellow-800 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{trial.trialName}</h4>
                    <p className="text-xs text-gray-500">
                      {trial.trialPhase} • {trial.location}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {trial.participantCount} participants
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'indigo';
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    indigo: 'bg-indigo-50 border-indigo-200',
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

interface StatCardProps {
  title: string;
  data: Record<string, number>;
  icon: string;
  emptyMessage: string;
}

function StatCard({ title, data, icon, emptyMessage }: StatCardProps) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const maxValue = entries.length > 0 ? entries[0][1] : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-900">{key}</span>
                <span className="text-sm text-gray-600">{value} trials</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
