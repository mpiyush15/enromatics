"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Download,
  Search,
  Mail,
  Phone as PhoneIcon,
  Calendar,
  MoreVertical,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"

interface Contact {
  _id: string
  contactId: string
  phone: string
  name?: string
  email?: string
  tags?: string[]
  notes?: string
  createdAt: string
  conversationCount?: number
  lastMessageAt?: string
}

export default function ContactsPage() {
  const params = useParams()
  const tenantId = params.tenantId as string

  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    email: "",
    tags: [] as string[],
    notes: "",
  })

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/whatsapp/contacts?accountId=${tenantId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts || [])
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [tenantId])

  const handleCreateOrUpdate = async () => {
    if (!formData.phone.trim()) return

    try {
      const url = editingContact
        ? `/api/whatsapp/contacts/${editingContact._id}`
        : `/api/whatsapp/contacts`

      const method = editingContact ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
        },
        body: JSON.stringify({
          accountId: tenantId,
          phone: formData.phone,
          name: formData.name,
          email: formData.email,
          tags: formData.tags,
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        setFormData({ phone: "", name: "", email: "", tags: [], notes: "" })
        setEditingContact(null)
        setShowNewDialog(false)
        fetchContacts()
      }
    } catch (error) {
      console.error("Error creating/updating contact:", error)
    }
  }

  const handleDelete = async (contactId: string) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return

    try {
      const response = await fetch(
        `/api/whatsapp/contacts/${contactId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
          },
        }
      )

      if (response.ok) {
        fetchContacts()
      }
    } catch (error) {
      console.error("Error deleting contact:", error)
    }
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      phone: contact.phone,
      name: contact.name || "",
      email: contact.email || "",
      tags: contact.tags || [],
      notes: contact.notes || "",
    })
    setShowNewDialog(true)
  }

  const handleCloseDialog = () => {
    setShowNewDialog(false)
    setEditingContact(null)
    setFormData({ phone: "", name: "", email: "", tags: [], notes: "" })
  }

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formDataFile = new FormData()
    formDataFile.append("file", file)

    try {
      const response = await fetch(
        `/api/whatsapp/contacts/bulk-import?accountId=${tenantId}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
          },
          body: formDataFile,
        }
      )

      if (response.ok) {
        fetchContacts()
        alert("Contacts imported successfully")
      } else {
        alert("Failed to import contacts")
      }
    } catch (error) {
      console.error("Error importing contacts:", error)
      alert("Error importing contacts")
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/whatsapp/contacts/export?accountId=${tenantId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "contacts.csv"
        a.click()
      }
    } catch (error) {
      console.error("Error exporting contacts:", error)
    }
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your customer contact list
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              className="border-gray-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <label>
              <input
                type="file"
                accept=".csv"
                onChange={handleBulkImport}
                className="hidden"
              />
              <Button
                onClick={(e) =>
                  (e.currentTarget.parentElement?.querySelector(
                    "input"
                  ) as HTMLInputElement)?.click()
                }
                variant="outline"
                className="border-gray-300"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </label>
            <Button
              onClick={() => setShowNewDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Contact
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin">
              <PhoneIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-12 text-center">
            <PhoneIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No contacts yet
            </h3>
            <p className="text-gray-600 mb-4">
              Add your first contact or import from a CSV file
            </p>
            <Button
              onClick={() => setShowNewDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Added
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {contact.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4 text-gray-400" />
                          {contact.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {contact.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {contact.email}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {contact.tags && contact.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {formatDate(contact.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(contact)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition"
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact._id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingContact ? "Edit Contact" : "Add New Contact"}
              </h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+1234567890"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Contact name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contact@example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="e.g., vip, customer, lead (comma-separated)"
                  defaultValue={formData.tags.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Add any notes about this contact..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                Cancel
              </button>
              <Button
                onClick={handleCreateOrUpdate}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {editingContact ? "Update" : "Add"} Contact
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
