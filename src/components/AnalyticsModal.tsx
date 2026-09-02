import React, { useState } from 'react';
import {
  X,
  BarChart3,
  Flame,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Zap,
  Trash2,
  Award,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { DetailedAnalytics, SessionLog, UserProfile } from '../types';
import { StorageService } from '../utils/storage';
import { sound } from '../utils/soundEngine';

interface AnalyticsModalProps {
  isOpen: boolean;
  profile: UserProfile;
  soundMuted: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  profile,
  soundMuted,
  onClose,
  onRefreshData,
}) => {
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'history'>('overview');

  if (!isOpen) return null;

  const analytics: DetailedAnalytics = StorageService.computeAnalytics(timeframe);
  const historyLogs: SessionLog[] = StorageService.getHistory();

  const totalHours = (analytics.totalFocusMinutes / 60).toFixed(1);
  const todayHours = (analytics.todayFocusMinutes / 60).toFixed(1);

  // Daily goal completion percentage
  const goalMinutes = profile.dailyGoalMinutes || 180;
  const todayGoalProgress = Math.min(
    100,
    Math.round((analytics.todayFocusMinutes / goalMinutes) * 100)
  );

  // Maximum daily trend value for chart scaling
  const maxTrendMin = Math.max(...analytics.dailyTrends.map((t) => t.minutes), 60);

  // Maximum hourly productivity value for heatmap scaling
  const maxHourlyMin = Math.max(...analytics.hourlyProductivity.map((h) => h.minutes), 1);

  // Calculate 60-day calendar matrix
  const calendarDays = [];
  const streak = StorageService.getStreak();
  const activeDateSet = new Set(streak.historyDates || []);

  for (let i = 59; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    const dayLogs = historyLogs.filter((l) => l.dateString === iso && l.type === 'focus');
    const dayMins = dayLogs.reduce((sum, l) => sum + (l.durationMinutes || 25), 0);
    calendarDays.push({
      date: iso,
      minutes: dayMins,
      hasSession: activeDateSet.has(iso) || dayMins > 0,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }

  const handleDeleteLog = (logId: string) => {
    if (!soundMuted) sound.playClick();
    if (confirm('Delete this study session record?')) {
      StorageService.deleteSessionLog(logId);
      onRefreshData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-white border border-zinc-200 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-950 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-950 font-display">
                  Study Analytics & Focus Insights
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
                  {profile.username || 'Focus Scholar'}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Detailed metrics derived from your local study logs.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Navigation Bar */}
        <div className="px-5 sm:px-6 py-3 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-zinc-200/70 rounded-xl">
            {(['overview', 'breakdown', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  if (!soundMuted) sound.playClick();
                  setActiveTab(tab);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Timeframe Scope Selector */}
          <div className="flex items-center gap-1 p-1 bg-zinc-200/70 rounded-xl text-xs">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7days', label: '7 Days' },
                { id: '30days', label: '30 Days' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((tf) => (
              <button
                key={tf.id}
                onClick={() => {
                  if (!soundMuted) sound.playClick();
                  setTimeframe(tf.id);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  timeframe === tf.id
                    ? 'bg-zinc-950 text-white shadow-2xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* Top 4 KPI Metric Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 shadow-2xs">
                  <div className="flex items-center justify-between text-zinc-500 mb-1.5">
                    <span className="text-xs font-medium">Total Focus</span>
                    <Clock className="w-4 h-4 text-zinc-700" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-zinc-950">
                    {totalHours} <span className="text-xs text-zinc-500 font-normal">hrs</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1 font-mono">
                    {analytics.totalFocusMinutes} mins total
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 shadow-2xs">
                  <div className="flex items-center justify-between text-zinc-500 mb-1.5">
                    <span className="text-xs font-medium">Focus Rounds</span>
                    <Zap className="w-4 h-4 text-zinc-700" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-zinc-950">
                    {analytics.totalSessions}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    Completed sessions
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 shadow-2xs">
                  <div className="flex items-center justify-between text-zinc-500 mb-1.5">
                    <span className="text-xs font-medium">Today's Focus</span>
                    <TrendingUp className="w-4 h-4 text-zinc-700" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-zinc-950">
                    {todayHours} <span className="text-xs text-zinc-500 font-normal">hrs</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1 font-mono">
                    {todayGoalProgress}% of {profile.dailyGoalHours || 3}h goal
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 shadow-2xs">
                  <div className="flex items-center justify-between text-zinc-500 mb-1.5">
                    <span className="text-xs font-medium">Day Streak</span>
                    <Flame className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-zinc-950">
                    {streak.currentStreak} <span className="text-xs text-zinc-500 font-normal">days</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    Best: {streak.longestStreak} days
                  </div>
                </div>
              </div>

              {/* Daily Trend Histogram Chart */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950">
                      Daily Focus Distribution ({timeframe})
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Minutes spent in deep study per calendar day.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    Avg: {analytics.averageSessionDuration} min/session
                  </span>
                </div>

                {analytics.dailyTrends.length === 0 || analytics.totalFocusMinutes === 0 ? (
                  <div className="py-12 text-center text-xs text-zinc-400">
                    No completed focus sessions recorded in this timeframe yet.
                  </div>
                ) : (
                  <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 pt-6">
                    {analytics.dailyTrends.map((d, i) => {
                      const heightPercent = maxTrendMin > 0 ? (d.minutes / maxTrendMin) * 100 : 0;
                      const hasData = d.minutes > 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                          {/* Tooltip on hover */}
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono bg-zinc-950 text-white px-1.5 py-0.5 rounded pointer-events-none mb-1 shadow-md whitespace-nowrap">
                            {d.minutes}m ({d.sessions} rounds)
                          </span>

                          <div
                            className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                              hasData
                                ? 'bg-zinc-950 group-hover:bg-zinc-700'
                                : 'bg-zinc-200/70 h-1'
                            }`}
                            style={{ height: hasData ? `${Math.max(6, heightPercent)}%` : '4px' }}
                          />

                          <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[36px]">
                            {d.dayLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 60-Day Study Consistency Grid */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-700" />
                    <h3 className="text-sm font-bold text-zinc-950">
                      60-Day Consistency Heatmap
                    </h3>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">
                    {calendarDays.filter((d) => d.hasSession).length} Active Study Days
                  </span>
                </div>

                <div className="grid grid-cols-10 sm:grid-cols-12 gap-1.5 py-2">
                  {calendarDays.map((day) => {
                    // Monochrome heatmap levels
                    let cellColor = 'bg-zinc-200/70 border-zinc-200';
                    if (day.minutes >= 180) cellColor = 'bg-zinc-950 text-white';
                    else if (day.minutes >= 100) cellColor = 'bg-zinc-800 text-white';
                    else if (day.minutes >= 45) cellColor = 'bg-zinc-500 text-white';
                    else if (day.minutes > 0 || day.hasSession) cellColor = 'bg-zinc-300 text-zinc-900';

                    return (
                      <div
                        key={day.date}
                        className={`h-6 rounded-md flex items-center justify-center text-[9px] font-mono border transition-all hover:scale-110 cursor-pointer ${cellColor}`}
                        title={`${day.label}: ${day.minutes} mins focus`}
                      >
                        {day.minutes > 0 ? `${Math.round(day.minutes / 60)}h` : ''}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end gap-2 text-[10px] text-zinc-500 font-mono mt-3">
                  <span>Less</span>
                  <span className="w-3 h-3 rounded bg-zinc-200 border border-zinc-300" />
                  <span className="w-3 h-3 rounded bg-zinc-400" />
                  <span className="w-3 h-3 rounded bg-zinc-700" />
                  <span className="w-3 h-3 rounded bg-zinc-950" />
                  <span>More</span>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: BREAKDOWN */}
          {activeTab === 'breakdown' && (
            <div className="space-y-6">
              {/* Subject Distribution */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
                <h3 className="text-sm font-bold text-zinc-950 mb-1">
                  Subject & Tag Breakdown ({timeframe})
                </h3>
                <p className="text-xs text-zinc-500 mb-4">
                  Where your study energy is being allocated across courses.
                </p>

                {analytics.subjectDistribution.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-400">
                    No subject-tagged study sessions found in this timeframe.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics.subjectDistribution.map((item) => (
                      <div key={item.subject} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-900">
                            {item.subject}
                          </span>
                          <span className="font-mono text-zinc-500">
                            {item.minutes}m ({item.percentage}%) • {item.sessions} sessions
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-zinc-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-zinc-950 transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 24-Hour Productivity Clock Distribution */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
                <h3 className="text-sm font-bold text-zinc-950 mb-1">
                  Peak Productivity Hours
                </h3>
                <p className="text-xs text-zinc-500 mb-4">
                  When you focus most effectively throughout the 24-hour day.
                </p>

                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                  {analytics.hourlyProductivity.map((hp) => {
                    const ratio = maxHourlyMin > 0 ? hp.minutes / maxHourlyMin : 0;
                    const hourLabel = `${hp.hour % 12 || 12}${hp.hour >= 12 ? 'p' : 'a'}`;
                    return (
                      <div
                        key={hp.hour}
                        className="flex flex-col items-center p-2 rounded-xl bg-white border border-zinc-200 text-center"
                      >
                        <span className="text-[10px] font-mono text-zinc-500">
                          {hourLabel}
                        </span>
                        <div className="w-full h-8 flex items-end justify-center my-1">
                          <div
                            className="w-full rounded-sm bg-zinc-950"
                            style={{ height: `${Math.max(4, ratio * 100)}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono font-bold text-zinc-800">
                          {hp.minutes}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HISTORY LOGS */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">
                    Session Audit Log
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Complete chronological record of all recorded focus & break cycles.
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-500">
                  {historyLogs.length} total entries
                </span>
              </div>

              {historyLogs.length === 0 ? (
                <div className="p-8 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 text-center text-xs text-zinc-500">
                  No sessions logged yet. Complete your first Pomodoro to see timestamps here.
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {historyLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-zinc-950 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-zinc-950 truncate">
                              {log.taskTitle || 'Open Focus Session'}
                            </span>
                            {log.subject && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-800 font-semibold">
                                {log.subject}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                            {new Date(log.timestamp).toLocaleString()} • {log.durationMinutes} minutes ({log.type})
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors shrink-0"
                        title="Delete this record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
