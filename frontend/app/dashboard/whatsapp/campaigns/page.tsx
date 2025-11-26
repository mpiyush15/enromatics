"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";
import useAuth from "@/hooks/useAuth";

interface Contact {
  _id: string;
  name: string;
  whatsappNumber: string;
  type: string;
  metadata?: any;
}

interface Template {
  _id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  content: string;
  variables: string[];
  components: any[];
}

export default function WhatsappCampaignsPage() {
  const { tenantId } = useParams();
  const { user } = useAuth(); // Get user info to check role
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [status, setStatus] = useState("");
  const [configured, setConfigured] = useState(false);

  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Template-related state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateVariables, setTemplateVariables] = useState<{[key: string]: string}>({});
  const [messageType, setMessageType] = useState<"text" | "template">("text");

  // Manual contact form
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    type: "other",
    email: "",
  });

  // CSV import
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    checkConfig();
    fetchContacts();
    fetchTemplates();
  }, []);

  const checkConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/config`, {
        credentials: "include",
      });
      const data = await res.json();
      setConfigured(data.configured);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/contacts`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/templates?status=approved`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
    }
  };

  const syncContacts = async () => {
    setStatus("Syncing contacts from students database...");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/whatsapp/sync-contacts`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        setStatus(`✅ ${data.message}`);
        fetchContacts();
        setTimeout(() => setStatus(""), 3000);
      }
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  const syncTenantContacts = async () => {
    setStatus("Syncing contacts from tenants database...");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/whatsapp/sync-tenant-contacts`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        setStatus(`✅ ${data.message}`);
        fetchContacts();
        setTimeout(() => setStatus(""), 3000);
      }
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      setStatus("❌ Name and phone are required");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newContact),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("✅ Contact added successfully!");
        setNewContact({ name: "", phone: "", type: "other", email: "" });
        setShowAddContact(false);
        fetchContacts();
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus(`❌ ${data.message}`);
      }
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/whatsapp/contacts/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (data.success) {
        setStatus("✅ Contact deleted successfully!");
        fetchContacts();
        setTimeout(() => setStatus(""), 3000);
      }
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      setStatus("❌ Please select a CSV file");
      return;
    }

    setImporting(true);
    setStatus("Processing CSV file...");

    try {
      const text = await csvFile.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        setStatus("❌ CSV file is empty or invalid");
        setImporting(false);
        return;
      }

      // Parse CSV (assuming header: name,phone,type,email)
      const contacts = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values[0] && values[1]) {
          contacts.push({
            name: values[0],
            phone: values[1],
            type: values[2] || "other",
            email: values[3] || "",
          });
        }
      }

      if (contacts.length === 0) {
        setStatus("❌ No valid contacts found in CSV");
        setImporting(false);
        return;
      }

      // Send to backend
      const res = await fetch(
        `${API_BASE_URL}/api/whatsapp/contacts/import`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ contacts }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setStatus(`✅ ${data.message}`);
        setCsvFile(null);
        setShowImportCSV(false);
        fetchContacts();
        setTimeout(() => setStatus(""), 5000);
      } else {
        setStatus(`❌ ${data.message}`);
      }
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const downloadCSVTemplate = () => {
    const template = "name,phone,type,email\nJohn Doe,919876543210,student,john@example.com\nJane Parent,919876543211,parent,jane@example.com";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map((c) => c.whatsappNumber));
    }
  };

  const toggleContact = (phone: string) => {
    if (selectedContacts.includes(phone)) {
      setSelectedContacts(selectedContacts.filter((p) => p !== phone));
    } else {
      setSelectedContacts([...selectedContacts, phone]);
    }
  };

  const handleSendBulk = async () => {
    if (selectedContacts.length === 0) {
      setStatus("❌ Please select at least one contact");
      return;
    }

    if (messageType === "text" && !message.trim()) {
      setStatus("❌ Please enter a message");
      return;
    }

    if (messageType === "template" && !selectedTemplate) {
      setStatus("❌ Please select a template");
      return;
    }

    // Validate template variables
    if (messageType === "template" && selectedTemplate) {
      const missingVars = selectedTemplate.variables.filter(v => !templateVariables[v]?.trim());
      if (missingVars.length > 0) {
        setStatus(`❌ Please fill all template variables: ${missingVars.join(', ')}`);
        return;
      }
    }

    setSending(true);
    setStatus(`Sending to ${selectedContacts.length} contacts...`);

    let success = 0;
    let failed = 0;

    for (const phone of selectedContacts) {
      try {
        let res;
        
        if (messageType === "text") {
          // Send text message
          res = await fetch(`${API_BASE_URL}/api/whatsapp/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              recipientPhone: phone,
              message,
              campaign: "bulk_campaign",
            }),
          });
        } else {
          // Send template message
          const params = selectedTemplate!.variables.map(v => templateVariables[v]);
          res = await fetch(`${API_BASE_URL}/api/whatsapp/send-template`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              recipientPhone: phone,
              templateName: selectedTemplate!.name,
              params,
              campaign: "bulk_campaign",
            }),
          });
        }

        if (res.ok) {
          success++;
        } else {
          failed++;
        }
      } catch (err) {
        failed++;
      }
    }

    setSending(false);
    setStatus(
      `✅ Campaign complete! Sent: ${success}, Failed: ${failed}`
    );
    setMessage("");
    setSelectedContacts([]);
    setSelectedTemplate(null);
    setTemplateVariables({});
    setTimeout(() => setStatus(""), 5000);
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.whatsappNumber.includes(searchTerm)
  );

  if (!configured) {
    return (
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">WhatsApp Not Configured</h2>
            <p className="text-gray-600 mb-6">
              Please configure your WhatsApp Business Account first.
            </p>
            <a
              href={`/dashboard/client/${tenantId}/whatsapp/settings`}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
            >
              Go to Settings
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-8 text-white">
          <h1 className="text-2xl font-semibold mb-2">📨 WhatsApp Campaigns</h1>
          <p className="text-blue-100">Send bulk messages to students & parents</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contacts List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  Select Recipients ({selectedContacts.length} selected)
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddContact(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    ➕ Add Contact
                  </button>
                  <button
                    onClick={() => setShowImportCSV(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    📄 Import CSV
                  </button>
                  {/* Show sync buttons based on user role */}
                  {user?.role === "SuperAdmin" ? (
                    <button
                      onClick={syncTenantContacts}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      🔄 Sync Tenants
                    </button>
                  ) : (
                    <button
                      onClick={syncContacts}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      🔄 Sync Students
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                />

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto"></div>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-semibold mb-2">No Contacts Found</h3>
                    <p className="text-gray-600 mb-4">
                      {user?.role === "SuperAdmin" 
                        ? "Click \"Sync Tenants\" to import all tenant contacts, or add contacts manually"
                        : "Click \"Sync Students\" to import from student database or add contacts manually"
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <input
                        type="checkbox"
                        checked={
                          selectedContacts.length === filteredContacts.length
                        }
                        onChange={handleSelectAll}
                        className="w-5 h-5"
                      />
                      <label className="font-semibold">Select All</label>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {filteredContacts.map((contact) => (
                        <div
                          key={contact._id}
                          className="flex items-center gap-3 p-3 border-2 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => toggleContact(contact.whatsappNumber)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(
                              contact.whatsappNumber
                            )}
                            onChange={() => toggleContact(contact.whatsappNumber)}
                            className="w-5 h-5"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <div className="font-semibold">{contact.name}</div>
                            <div className="text-sm text-gray-600">
                              {contact.whatsappNumber}
                              {contact.metadata?.class && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {contact.metadata.class}
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              contact.type === "student"
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {contact.type}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContact(contact._id);
                            }}
                            className="text-red-600 hover:text-red-800 font-bold text-lg"
                            title="Delete contact"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Message Composer */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 sticky top-4">
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b">
                <h2 className="text-xl font-bold">Compose Message</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Message Type Toggle */}
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <button
                    onClick={() => setMessageType("text")}
                    className={`flex-1 px-4 py-2 rounded-md font-semibold transition ${
                      messageType === "text"
                        ? "bg-white dark:bg-gray-600 shadow"
                        : "hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    📝 Text
                  </button>
                  <button
                    onClick={() => setMessageType("template")}
                    className={`flex-1 px-4 py-2 rounded-md font-semibold transition ${
                      messageType === "template"
                        ? "bg-white dark:bg-gray-600 shadow"
                        : "hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    📋 Template
                  </button>
                </div>

                {messageType === "text" ? (
                  // Text Message Input
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        rows={8}
                        maxLength={1000}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {message.length}/1000 characters
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-3 text-xs">
                      <strong>⚠️ Note:</strong> Free-form text messages may not work without Meta approval. Use templates for reliable delivery.
                    </div>
                  </>
                ) : (
                  // Template Selection
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Select Template
                      </label>
                      {templates.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                          <div className="text-4xl mb-2">📋</div>
                          <p className="text-sm text-gray-600 mb-3">
                            No templates found. Fetch templates from Meta first.
                          </p>
                          <a
                            href={`/dashboard/client/${tenantId}/whatsapp/settings`}
                            className="text-blue-600 hover:underline text-sm font-semibold"
                          >
                            Go to Settings →
                          </a>
                        </div>
                      ) : (
                        <select
                          value={selectedTemplate?._id || ""}
                          onChange={(e) => {
                            const template = templates.find(t => t._id === e.target.value);
                            setSelectedTemplate(template || null);
                            setTemplateVariables({});
                          }}
                          className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        >
                          <option value="">-- Choose a template --</option>
                          {templates.map((template) => (
                            <option key={template._id} value={template._id}>
                              {template.name} ({template.status})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {selectedTemplate && (
                      <>
                        {/* Template Preview */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border-2">
                          <div className="text-xs font-semibold text-gray-500 mb-2">
                            PREVIEW:
                          </div>
                          <div className="text-sm whitespace-pre-wrap">
                            {selectedTemplate.content}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Category: {selectedTemplate.category} | Language: {selectedTemplate.language}
                          </div>
                        </div>

                        {/* Variable Inputs */}
                        {selectedTemplate.variables.length > 0 && (
                          <div className="space-y-3">
                            <div className="text-sm font-semibold">
                              Fill Template Variables:
                            </div>
                            {selectedTemplate.variables.map((variable, idx) => (
                              <div key={variable}>
                                <label className="block text-xs font-semibold mb-1 text-gray-600">
                                  Variable {variable} (e.g., {variable === "1" ? "Student Name" : variable === "2" ? "Amount/Date" : "Value"})
                                </label>
                                <input
                                  type="text"
                                  value={templateVariables[variable] || ""}
                                  onChange={(e) =>
                                    setTemplateVariables({
                                      ...templateVariables,
                                      [variable]: e.target.value,
                                    })
                                  }
                                  placeholder={`Enter value for {{${variable}}}`}
                                  className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-sm"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                <button
                  onClick={handleSendBulk}
                  disabled={
                    sending ||
                    selectedContacts.length === 0 ||
                    (messageType === "text" && !message.trim()) ||
                    (messageType === "template" && !selectedTemplate)
                  }
                  className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending
                    ? "Sending..."
                    : `Send to ${selectedContacts.length} Contact${
                        selectedContacts.length !== 1 ? "s" : ""
                      }`}
                </button>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 text-sm">
                  <p className="font-semibold mb-2">💡 Quick Tips:</p>
                  <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                    <li>• Use approved templates for guaranteed delivery</li>
                    <li>• Fill all template variables correctly</li>
                    <li>• Test with your own number first</li>
                    <li>• Send during business hours (9 AM - 9 PM)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div
            className={`p-4 rounded-xl font-semibold text-center ${
              status.includes("✅")
                ? "bg-green-100 text-green-800 border-2 border-green-200"
                : status.includes("❌")
                ? "bg-red-100 text-red-800 border-2 border-red-200"
                : "bg-blue-100 text-blue-800 border-2 border-blue-200"
            }`}
          >
            {status}
          </div>
        )}

        {/* Add Contact Modal */}
        {showAddContact && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">➕ Add New Contact</h3>
                <button
                  onClick={() => setShowAddContact(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✖️
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) =>
                      setNewContact({ ...newContact, name: e.target.value })
                    }
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Phone Number * (with country code)
                  </label>
                  <input
                    type="text"
                    value={newContact.phone}
                    onChange={(e) =>
                      setNewContact({ ...newContact, phone: e.target.value })
                    }
                    placeholder="919876543210"
                    className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: 919876543210 (no + or spaces)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Type
                  </label>
                  <select
                    value={newContact.type}
                    onChange={(e) =>
                      setNewContact({ ...newContact, type: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  >
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                    <option value="guardian">Guardian</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) =>
                      setNewContact({ ...newContact, email: e.target.value })
                    }
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddContact(false)}
                    className="flex-1 px-4 py-3 border-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddContact}
                    disabled={!newContact.name || !newContact.phone}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Import CSV Modal */}
        {showImportCSV && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">📄 Import Contacts from CSV</h3>
                <button
                  onClick={() => {
                    setShowImportCSV(false);
                    setCsvFile(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✖️
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                  <p className="font-semibold mb-2">📋 CSV Format:</p>
                  <code className="text-xs block bg-white dark:bg-gray-900 p-2 rounded">
                    name,phone,type,email<br />
                    John Doe,919876543210,student,john@example.com
                  </code>
                  <button
                    onClick={downloadCSVTemplate}
                    className="mt-3 text-sm text-blue-600 hover:underline font-semibold"
                  >
                    📥 Download Template CSV
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Select CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  {csvFile && (
                    <p className="text-sm text-green-600 mt-2">
                      ✅ {csvFile.name} selected
                    </p>
                  )}
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-3 text-sm">
                  <p className="font-semibold">⚠️ Important:</p>
                  <ul className="text-xs mt-1 space-y-1">
                    <li>• Phone numbers must include country code (e.g., 91)</li>
                    <li>• Duplicates will be skipped automatically</li>
                    <li>• Invalid entries will be reported</li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowImportCSV(false);
                      setCsvFile(null);
                    }}
                    className="flex-1 px-4 py-3 border-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCSVUpload}
                    disabled={!csvFile || importing}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? "Importing..." : "Import CSV"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
