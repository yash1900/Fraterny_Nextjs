'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, TrendingUp, MousePointer, Eye } from 'lucide-react';

interface AnalyticsOverview {
  totalVisits: number;
  averageSessionTime: string;
  bounceRate: string;
  conversionRate: string;
  pagesPerSession: number;
  averageTimeOnSite: number;
  mobileConversionRate: number;
  percentChange: {
    visits: number;
    sessionTime: number;
    bounceRate: number;
    conversionRate: number;
  };
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [overview, setOverview] = useState<AnalyticsOverview>({
    totalVisits: 0,
    averageSessionTime: '0 sec',
    bounceRate: '0%',
    conversionRate: '0%',
    pagesPerSession: 0,
    averageTimeOnSite: 0,
    mobileConversionRate: 0,
    percentChange: {
      visits: 0,
      sessionTime: 0,
      bounceRate: 0,
      conversionRate: 0
    }
  });

  useEffect(() => {
    fetchOverview();
  }, [period]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?operation=overview&period=${period}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setOverview(result.data);
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor your platform performance and user engagement</p>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="ytd">Year to Date</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Visits */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            {overview.percentChange.visits !== 0 && (
              <span className={`text-xs font-semibold ${overview.percentChange.visits > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {overview.percentChange.visits > 0 ? '+' : ''}{overview.percentChange.visits}%
              </span>
            )}
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Visits</h3>
          <p className="text-3xl font-bold text-gray-900">{overview.totalVisits.toLocaleString()}</p>
        </div>

        {/* Average Session Time */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            {overview.percentChange.sessionTime !== 0 && (
              <span className={`text-xs font-semibold ${overview.percentChange.sessionTime > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {overview.percentChange.sessionTime > 0 ? '+' : ''}{overview.percentChange.sessionTime}%
              </span>
            )}
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Avg Session Time</h3>
          <p className="text-3xl font-bold text-gray-900">{overview.averageSessionTime}</p>
        </div>

        {/* Bounce Rate */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MousePointer className="h-6 w-6 text-orange-600" />
            </div>
            {overview.percentChange.bounceRate !== 0 && (
              <span className={`text-xs font-semibold ${overview.percentChange.bounceRate < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {overview.percentChange.bounceRate > 0 ? '+' : ''}{overview.percentChange.bounceRate}%
              </span>
            )}
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Bounce Rate</h3>
          <p className="text-3xl font-bold text-gray-900">{overview.bounceRate}</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            {overview.percentChange.conversionRate !== 0 && (
              <span className={`text-xs font-semibold ${overview.percentChange.conversionRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {overview.percentChange.conversionRate > 0 ? '+' : ''}{overview.percentChange.conversionRate}%
              </span>
            )}
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Conversion Rate</h3>
          <p className="text-3xl font-bold text-gray-900">{overview.conversionRate}</p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h3 className="text-gray-600 text-sm font-medium">Pages Per Session</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{overview.pagesPerSession.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <h3 className="text-gray-600 text-sm font-medium">Avg Time on Site</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{Math.round(overview.averageTimeOnSite)}s</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <MousePointer className="h-5 w-5 text-gray-600" />
            <h3 className="text-gray-600 text-sm font-medium">Mobile Conversion</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{overview.mobileConversionRate.toFixed(2)}%</p>
        </div>
      </div>

      {/* Placeholder for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Overview</h3>
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Traffic chart will be displayed here</p>
              <p className="text-gray-400 text-xs mt-1">Currently showing placeholder data</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Distribution</h3>
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Device distribution chart</p>
              <p className="text-gray-400 text-xs mt-1">Currently showing placeholder data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> Analytics data is currently in placeholder mode. Real-time tracking will be implemented when analytics events are stored in the database.
        </p>
      </div>
    </div>
  );
}
