import React, { useState } from 'react';
import {
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
  Download,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { DetailedAnalytics, SessionLog, UserProfile } from '../types';
import { StorageService } from '../utils/storage';
import { sound } from '../utils/soundEngine';

interface AnalyticsViewProps {
  profile: UserProfile;
  soundMuted: boolean;
  onRefreshData: () => void;
}

// Sophisticated monochrome/slate palette for donut chart slices
const DONUT_PALETTE = [
  '#18181b', // zinc-900
  '#3f3f46', // zinc-700
  '#71717a', // zinc-500
  '#a1a1aa', // zinc-400
  '#52525b', // zinc-600
  '#27272a', // zinc-800
  '#d4d4d8', // zinc-300
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  profile,
  soundMuted,
  onRefreshData,
}) => {
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'history'>('overview');

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

  const handleExportCSV = () => {
    if (!soundMuted) sound.playClick();
    const rows = [
      ['ID', 'Date', 'Type', 'Duration (min)', 'Subject', 'Task'],
      ...historyLogs.map((l) => [
        l.id,
        l.dateString,
        l.type,
        l.durationMinutes.toString(),
        l.subject || 'General',
        l.taskTitle || 'None',
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `study_sessions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24">
      {/* Top Header Card */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-zinc-950 text-white text-xs font-bold font-rounded shadow-xs">
                Analytics & Insights
              </span>
              <span className="text-xs font-bold text-zinc-500 font-rounded">
                Live Local Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
              Focus & Productivity Insights
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-rounded">
              Track your deep work discipline, subject allocations, and peak hourly flow.
            </p>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 p-1 rounded-full liquid-glass-subtle border border-zinc-200/80 shadow-2xs">
            {(['today', '7days', '30days', 'all'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  if (!soundMuted) sound.playClick();
                  setTimeframe(tf);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all font-rounded active:scale-95 ${
                  timeframe === tf
                    ? 'liquid-pill-active text-white'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {tf === 'today' ? 'Today' : tf === '7days' ? '7 Days' : tf === '30days' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-center">
        <div className="liquid-glass-subtle rounded-full p-1 flex items-center gap-1 shadow-xs border border-zinc-200/70">
          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              setActiveTab('overview');
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all font-rounded active:scale-95 ${
              activeTab === 'overview' ? 'liquid-pill-active text-white' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Overview & Trends</span>
          </button>

          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              setActiveTab('breakdown');
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all font-rounded active:scale-95 ${
              activeTab === 'breakdown' ? 'liquid-pill-active text-white' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Subjects & Heatmap</span>
          </button>

          <button
            onClick={() => {
              if (!soundMuted) sound.playClick();
              setActiveTab('history');
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all font-rounded active:scale-95 ${
              activeTab === 'history' ? 'liquid-pill-active text-white' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Session Logs ({historyLogs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & TRENDS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="liquid-glass rounded-3xl p-5 flex flex-col justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 font-rounded">
                Total Focus Time
              </span>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-mono">
                  {totalHours}
                </span>
                <span className="text-xs font-bold text-zinc-500 ml-1">hrs</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-rounded mt-1">
                {analytics.totalSessions} sessions completed
              </p>
            </div>

            <div className="liquid-glass rounded-3xl p-5 flex flex-col justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 font-rounded flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Streak</span>
              </span>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
                  {analytics.currentStreak}
                </span>
                <span className="text-xs font-bold text-zinc-500 ml-1">days</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-rounded mt-1">
                Best: {analytics.longestStreak} days
              </p>
            </div>

            <div className="liquid-glass rounded-3xl p-5 flex flex-col justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 font-rounded">
                Today Goal Progress
              </span>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
                  {todayGoalProgress}%
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-rounded mt-1">
                {todayHours} / {(goalMinutes / 60).toFixed(1)}h goal
              </p>
            </div>

            <div className="liquid-glass rounded-3xl p-5 flex flex-col justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 font-rounded">
                Peak Flow Hour
              </span>
              <div className="mt-2">
                <span className="text-lg sm:text-xl font-extrabold text-zinc-900 font-display">
                  {analytics.peakProductiveHour}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-rounded mt-1">
                Highest focus efficiency
              </p>
            </div>
          </div>

          {/* Daily Trend Histogram */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 font-display flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Daily Focus Trajectory</span>
                </h3>
                <p className="text-xs text-zinc-600 font-rounded mt-0.5">
                  Minutes studied per day over recent periods
                </p>
              </div>
            </div>

            {/* Bar Chart Canvas */}
            <div className="pt-6 pb-2">
              <div className="h-44 sm:h-52 flex items-end justify-between gap-2 sm:gap-3 border-b border-zinc-200 px-2">
                {analytics.dailyTrends.map((day, idx) => {
                  const heightPercent = maxTrendMin > 0 ? (day.minutes / maxTrendMin) * 100 : 0;
                  const isToday = idx === analytics.dailyTrends.length - 1;

                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-2 py-1 rounded-md bg-zinc-950 text-white text-[10px] font-mono whitespace-nowrap shadow-lg mb-1">
                        {day.minutes} mins • {day.sessions} sessions
                      </div>

                      {/* Bar Pillar */}
                      <div
                        className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 ${
                          isToday
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-xs'
                            : day.minutes > 0
                            ? 'bg-zinc-900 group-hover:bg-zinc-700'
                            : 'bg-zinc-100'
                        }`}
                        style={{ height: `${Math.max(6, heightPercent)}%` }}
                      />

                      {/* Label */}
                      <span className={`text-[10px] font-bold font-rounded truncate max-w-full ${isToday ? 'text-zinc-950 font-extrabold' : 'text-zinc-500'}`}>
                        {day.dayLabel.split(',')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 60-Day Activity Matrix */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-extrabold text-zinc-900 font-display flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-700" />
              <span>60-Day Consistency Map</span>
            </h3>

            <div className="grid grid-cols-10 sm:grid-cols-12 gap-1.5 sm:gap-2">
              {calendarDays.map((day) => {
                const intensity =
                  day.minutes >= 120
                    ? 'bg-emerald-600 text-white'
                    : day.minutes >= 60
                    ? 'bg-emerald-500 text-white'
                    : day.minutes >= 25
                    ? 'bg-emerald-300 text-emerald-950'
                    : day.hasSession
                    ? 'bg-emerald-200 text-emerald-950'
                    : 'bg-zinc-100 text-zinc-400';

                return (
                  <div
                    key={day.date}
                    title={`${day.label}: ${day.minutes} mins`}
                    className={`aspect-square rounded-lg flex items-center justify-center text-[9px] font-mono font-bold transition-transform hover:scale-110 cursor-pointer shadow-2xs ${intensity}`}
                  >
                    {day.minutes > 0 ? day.minutes : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBJECTS & HOURLY HEATMAP */}
      {activeTab === 'breakdown' && (
        <div className="space-y-6">
          {/* Subject Distribution & Donut Breakdown */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/80 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 font-display flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-zinc-900" />
                  <span>Subject Time Breakdown</span>
                </h3>
                <p className="text-xs text-zinc-600 font-rounded mt-0.5">
                  Visual distribution of your focus hours across academic subjects
                </p>
              </div>

              {analytics.subjectDistribution.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-full self-start sm:self-auto border border-zinc-200/60">
                  <span>Total: {analytics.totalFocusMinutes} mins</span>
                  <span>•</span>
                  <span>{analytics.subjectDistribution.length} Subjects</span>
                </div>
              )}
            </div>

            {analytics.subjectDistribution.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs font-rounded space-y-2">
                <PieChartIcon className="w-8 h-8 mx-auto text-zinc-300 stroke-[1.5]" />
                <p>No study session logs recorded in this timeframe yet.</p>
                <p className="text-[11px] text-zinc-400">Complete a Pomodoro session tagged with a subject to view your donut breakdown.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Donut Chart Canvas with Center Metric */}
                <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[260px]">
                  <div className="w-full h-64 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-zinc-950 text-white p-2.5 rounded-xl shadow-xl text-xs font-rounded border border-zinc-800">
                                  <div className="flex items-center gap-1.5 font-bold mb-1">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full"
                                      style={{ backgroundColor: data.color || DONUT_PALETTE[0] }}
                                    />
                                    <span>{data.subject}</span>
                                  </div>
                                  <div className="text-zinc-300 font-mono text-[11px] space-y-0.5">
                                    <div>Time: <strong className="text-white">{data.minutes} mins</strong> ({data.percentage}%)</div>
                                    <div>Sessions: <strong className="text-white">{data.sessions}</strong></div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Pie
                          data={analytics.subjectDistribution}
                          dataKey="minutes"
                          nameKey="subject"
                          cx="50%"
                          cy="50%"
                          innerRadius={68}
                          outerRadius={98}
                          paddingAngle={3}
                          stroke="#ffffff"
                          strokeWidth={2}
                          animationDuration={800}
                        >
                          {analytics.subjectDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${entry.subject}`}
                              fill={entry.color || DONUT_PALETTE[index % DONUT_PALETTE.length]}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Donut Inner Center Summary */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 font-rounded">
                        Top Subject
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-zinc-950 font-display truncate max-w-[120px]">
                        {analytics.subjectDistribution[0]?.subject || 'N/A'}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-zinc-600">
                        {analytics.subjectDistribution[0]?.percentage}% of time
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subject List & Progress Metrics */}
                <div className="lg:col-span-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-rounded mb-1">
                    Subject Allocation Detail
                  </h4>
                  {analytics.subjectDistribution.map((sub, idx) => {
                    const sliceColor = sub.color || DONUT_PALETTE[idx % DONUT_PALETTE.length];
                    return (
                      <div key={sub.subject} className="p-2.5 rounded-2xl bg-white/70 border border-zinc-200/80 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold font-rounded">
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                              style={{ backgroundColor: sliceColor }}
                            />
                            <span className="text-zinc-900 font-bold">{sub.subject}</span>
                          </span>
                          <span className="font-mono text-zinc-600">
                            {sub.minutes}m ({sub.percentage}%) • {sub.sessions} sessions
                          </span>
                        </div>

                        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/60">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${sub.percentage}%`,
                              backgroundColor: sliceColor,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 24-Hour Productivity Map */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-extrabold text-zinc-900 font-display">
              24-Hour Flow Intensity Map
            </h3>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {analytics.hourlyProductivity.map((hourData) => {
                const hourLabel = `${hourData.hour}:00`;
                const intensityRatio = maxHourlyMin > 0 ? hourData.minutes / maxHourlyMin : 0;

                return (
                  <div
                    key={hourData.hour}
                    title={`${hourLabel}: ${hourData.minutes} mins`}
                    className="p-2.5 rounded-2xl bg-white/70 border border-zinc-200/80 flex flex-col items-center justify-between text-center"
                  >
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">{hourLabel}</span>
                    <div
                      className="w-full h-1.5 rounded-full my-1.5 transition-all"
                      style={{
                        backgroundColor:
                          intensityRatio > 0
                            ? `rgba(16, 185, 129, ${Math.max(0.3, intensityRatio)})`
                            : '#f4f4f5',
                      }}
                    />
                    <span className="text-[10px] font-mono font-extrabold text-zinc-800">
                      {hourData.minutes}m
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SESSION HISTORY LOGS */}
      {activeTab === 'history' && (
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 font-display">
                Session Audit Trail
              </h3>
              <p className="text-xs text-zinc-600 font-rounded mt-0.5">
                Every focus block completed is stored securely in your browser.
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-all active:scale-95 shadow-2xs font-rounded"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {historyLogs.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs font-rounded">
              No sessions completed yet. Start your first Pomodoro to see it recorded here!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-rounded">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 font-bold">Date & Time</th>
                    <th className="py-2.5 font-bold">Type</th>
                    <th className="py-2.5 font-bold">Duration</th>
                    <th className="py-2.5 font-bold">Subject / Task</th>
                    <th className="py-2.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {historyLogs.slice(0, 50).map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3 font-mono text-zinc-700">
                        {new Date(log.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        •{' '}
                        {new Date(log.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 font-bold text-[10px] uppercase">
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-extrabold text-zinc-900">
                        {log.durationMinutes} mins
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          {log.subjectColor && (
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: log.subjectColor }}
                            />
                          )}
                          <span className="font-bold text-zinc-800 truncate max-w-xs">
                            {log.taskTitle || log.subject || 'General Study'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete record"
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
      )}
    </div>
  );
};
