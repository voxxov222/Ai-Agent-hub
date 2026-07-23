import React, { useState } from 'react';
import { MemoryFact, HeartbeatTask, PendingAction } from '../types';
import { Brain, Activity, ShieldAlert, Plus, Trash2, Edit2, Check, X, Bell, Clock, Play, Sparkles, TrendingUp, BarChart2, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { SynapsesMind3D } from './SynapsesMind3D';

interface MemoryHeartbeatProps {
  memoryFacts: MemoryFact[];
  onAddFact: (fact: string, category: 'preference' | 'identity' | 'decision' | 'general') => void;
  onDeleteFact: (id: string) => void;
  heartbeatTasks: HeartbeatTask[];
  onToggleTask: (id: string) => void;
  pendingActions: PendingAction[];
  onApproveAction: (id: string) => void;
  onRejectAction: (id: string) => void;
}

export const MemoryHeartbeat: React.FC<MemoryHeartbeatProps> = ({
  memoryFacts,
  onAddFact,
  onDeleteFact,
  heartbeatTasks,
  onToggleTask,
  pendingActions,
  onApproveAction,
  onRejectAction
}) => {
  const [newFact, setNewFact] = useState('');
  const [newCategory, setNewCategory] = useState<'preference' | 'identity' | 'decision' | 'general'>('preference');
  const [simulatedLog, setSimulatedLog] = useState<string | null>(null);

  // 7-day heartbeat execution analytics data for Recharts
  const heartbeat7DayData = [
    { day: 'Thu', date: 'Jul 17', totalChecks: 1440, quietMaintained: 1438, notifications: 2, avgLatencyMs: 14 },
    { day: 'Fri', date: 'Jul 18', totalChecks: 1440, quietMaintained: 1440, notifications: 0, avgLatencyMs: 12 },
    { day: 'Sat', date: 'Jul 19', totalChecks: 1440, quietMaintained: 1439, notifications: 1, avgLatencyMs: 15 },
    { day: 'Sun', date: 'Jul 20', totalChecks: 1440, quietMaintained: 1440, notifications: 0, avgLatencyMs: 11 },
    { day: 'Mon', date: 'Jul 21', totalChecks: 1440, quietMaintained: 1437, notifications: 3, avgLatencyMs: 18 },
    { day: 'Tue', date: 'Jul 22', totalChecks: 1440, quietMaintained: 1439, notifications: 1, avgLatencyMs: 13 },
    { day: 'Wed', date: 'Today', totalChecks: 1440, quietMaintained: 1440, notifications: 0, avgLatencyMs: 10 }
  ];

  const handleCreateFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim()) return;
    onAddFact(newFact.trim(), newCategory);
    setNewFact('');
  };

  const handleRunHeartbeatCheck = () => {
    setSimulatedLog(
      'Running Heartbeat check loop...\n✓ Checking quiet hours (Pass: 08:45 AM)\n✓ Checking server health at http://localhost:3000 (Status: 200 OK)\n✓ 0 urgent notifications, quiet state maintained.'
    );
  };

  return (
    <div id="memory-heartbeat-view" className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-400" />
            <span>Long-Term Memory & Heartbeat Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tier 4 durable memory facts stored in Firestore, Tier 5 proactive background heartbeat loop, and 100M synapse neural mind visualization.
          </p>
        </div>

        <button
          onClick={handleRunHeartbeatCheck}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-bold shadow-lg transition-all"
        >
          <Play className="w-4 h-4" />
          <span>Trigger Heartbeat Check</span>
        </button>
      </div>

      {/* 3D Interactive Presence 100,000,000 Synapses Neural Mind */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Trillion's Mind — 100,000,000 Synaptic Network 3D Presence</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive 3D particle neural matrix simulating 100M synapses firing in real-time. Drag to orbit, change color palette, or view fullscreen.
            </p>
          </div>
        </div>

        <SynapsesMind3D />
      </div>

      {/* Recharts Analytics Section: 7-Day Heartbeat Execution Frequency */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              <span>Heartbeat Task Execution Frequency (Last 7 Days)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              1,440 background pings/day (1/min schedule). Quiet state maintained with zero unnecessary interruptions.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-slate-950 p-2 rounded-2xl border border-slate-800">
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300 font-medium">10,080 Checks</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span className="text-slate-300 font-medium">99.93% Quiet State</span>
            </div>
          </div>
        </div>

        {/* Recharts Area & Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          
          {/* Main Execution Frequency Area Chart */}
          <div className="lg:col-span-2 h-72 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={heartbeat7DayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorChecks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorQuiet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[1400, 1450]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', fontSize: '12px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="totalChecks" name="Total Checks Run" stroke="#10b981" fillOpacity={1} fill="url(#colorChecks)" strokeWidth={2} />
                <Area type="monotone" dataKey="quietMaintained" name="Quiet State Maintained" stroke="#6366f1" fillOpacity={1} fill="url(#colorQuiet)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Notifications & Latency Bar Chart */}
          <div className="h-72 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Interactions & Avg Latency (ms)</span>
              </h3>
              <p className="text-[10px] text-slate-500 mb-3">Proactive alerts generated vs background ping latency</p>
            </div>

            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={heartbeat7DayData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', fontSize: '11px' }}
                  />
                  <Bar dataKey="notifications" name="Alerts" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgLatencyMs" name="Avg Latency (ms)" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tier 4: Long-Term Memory Manager */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span>Tier 4: Memory Facts Log</span>
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                {memoryFacts.length} Facts Remembered
              </span>
            </div>

            {/* Add Fact Form */}
            <form onSubmit={handleCreateFact} className="flex gap-2">
              <input
                type="text"
                value={newFact}
                onChange={(e) => setNewFact(e.target.value)}
                placeholder="Teach Trillion a durable fact (e.g. 'Prefers dark mode UI and TypeScript')..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-2xl px-2 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="preference">Preference</option>
                <option value="identity">Identity</option>
                <option value="decision">Decision</option>
                <option value="general">General</option>
              </select>
              <button
                type="submit"
                disabled={!newFact.trim()}
                className="px-3 py-2 rounded-2xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-500 disabled:opacity-50 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Fact List */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {memoryFacts.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No facts stored yet. Add facts above or talk to Trillion.</p>
              ) : (
                memoryFacts.map((fact) => (
                  <div
                    key={fact.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs group hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-0.5 max-w-[80%]">
                      <div className="text-slate-200 font-medium">{fact.fact}</div>
                      <div className="text-[10px] text-purple-400 capitalize">{fact.category} • {fact.createdAt}</div>
                    </div>
                    <button
                      onClick={() => onDeleteFact(fact.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                      title="Delete fact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Tier 5: Heartbeat Tasks & Confirmation Safety Gate */}
        <div className="space-y-6">
          
          {/* Heartbeat Task List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <span>Tier 5: Heartbeat Background Tasks</span>
              </h2>
              <span className="text-[11px] text-slate-400">Quiet by default</span>
            </div>

            <div className="space-y-2">
              {heartbeatTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{task.title}</div>
                    <div className="text-[10px] text-slate-400">{task.schedule} • Status: {task.status}</div>
                  </div>
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      task.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {task.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>

            {simulatedLog && (
              <pre className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px] whitespace-pre-wrap">
                {simulatedLog}
              </pre>
            )}
          </div>

          {/* Safety Confirmation Gate */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>Safety Confirmation Gate</span>
              </h2>
              <span className="text-[11px] text-amber-300 font-semibold">Requires Approval</span>
            </div>

            <div className="space-y-2">
              {pendingActions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No pending actions requiring manual confirmation.</p>
              ) : (
                pendingActions.map((action) => (
                  <div
                    key={action.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300">{action.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        {action.severity.toUpperCase()} RISK
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{action.description}</p>
                    {action.status === 'pending' ? (
                      <div className="flex space-x-2 pt-1">
                        <button
                          onClick={() => onApproveAction(action.id)}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors"
                        >
                          Approve Action
                        </button>
                        <button
                          onClick={() => onRejectAction(action.id)}
                          className="flex-1 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] font-bold text-slate-400 pt-1">
                        Status: <span className="capitalize">{action.status}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
