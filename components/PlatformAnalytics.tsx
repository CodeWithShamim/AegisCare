'use client';

import { useState, useEffect } from 'react';
import { connectWallet, getTrialPublicInfo, getTrialCount, getPatientCount } from '@/lib/web3Client';

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

interface PlatformStats {
  totalTrials: number;
  totalPatients: number;
  totalParticipants: number;
  activeTrials: number;
  totalSponsors: number;
  avgParticipantsPerTrial: number;
  trialsByPhase: Record<string, number>;
  trialsByStudyType: Record<string, number>;
  topLocations: Array<{ location: string; count: number }>;
  recentTrials: Trial[];
  topSponsors: Array<{ sponsor: string; trialCount: number; totalParticipants: number }>;
}

export default function PlatformAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    loadPlatformStats();
  }, []);

  const loadPlatformStats = async () => {
    try {
      setIsLoading(true);
      const { provider } = await connectWallet();

      // Get total patients and trials
      const totalTrialCountBN = await getTrialCount(provider);
      const totalTrialCount = Number(totalTrialCountBN);
      const totalPatientCountBN = await getPatientCount(provider);
      const totalPatientCount = Number(totalPatientCountBN);

      // Load all trials
      const allTrials: Trial[] = [];
      for (let i = 1; i <= totalTrialCount; i++) {
        try {
          const trial = await getTrialPublicInfo(provider, i);
          allTrials.push(trial);
        } catch (err) {
          // Skip failed trials
        }
      }

      const activeTrials = allTrials.filter(t => t.isActive);
      const totalParticipants = allTrials.reduce((sum, t) => sum + t.participantCount, 0);
      const avgParticipants = allTrials.length > 0
        ? totalParticipants / allTrials.length
        : 0;

      // Count unique sponsors
      const uniqueSponsors = new Set(allTrials.map(t => t.sponsor.toLowerCase()));

      // Group by phase
      const trialsByPhase: Record<string, number> = {};
      allTrials.forEach(t => {
        if (t.trialPhase) {
          trialsByPhase[t.trialPhase] = (trialsByPhase[t.trialPhase] || 0) + 1;
        }
      });

      // Group by study type
      const trialsByStudyType: Record<string, number> = {};
      allTrials.forEach(t => {
        if (t.studyType) {
          trialsByStudyType[t.studyType] = (trialsByStudyType[t.studyType] || 0) + 1;
        }
      });

      // Top locations
      const locationCounts: Record<string, number> = {};
      allTrials.forEach(t => {
        if (t.location) {
          locationCounts[t.location] = (locationCounts[t.location] || 0) + 1;
        }
      });
      const topLocations = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Recent trials
      const recentTrials = [...allTrials]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);

      // Top sponsors
      const sponsorStats: Record<string, { trialCount: number; totalParticipants: number }> = {};
      allTrials.forEach(t => {
        const sponsor = t.sponsor.toLowerCase();
        if (!sponsorStats[sponsor]) {
          sponsorStats[sponsor] = { trialCount: 0, totalParticipants: 0 };
        }
        sponsorStats[sponsor].trialCount++;
        sponsorStats[sponsor].totalParticipants += t.participantCount;
      });

      const topSponsors = Object.entries(sponsorStats)
        .map(([sponsor, data]) => ({ sponsor, ...data }))
        .sort((a, b) => b.totalParticipants - a.totalParticipants)
        .slice(0, 10);

      setStats({
        totalTrials: allTrials.length,
        totalPatients: totalPatientCount,
        totalParticipants,
        activeTrials: activeTrials.length,
        totalSponsors: uniqueSponsors.size,
        avgParticipantsPerTrial: Math.round(avgParticipants * 10) / 10,
        trialsByPhase,
        trialsByStudyType,
        topLocations,
        recentTrials,
        topSponsors,
      });
    } catch (error) {
      console.error('[PlatformAnalytics] Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading platform analytics...</p>
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
            Unable to load platform statistics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Platform Analytics Dashboard</h2>
        <p className="text-sm text-gray-600">
          Comprehensive overview of the AegisCare platform performance
        </p>
      </div>

      {/* Key Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Trials"
          value={stats.totalTrials.toString()}
          icon="📋"
          color="blue"
          subtitle="Clinical trials registered"
        />
        <MetricCard
          title="Registered Patients"
          value={stats.totalPatients.toString()}
          icon="👥"
          color="green"
          subtitle="Patients on platform"
        />
        <MetricCard
          title="Total Eligibility Checks"
          value={stats.totalParticipants.toString()}
          icon="✓"
          color="purple"
          subtitle="Privacy-preserving checks"
        />
        <MetricCard
          title="Active Sponsors"
          value={stats.totalSponsors.toString()}
          icon="🏢"
          color="indigo"
          subtitle="Organizations hosting trials"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Active Trials"
          value={stats.activeTrials.toString()}
          icon="✅"
          color="green"
          subtitle={`${stats.totalTrials > 0 ? Math.round((stats.activeTrials / stats.totalTrials) * 100) : 0}% of total trials`}
        />
        <MetricCard
          title="Avg Participants/Trial"
          value={stats.avgParticipantsPerTrial.toString()}
          icon="📊"
          color="blue"
          subtitle="Average engagement per trial"
        />
        <MetricCard
          title="Patient Participation Rate"
          value={`${stats.totalPatients > 0 ? Math.round((stats.totalParticipants / stats.totalPatients) * 100) : 0}%`}
          icon="📈"
          color="purple"
          subtitle="Patients checking eligibility"
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
      </div>

      {/* Top Locations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🌍</span>
          <h3 className="text-lg font-semibold text-gray-900">Top Trial Locations</h3>
        </div>
        {stats.topLocations.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No location data</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.topLocations.map((item, index) => (
              <div
                key={item.location}
                className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.location}</span>
                </div>
                <span className="text-sm text-gray-600">{item.count} trials</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Sponsors */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏆</span>
          <h3 className="text-lg font-semibold text-gray-900">Top Sponsors by Engagement</h3>
        </div>
        {stats.topSponsors.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No sponsor data</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Sponsor Address</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Trials</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Total Checks</th>
                </tr>
              </thead>
              <tbody>
                {stats.topSponsors.map((item, index) => (
                  <tr key={item.sponsor} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-200 text-yellow-800 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-mono">
                      {item.sponsor.slice(0, 10)}...{item.sponsor.slice(-8)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.trialCount}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.totalParticipants}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Trials */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🕐</span>
          <h3 className="text-lg font-semibold text-gray-900">Recently Registered Trials</h3>
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
                    {trial.trialPhase} • {trial.studyType} • {trial.location}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {trial.participantCount} checks
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
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'indigo';
  subtitle?: string;
}

function MetricCard({ title, value, icon, color, subtitle }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    indigo: 'bg-indigo-50 border-indigo-200',
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      )}
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
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
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
