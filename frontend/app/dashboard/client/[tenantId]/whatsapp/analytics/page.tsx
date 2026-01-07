"use client"

import { useState, useEffect } from "react"
import {
  BarChart3,
  MessageSquare,
  Users,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { useParams } from "next/navigation"

interface Stats {
  totalConversations: number
  totalMessages: number
  totalContacts: number
  avgResponseTime: string
  messagesSentToday: number
  messagesReceivedToday: number
  activeConversations: number
  deliveryRate: number
  readRate: number
  dailyStats: Array<{
    date: string
    sent: number
    received: number
    conversations: number
  }>
}

export default function AnalyticsPage() {
  const params = useParams()
  const tenantId = params.tenantId as string

  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState("7days")

  // Fetch stats
  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/whatsapp/stats?accountId=${tenantId}&range=${dateRange}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [tenantId, dateRange])

  if (isLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="animate-spin">
          <BarChart3 className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    )
  }

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    trend,
  }: {
    icon: any
    label: string
    value: string | number
    change?: number
    trend?: "up" | "down"
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 bg-green-50 rounded-lg">
          <Icon className="h-5 w-5 text-green-600" />
        </div>
        {change !== undefined && trend && (
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            {change}%
          </div>
        )}
      </div>
      <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
    </div>
  )

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">
              Track your WhatsApp messaging performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={MessageSquare}
            label="Total Messages"
            value={stats.totalMessages}
            change={12}
            trend="up"
          />
          <StatCard
            icon={Users}
            label="Active Conversations"
            value={stats.activeConversations}
            change={8}
            trend="up"
          />
          <StatCard
            icon={TrendingUp}
            label="Delivery Rate"
            value={`${stats.deliveryRate}%`}
            change={3}
            trend="up"
          />
          <StatCard
            icon={Users}
            label="Total Contacts"
            value={stats.totalContacts}
            change={15}
            trend="up"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Today's Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Today's Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Messages Sent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.messagesSentToday}
                    </p>
                  </div>
                </div>
                <span className="text-green-600 text-sm font-semibold">
                  +5%
                </span>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Messages Received</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.messagesReceivedToday}
                    </p>
                  </div>
                </div>
                <span className="text-green-600 text-sm font-semibold">
                  +8%
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Performance
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm">Delivery Rate</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.deliveryRate}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${stats.deliveryRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm">Read Rate</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.readRate}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${stats.readRate}%` }}
                  />
                </div>
              </div>

              <div className="pt-2">
                <p className="text-gray-600 text-sm">
                  Avg Response Time: <span className="font-semibold text-gray-900">{stats.avgResponseTime}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Activity */}
        {stats.dailyStats && stats.dailyStats.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Daily Activity
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Sent
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Received
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Conversations
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.dailyStats.map((day, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 text-gray-900">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{day.sent}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {day.received}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {day.conversations}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
