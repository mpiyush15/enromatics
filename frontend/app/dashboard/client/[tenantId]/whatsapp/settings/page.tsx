"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  Key,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Save,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"

interface WhatsAppConfig {
  _id: string
  accountId: string
  platformUrl: string
  platformApiKey: string
  phoneNumberId?: string
  businessPhoneNumber?: string
  isConnected: boolean
  connectedAt?: string
  connectionStatus: "connected" | "disconnected" | "error"
  errorMessage?: string
}

export default function SettingsPage() {
  const params = useParams()
  const tenantId = params.tenantId as string

  const [config, setConfig] = useState<WhatsAppConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [formData, setFormData] = useState({
    platformUrl: "",
    platformApiKey: "",
  })
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // Fetch config
  const fetchConfig = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/whatsapp/config?accountId=${tenantId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setConfig(data.config || null)
        if (data.config) {
          setFormData({
            platformUrl: data.config.platformUrl || "",
            platformApiKey: data.config.platformApiKey || "",
          })
        }
      }
    } catch (error) {
      console.error("Error fetching config:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [tenantId])

  const handleSave = async () => {
    if (!formData.platformUrl.trim() || !formData.platformApiKey.trim()) {
      setErrorMessage("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)
      setErrorMessage("")
      setSuccessMessage("")

      const response = await fetch(`/api/whatsapp/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
        },
        body: JSON.stringify({
          accountId: tenantId,
          platformUrl: formData.platformUrl,
          platformApiKey: formData.platformApiKey,
        }),
      })

      if (response.ok) {
        setSuccessMessage("Configuration saved successfully")
        await fetchConfig()
        // Save API key to localStorage for BFF requests
        localStorage.setItem("whatsapp_api_key", formData.platformApiKey)
      } else {
        const error = await response.json()
        setErrorMessage(error.message || "Failed to save configuration")
      }
    } catch (error) {
      console.error("Error saving config:", error)
      setErrorMessage("An error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!formData.platformUrl.trim() || !formData.platformApiKey.trim()) {
      setErrorMessage("Please fill in all required fields first")
      return
    }

    try {
      setIsTesting(true)
      setErrorMessage("")
      setSuccessMessage("")

      const response = await fetch(`/api/whatsapp/config/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
        },
        body: JSON.stringify({
          accountId: tenantId,
          platformUrl: formData.platformUrl,
          platformApiKey: formData.platformApiKey,
        }),
      })

      if (response.ok) {
        setSuccessMessage(
          "Connection test successful! Your WhatsApp platform is accessible."
        )
      } else {
        const error = await response.json()
        setErrorMessage(
          error.message ||
            "Connection test failed. Please check your credentials."
        )
      }
    } catch (error) {
      console.error("Error testing connection:", error)
      setErrorMessage("Failed to test connection")
    } finally {
      setIsTesting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="animate-spin">
          <Settings className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    )
  }

  const isConnected = config?.connectionStatus === "connected"

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600 mt-1">
              Configure your WhatsApp platform connection
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Connection Status Card */}
          <div
            className={`mb-6 rounded-lg border-2 p-6 ${
              isConnected
                ? "bg-green-50 border-green-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-start gap-4">
              {isConnected ? (
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              ) : (
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              )}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${isConnected ? 'text-green-900' : 'text-yellow-900'}`}>
                  {isConnected ? "Connected" : "Not Connected"}
                </h3>
                <p className={`text-sm mt-1 ${isConnected ? 'text-green-700' : 'text-yellow-700'}`}>
                  {isConnected
                    ? `Connected to WhatsApp platform since ${new Date(
                        config?.connectedAt || ""
                      ).toLocaleDateString()}`
                    : "Please configure your WhatsApp platform credentials to get started"}
                </p>
                {config?.errorMessage && (
                  <p className="text-sm mt-2 text-red-700">
                    Error: {config.errorMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Platform Configuration
            </h2>

            <div className="space-y-6">
              {/* Platform URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    WhatsApp Platform URL
                  </div>
                </label>
                <input
                  type="url"
                  value={formData.platformUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, platformUrl: e.target.value })
                  }
                  placeholder="https://whatsapp-platform.example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the URL where your WhatsApp platform is hosted
                </p>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    API Key
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={formData.platformApiKey}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        platformApiKey: e.target.value,
                      })
                    }
                    placeholder="Enter your API key"
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Your API key is securely encrypted and never shared
                </p>
              </div>

              {/* Messages */}
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errorMessage}
                  </p>
                </div>
              )}

              {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {successMessage}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleTestConnection}
                  disabled={isTesting || isSaving}
                  variant="outline"
                  className="border-gray-300"
                >
                  {isTesting ? "Testing..." : "Test Connection"}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || isTesting}
                  className="bg-green-600 hover:bg-green-700 text-white ml-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </div>
          </div>

          {/* Connection Info Card */}
          {isConnected && config && (
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Connection Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {config.phoneNumberId && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number ID</p>
                    <p className="font-semibold text-gray-900">
                      {config.phoneNumberId}
                    </p>
                  </div>
                )}
                {config.businessPhoneNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Business Phone Number
                    </p>
                    <p className="font-semibold text-gray-900">
                      {config.businessPhoneNumber}
                    </p>
                  </div>
                )}
                {config.connectedAt && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Connected Since</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(config.connectedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              Need help setting up?
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Check the WhatsApp platform documentation for detailed setup instructions.
            </p>
            <Button
              onClick={() =>
                window.open("https://github.com/mpiyush15/whatsapp-platform", "_blank")
              }
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              View Documentation
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
