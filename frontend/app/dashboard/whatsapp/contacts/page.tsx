"use client";

export default function WhatsappContactsPage() {
  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <div className="text-center">
            <div className="text-5xl md:text-6xl mb-4">👥</div>
            <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-900 dark:text-white">
              WhatsApp Contacts
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6">
              Manage your WhatsApp contact lists and segments.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 md:p-6 text-sm md:text-base text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-2">💡 Tip:</p>
              <p>Go to the <strong>Campaigns</strong> page to manage contacts and send messages.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
