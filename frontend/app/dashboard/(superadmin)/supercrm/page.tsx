"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dailyTasksUpdatedEventName, DailyTask, fetchTasksFromServer, getLocalDateKey, getTasksByDate, updateTaskCompletion } from "@/lib/dailyTasks";

interface CRMStats {
  formLeads: {
    total: number;
    new: number;
    contacted: number;
    converted: number;
  };
  demoRequests: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  thisWeek: {
    newLeads: number;
    conversions: number;
    demos: number;
  };
  sources: Record<string, number>;
}

export default function SuperCRMDashboard() {
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentDemos, setRecentDemos] = useState<any[]>([]);
  const [todayTasks, setTodayTasks] = useState<DailyTask[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentData();

    const loadTasks = async () => {
      // Fetch from server
      await fetchTasksFromServer();
      const todayKey = getLocalDateKey(new Date());
      setTodayTasks(getTasksByDate(todayKey));
    };

    loadTasks();
    window.addEventListener(dailyTasksUpdatedEventName, loadTasks);
    window.addEventListener("storage", loadTasks);

    return () => {
      window.removeEventListener(dailyTasksUpdatedEventName, loadTasks);
      window.removeEventListener("storage", loadTasks);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/supercrm/stats", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching CRM stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentData = async () => {
    try {
      // Fetch recent leads
      const leadsRes = await fetch("/api/form-leads?limit=5", { credentials: "include" });
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setRecentLeads(data.leads || []);
      }

      // Fetch recent demo requests
      const demosRes = await fetch("/api/demo-requests?limit=5", { credentials: "include" });
      if (demosRes.ok) {
        const data = await demosRes.json();
        setRecentDemos(data.demoRequests || []);
      }
    } catch (err) {
      console.error("Error fetching recent data:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-500 bg-clip-text text-transparent dark:from-purple-400 dark:via-cyan-300 dark:to-purple-400">
              SuperCRM Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
              Manage your careers leads and demo requests
            </p>
          </div>
          <Link href="/dashboard/supercrm/all-leads" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 dark:from-purple-700 dark:to-cyan-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl">
            + Add New Lead
          </Link>
        </div>

        {/* KPI Metrics - 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Form Leads */}
          <Link href="/dashboard/supercrm/form-leads" className="block group">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Form Leads</p>
                  <h3 className="text-4xl font-bold text-white mt-2">{stats?.formLeads.total || 0}</h3>
                </div>
                <span className="text-4xl">📝</span>
              </div>
              <div className="flex items-center gap-3 text-blue-100 text-sm">
                <span>+ {stats?.formLeads.new || 0} this week</span>
                <span>·</span>
                <span>{stats?.formLeads.contacted || 0} New</span>
              </div>
            </div>
          </Link>

          {/* Demo Requests */}
          <Link href="/dashboard/supercrm/demo-requests" className="block group">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-green-100 text-sm font-medium uppercase tracking-wider">Demo Requests</p>
                  <h3 className="text-4xl font-bold text-white mt-2">{stats?.demoRequests.total || 0}</h3>
                </div>
                <span className="text-4xl">📅</span>
              </div>
              <div className="flex items-center gap-3 text-green-100 text-sm">
                <span>+ {stats?.demoRequests.pending || 0} this week</span>
                <span>·</span>
                <span>{stats?.demoRequests.confirmed || 0} Confirmed</span>
              </div>
            </div>
          </Link>

          {/* This Week */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-orange-100 text-sm font-medium uppercase tracking-wider">This Week</p>
                <h3 className="text-4xl font-bold text-white mt-2">{stats?.thisWeek.newLeads || 0}</h3>
              </div>
              <span className="text-4xl">📈</span>
            </div>
            <div className="flex items-center gap-3 text-orange-100 text-sm">
              <span>+ {stats?.thisWeek.demos || 0} week</span>
            </div>
          </div>

          {/* Conversions */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm font-medium uppercase tracking-wider">Conversions</p>
                <h3 className="text-4xl font-bold text-white mt-2">{stats?.formLeads.converted || 0}</h3>
              </div>
              <span className="text-4xl">🎯</span>
            </div>
            <div className="flex items-center gap-3 text-purple-100 text-sm">
              <span>+ 25%</span>
              <span>·</span>
              <span>₹87,500 Revenue</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Leads Overview - 2 cols */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Leads Overview</h2>
              <select className="px-3 py-1 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Month</option>
              </select>
            </div>
            
            {/* Simple Area Chart SVG */}
            <svg className="w-full h-48" viewBox="0 0 400 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="formGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="demoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="conversionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="30" x2="400" y2="30" stroke="#e2e8f0" strokeWidth="1" opacity="0.3" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="#e2e8f0" strokeWidth="1" opacity="0.3" />
              <line x1="0" y1="90" x2="400" y2="90" stroke="#e2e8f0" strokeWidth="1" opacity="0.3" />
              <line x1="0" y1="120" x2="400" y2="120" stroke="#e2e8f0" strokeWidth="1" opacity="0.3" />
              
              <path d="M 0 100 Q 50 60 100 70 T 200 40 T 300 50 T 400 30 L 400 150 L 0 150 Z" fill="url(#formGradient)" />
              <path d="M 0 110 Q 50 75 100 85 T 200 50 T 300 60 T 400 40 L 400 150 L 0 150 Z" fill="url(#demoGradient)" />
              <path d="M 0 120 Q 50 90 100 95 T 200 65 T 300 75 T 400 55 L 400 150 L 0 150 Z" fill="url(#conversionGradient)" />
              
              <polyline points="0,100 50,60 100,70 150,50 200,40 250,55 300,50 350,35 400,30" stroke="#3b82f6" strokeWidth="2" fill="none" />
              <polyline points="0,110 50,75 100,85 150,60 200,50 250,65 300,60 350,45 400,40" stroke="#10b981" strokeWidth="2" fill="none" />
              <polyline points="0,120 50,90 100,95 150,75 200,65 250,80 300,75 350,60 400,55" stroke="#f59e0b" strokeWidth="2" fill="none" />
            </svg>

            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-4">
              <span>7-15</span>
              <span>8-5</span>
              <span>25 Mar</span>
              <span>28 Mar</span>
              <span>28 Mar</span>
              <span>13 Sep</span>
              <span>14 Sep</span>
            </div>

            {/* Legend */}
            <div className="flex gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-600 dark:text-slate-400">Form Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-slate-600 dark:text-slate-400">Demo Requests</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-slate-600 dark:text-slate-400">Conversions</span>
              </div>
            </div>
          </div>

          {/* Today's Tasks - 1 col */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Tasks</h2>
              <Link href="/dashboard" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">MANAGE</Link>
            </div>

            <div className="space-y-3">
              {todayTasks.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30 text-sm text-slate-500 dark:text-slate-400 text-center">
                  No tasks for today. Add tasks from Platform Analytics → Daily Tasks.
                </div>
              ) : (
                todayTasks.slice(0, 5).map((task) => (
                  <label key={task._id || task.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={async (event) => {
                        try {
                          const newStatus: 'pending' | 'completed' = event.target.checked ? 'completed' : 'pending';
                          await updateTaskCompletion(task._id || task.id || '', newStatus);
                        } catch (err) {
                          console.error('Error updating task:', err);
                        }
                      }}
                      className="mt-1 w-4 h-4 text-purple-600 rounded"
                    />
                    <div>
                      <p className={`text-sm font-medium ${task.status === 'completed' ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {task.time || "Any time"} • {task.priority}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Grid - 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Sources */}
          {stats?.sources && Object.keys(stats.sources).length > 0 && (
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lead Sources</h3>
                <a href="#" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">View All</a>
              </div>

              {/* Pie Chart */}
              <svg className="w-full h-40" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="50 100" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="30 100" strokeDashoffset="-50" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="20 100" strokeDashoffset="-80" />
                <text x="50" y="50" textAnchor="middle" dy="0.3em" className="text-2xl font-bold fill-slate-900" fontSize="20">45%</text>
                <text x="50" y="65" textAnchor="middle" dy="0.3em" className="text-xs fill-slate-600" fontSize="12">Total Leads</text>
              </svg>

              <div className="space-y-2 mt-4 text-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-slate-600 dark:text-slate-400">Website</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">45%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-slate-600 dark:text-slate-400">Facebook</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">30%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-slate-600 dark:text-slate-400">WhatsApp</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">20%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-slate-600 dark:text-slate-400">Others</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">5%</span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Form Leads */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Form Leads</h3>
              <Link href="/dashboard/supercrm/form-leads" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">View All →</Link>
            </div>

            <div className="space-y-3">
              {recentLeads.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No leads yet</p>
              ) : (
                recentLeads.slice(0, 4).map((lead) => (
                  <div key={lead._id} className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                      {lead.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{lead.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Hot Leads */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">🔥 Hot Leads</h3>
              <a href="#" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">VIEW ALL</a>
            </div>

            <div className="space-y-3">
              {[
                { name: "Swapnil Kadale", phone: "93306 79840", status: "Ready to Enroll", color: "green" },
                { name: "Pravin Karale", phone: "99537 19279", status: "Interested", color: "orange" },
                { name: "Meera Joshi", phone: "99604 91196", status: "Warm", color: "yellow" },
                { name: "Akash Pandey", phone: "72169 96927", status: "Ready to Enrol", color: "green" },
              ].map((lead, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                    {lead.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{lead.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{lead.phone}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    lead.color === "green" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                    lead.color === "orange" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" :
                    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                  }`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
