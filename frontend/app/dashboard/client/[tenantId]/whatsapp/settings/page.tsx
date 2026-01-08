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
  Users,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"

interface Contact {
  _id: string
  name: string
  phone: string
  whatsappNumber: string
  messageCount: number
  isOptedIn: boolean
  createdAt: string
}

interface WhatsAppConfig {
  _id: string
  tenantId: string
  businessAccountId: string
  phoneNumberId: string
  phoneNumber: string
  apiKey?: string
  isConnected: boolean
  connectedAt?: string
  connectionStatus: "connected" | "disconnected" | "error"
  errorMessage?: string
}

export default function SettingsPage() {
  const params = useParams()
  const tenantId = params.tenantId as string

  const [config, setConfig] = useState<WhatsAppConfig | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [formData, setFormData] = useState({
    businessAccountId: "",
    phoneNumberId: "",
    phoneNumber: "",
    apiKey: "",
  })
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // Fetch contacts list
  const fetchContacts = async () => {
    try {
      setIsLoadingContacts(true)
      console.log(`👥 Fetching contacts for tenant: ${tenantId}`)
      const response = await fetch(`/api/whatsapp/contacts?tenantId=${tenantId}&limit=100`)
      console.log(`Contacts response status: ${response.status}`)
      if (response.ok) {
        const data = await response.json()
        console.log('📥 Contacts data received:', data)
        // Handle both response formats
        const contactsList = data.data?.contacts || data.contacts || []
        console.log(`✅ Found ${contactsList.length} contacts`)
        setContacts(contactsList)
      } else {
        console.warn('⚠️ Failed to fetch contacts:', response.status)
      }
    } catch (error) {
      console.error("❌ Error fetching contacts:", error)
      setContacts([])
    } finally {
      setIsLoadingContacts(false)
    }
  }

  // Fetch config
  const fetchConfig = async () => {
    try {
      setIsLoading(true)
      console.log(`📱 Fetching WhatsApp config for tenant: ${tenantId}`)
      const response = await fetch(`/api/whatsapp/config?tenantId=${tenantId}`)
      console.log(`Response status: ${response.status}`)
      if (response.ok) {
        const data = await response.json()
        console.log('📥 Config data received:', data)
        setConfig(data.config || null)
        if (data.config) {
          console.log('✅ Config found, updating form')
          setFormData({
            businessAccountId: data.config.businessAccountId || "",
            phoneNumberId: data.config.phoneNumberId || "",
            phoneNumber: data.config.phoneNumber || "",
            apiKey: data.config.apiKey || "",
          })
          // Fetch contacts after loading config
          console.log('📞 Fetching contacts...')
          await fetchContacts()
        }
      } else {
        console.warn('⚠️ Failed to fetch config:', response.status)
      }
    } catch (error) {
      console.error("❌ Error fetching config:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [tenantId])

  const handleSave = async () => {
    if (!formData.businessAccountId.trim() || !formData.phoneNumberId.trim() || !formData.phoneNumber.trim()) {
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
        },
        body: JSON.stringify({
          tenantId: tenantId,
          businessAccountId: formData.businessAccountId,
          phoneNumberId: formData.phoneNumberId,
          phoneNumber: formData.phoneNumber,
          apiKey: formData.apiKey || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Show connection status in success message
        if (data.connectionStatus === 'connected') {
          setSuccessMessage("✅ Configuration saved and verified! WhatsApp account is connected.")
        } else if (data.connectionStatus === 'error') {
          setErrorMessage("⚠️ Configuration saved but verification failed: " + (data.config?.errorMessage || "Unknown error"))
        } else {
          setSuccessMessage("Configuration saved successfully")
        }
        
        await fetchConfig()
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
    if (!formData.businessAccountId.trim() || !formData.phoneNumberId.trim()) {
      setErrorMessage("Please fill in all required fields first")
      return
    }

    try {
      setIsTesting(true)
      setErrorMessage("")
      setSuccessMessage("")

      const response = await fetch(`/api/whatsapp/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId: tenantId,
          businessAccountId: formData.businessAccountId,
          phoneNumberId: formData.phoneNumberId,
          phoneNumber: formData.phoneNumber,
        }),
      })

      if (response.ok) {
        setSuccessMessage(
          "Configuration saved and verified! Your WhatsApp account is connected."
        )
      } else {
        const error = await response.json()
        setErrorMessage(
          error.message ||
            "Failed to connect. Please check your account details."
        )
      }
    } catch (error) {
      console.error("Error testing connection:", error)
      setErrorMessage("Failed to connect")
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
                  {isConnected ? "✅ Connected" : "⚠️ Not Connected"}
                </h3>
                {isConnected && config?.phoneNumber && (
                  <p className="text-sm mt-2 text-green-700 font-medium">
                    📱 Phone: <span className="font-mono">{config.phoneNumber}</span>
                  </p>
                )}
                {isConnected && config?.businessAccountId && (
                  <p className="text-sm mt-1 text-green-700 font-medium">
                    💼 Account ID: <span className="font-mono text-xs">{config.businessAccountId}</span>
                  </p>
                )}
                <p className={`text-sm mt-1 ${isConnected ? 'text-green-700' : 'text-yellow-700'}`}>
                  {isConnected
                    ? `Connected since ${new Date(
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
              WhatsApp Account Configuration
            </h2>

            <div className="space-y-6">
              {/* Business Account ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Business Account ID
                  </div>
                </label>
                <input
                  type="text"
                  value={formData.businessAccountId}
                  onChange={(e) =>
                    setFormData({ ...formData, businessAccountId: e.target.value })
                  }
                  placeholder="e.g., 1234567890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your WhatsApp Business Account ID
                </p>
              </div>

              {/* Phone Number ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Phone Number ID
                  </div>
                </label>
                <input
                  type="text"
                  value={formData.phoneNumberId}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumberId: e.target.value })
                  }
                  placeholder="e.g., 9876543210"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your WhatsApp Business Phone Number ID
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Phone Number
                  </div>
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="+1234567890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your WhatsApp Business Phone Number (with country code)
                </p>
              </div>

              {/* Platform API Key - Optional for advanced users */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    WhatsApp Platform API Key
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={formData.apiKey}
                    onChange={(e) =>
                      setFormData({ ...formData, apiKey: e.target.value })
                    }
                    placeholder="Enter your WhatsApp Platform API key (optional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Optional. For verifying with WhatsApp Platform. Leave empty to use Meta WhatsApp Cloud API.
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
                Account Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {config.businessAccountId && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Business Account ID</p>
                    <p className="font-semibold text-gray-900">
                      {config.businessAccountId}
                    </p>
                  </div>
                )}
                {config.phoneNumberId && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number ID</p>
                    <p className="font-semibold text-gray-900">
                      {config.phoneNumberId}
                    </p>
                  </div>
                )}
                {config.phoneNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900">
                      {config.phoneNumber}
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

          {/* Saved Contacts List */}
          {isConnected && (
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Saved Contacts ({contacts.length})
                </h2>
              </div>

              {isLoadingContacts ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading contacts...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Phone className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No contacts saved yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {contacts.map((contact) => (
                    <div
                      key={contact._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-600 font-mono">{contact.whatsappNumber}</p>
                        {contact.messageCount > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            💬 {contact.messageCount} messages
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {contact.isOptedIn ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Opted In
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            Opted Out
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
