'use client';

import { useState, useEffect } from 'react';
import { connectWallet, getTrialPublicInfo, getTrialCount } from '@/lib/web3Client';

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

interface SearchFilters {
  searchTerm: string;
  phase: string;
  studyType: string;
  location: string;
  minCompensation: string;
  maxDuration: string;
  sortBy: 'newest' | 'oldest' | 'participants' | 'compensation';
}

interface TrialSearchProps {
  onTrialSelect?: (trialId: number) => void;
  selectedTrialId?: number;
  compactMode?: boolean;
}

export default function TrialSearch({
  onTrialSelect,
  selectedTrialId,
  compactMode = false,
}: TrialSearchProps) {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [filteredTrials, setFilteredTrials] = useState<Trial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    phase: '',
    studyType: '',
    location: '',
    minCompensation: '',
    maxDuration: '',
    sortBy: 'newest',
  });

  useEffect(() => {
    loadTrials();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trials, filters]);

  const loadTrials = async () => {
    try {
      setIsLoading(true);
      const { provider } = await connectWallet();

      // Get trial count first to know when to stop
      const trialCountBigInt = await getTrialCount(provider);
      const totalTrials = Number(trialCountBigInt);

      console.log('[TrialSearch] Loading', totalTrials, 'trials');

      const loadedTrials: Trial[] = [];

      // Load trials from 1 to totalTrials
      for (let trialId = 1; trialId <= totalTrials; trialId++) {
        try {
          const trial = await getTrialPublicInfo(provider, trialId);
          if (trial.isActive) {
            loadedTrials.push(trial);
          }
        } catch (err) {
          console.warn(`[TrialSearch] Failed to load trial ${trialId}:`, err);
        }
      }

      setTrials(loadedTrials);
      console.log('[TrialSearch] Loaded', loadedTrials.length, 'active trials');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load trials');
      console.error('[TrialSearch] Error loading trials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      phase: '',
      studyType: '',
      location: '',
      minCompensation: '',
      maxDuration: '',
      sortBy: 'newest',
    });
  };

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(
      ([key, value]) => key !== 'sortBy' && value !== ''
    ).length;
  };

  const applyFilters = () => {
    let filtered = [...trials];

    // Search term filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (trial) =>
          trial.trialName.toLowerCase().includes(term) ||
          trial.description.toLowerCase().includes(term) ||
          trial.location?.toLowerCase().includes(term)
      );
    }

    // Phase filter
    if (filters.phase) {
      filtered = filtered.filter((trial) => trial.trialPhase === filters.phase);
    }

    // Study type filter
    if (filters.studyType) {
      filtered = filtered.filter((trial) => trial.studyType === filters.studyType);
    }

    // Location filter
    if (filters.location) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter((trial) =>
        trial.location?.toLowerCase().includes(location)
      );
    }

    // Minimum compensation filter
    if (filters.minCompensation) {
      const minComp = parseFloat(filters.minCompensation);
      filtered = filtered.filter((trial) => {
        if (!trial.compensation) return false;
        const comp = parseFloat(trial.compensation);
        return comp >= minComp;
      });
    }

    // Maximum duration filter
    if (filters.maxDuration) {
      const maxDur = parseInt(filters.maxDuration);
      filtered = filtered.filter((trial) => {
        if (!trial.durationWeeks) return false;
        return trial.durationWeeks <= maxDur;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'participants':
          return b.participantCount - a.participantCount;
        case 'compensation':
          const compA = parseFloat(a.compensation || '0');
          const compB = parseFloat(b.compensation || '0');
          return compB - compA;
        default:
          return 0;
      }
    });

    setFilteredTrials(filtered);
  };

  return (
    <div className={`${compactMode ? '' : 'w-full max-w-6xl mx-auto'} p-6 bg-white rounded-lg shadow-md`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className={`font-bold text-gray-900 ${compactMode ? 'text-xl' : 'text-2xl'}`}>
            {compactMode ? 'Find Trials' : 'Search Clinical Trials'}
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>🔍</span>
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-600">
          {compactMode
            ? 'Search and filter trials'
            : 'Find clinical trials that match your preferences'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, description, or location..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Advanced Filters</h3>
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Trial Phase */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Trial Phase
              </label>
              <select
                value={filters.phase}
                onChange={(e) => handleFilterChange('phase', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Phases</option>
                <option value="Phase 1">Phase 1</option>
                <option value="Phase 2">Phase 2</option>
                <option value="Phase 3">Phase 3</option>
                <option value="Phase 4">Phase 4</option>
              </select>
            </div>

            {/* Study Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Study Type
              </label>
              <select
                value={filters.studyType}
                onChange={(e) => handleFilterChange('studyType', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="Interventional">Interventional</option>
                <option value="Observational">Observational</option>
                <option value="Clinical Registry">Clinical Registry</option>
                <option value="Patient-Centered Research">Patient-Centered Research</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g., New York, CA"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Minimum Compensation */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Min Compensation (ETH)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.0"
                value={filters.minCompensation}
                onChange={(e) => handleFilterChange('minCompensation', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Maximum Duration */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Max Duration (weeks)
              </label>
              <input
                type="number"
                placeholder="52"
                value={filters.maxDuration}
                onChange={(e) => handleFilterChange('maxDuration', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="participants">Most Participants</option>
                <option value="compensation">Highest Compensation</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {isLoading
            ? 'Loading trials...'
            : `Showing ${filteredTrials.length} of ${trials.length} trials`}
        </p>
      </div>

      {/* Trial List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trials...</p>
        </div>
      ) : filteredTrials.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trials Found</h3>
          <p className="text-sm text-gray-600 mb-4">
            Try adjusting your filters or search terms
          </p>
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrials.map((trial) => (
            <div
              key={trial.trialId}
              className={`p-4 border-2 rounded-lg transition-all cursor-pointer hover:shadow-md ${
                selectedTrialId === trial.trialId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => onTrialSelect && onTrialSelect(trial.trialId)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {trial.trialName}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{trial.description}</p>
                </div>
                {onTrialSelect && (
                  <div className="ml-4">
                    <input
                      type="radio"
                      checked={selectedTrialId === trial.trialId}
                      onChange={() => onTrialSelect(trial.trialId)}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {trial.trialPhase && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {trial.trialPhase}
                  </span>
                )}
                {trial.studyType && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    {trial.studyType}
                  </span>
                )}
                {trial.location && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    📍 {trial.location}
                  </span>
                )}
                {trial.compensation && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    💰 {trial.compensation} ETH
                  </span>
                )}
                {trial.durationWeeks && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    ⏱️ {trial.durationWeeks} weeks
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>👥 {trial.participantCount} participants</span>
                  <span>
                    📅 Created: {new Date(trial.createdAt * 1000).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-gray-400">
                  Sponsor: {trial.sponsor.slice(0, 6)}...{trial.sponsor.slice(-4)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
