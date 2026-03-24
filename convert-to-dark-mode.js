#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/app/student/dashboard/page.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// 1. Convert ProfileTab to accept isDark
content = content.replace(
  'function ProfileTab({ student }: any) {',
  'function ProfileTab({ student, isDark }: any) {'
);

// 2. Convert ProfileTab card styling
content = content.replace(
  '<div className="space-y-6 max-w-2xl">\n      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">\n        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>',
  '<div className="space-y-6 max-w-2xl">\n      <div className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-6 shadow-sm border`}>\n        <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>My Profile</h2>'
);

// 3. Convert ProfileTab avatar section
content = content.replace(
  '<div className="flex items-center gap-6 mb-8">\n          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">\n            {student.name.charAt(0).toUpperCase()}\n          </div>\n          <div>\n            <h3 className="text-2xl font-bold text-gray-900">{student.name}</h3>\n            <p className="text-gray-600">Roll: {student.rollNumber}</p>',
  '<div className="flex items-center gap-6 mb-8">\n          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">\n            {student.name.charAt(0).toUpperCase()}\n          </div>\n          <div>\n            <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{student.name}</h3>\n            <p className={isDark ? "text-gray-400" : "text-gray-600"}>Roll: {student.rollNumber}</p>'
);

// 4. Convert LessonsTab to accept isDark
content = content.replace(
  'function LessonsTab() {',
  'function LessonsTab({ isDark }: any) {'
);

// 5. Convert LessonsTab heading
content = content.replace(
  '<div>\n        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lessons</h2>\n        <p className="text-gray-600">Learn from expert instructors at your own pace</p>\n      </div>',
  '<div>\n        <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-2`}>Lessons</h2>\n        <p className={isDark ? "text-gray-400" : "text-gray-600"}>Learn from expert instructors at your own pace</p>\n      </div>'
);

// 6. Convert lesson card styling
content = content.replace(
  'className="bg-white rounded-lg p-4 border border-gray-200 group-hover:border-blue-600 transition-colors">',
  'className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-4 border group-hover:border-blue-600 transition-colors`}>'
);

// 7. Convert lesson card text
content = content.replace(
  '<h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">',
  `<h3 className={`+'font-bold ${isDark ? "text-white" : "text-gray-900"} mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors`'+'}>`
);

// 8. Convert lesson brief text
content = content.replace(
  '<p className="text-sm text-gray-600 mb-3 line-clamp-2">',
  `<p className={`+'text-sm ${isDark ? "text-gray-400" : "text-gray-600"} mb-3 line-clamp-2`'+'}>`
);

// 9. Convert lesson instructor and button
content = content.replace(
  '<div className="flex items-center justify-between text-xs text-gray-500">\n                  <span>{lesson.instructor}</span>\n                  <button className="text-blue-600 font-semibold hover:text-blue-700">\n                    Start →\n                  </button>\n                </div>',
  `<div className={`+'flex items-center justify-between text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`'+'}>\n                  <span>{lesson.instructor}</span>\n                  <button className="text-blue-600 font-semibold hover:text-blue-700">\n                    Start →\n                  </button>\n                </div>`
);

// 10. Convert TestsTab to accept isDark
content = content.replace(
  'function TestsTab() {',
  'function TestsTab({ isDark }: any) {'
);

// 11. Convert TestsTab styling
content = content.replace(
  '<div className="space-y-6">\n      <h2 className="text-2xl font-bold text-gray-900">Tests</h2>\n      <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">\n        <FileText size={48} className="mx-auto text-gray-400 mb-4" />\n        <p className="text-gray-600">Tests coming soon!</p>\n      </div>\n    </div>',
  '<div className="space-y-6">\n      <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Tests</h2>\n      <div className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-12 text-center shadow-sm border`}>\n        <FileText size={48} className={`mx-auto ${isDark ? "text-gray-600" : "text-gray-400"} mb-4`} />\n        <p className={isDark ? "text-gray-400" : "text-gray-600"}>Tests coming soon!</p>\n      </div>\n    </div>'
);

// 12. Convert ProgressTab to accept isDark
content = content.replace(
  'function ProgressTab({ stats }: any) {',
  'function ProgressTab({ stats, isDark }: any) {'
);

// 13. Convert ProgressTab styling
content = content.replace(
  '<div className="space-y-6">\n      <h2 className="text-2xl font-bold text-gray-900">Progress</h2>\n      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">\n        <ProgressCard label="Attendance" value={`${stats?.attendance || 0}%`} color="bg-blue-600" />\n        <ProgressCard label="Average Marks" value={`${stats?.marks || 0}`} color="bg-green-600" />\n        <ProgressCard label="Lessons Completed" value="12" color="bg-purple-600" />\n      </div>\n    </div>',
  '<div className="space-y-6">\n      <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Progress</h2>\n      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">\n        <ProgressCard label="Attendance" value={`${stats?.attendance || 0}%`} color="bg-blue-600" isDark={isDark} />\n        <ProgressCard label="Average Marks" value={`${stats?.marks || 0}`} color="bg-green-600" isDark={isDark} />\n        <ProgressCard label="Lessons Completed" value="12" color="bg-purple-600" isDark={isDark} />\n      </div>\n    </div>'
);

// 14. Convert StatCard to accept isDark
content = content.replace(
  'function StatCard({ icon, label, value }: any) {',
  'function StatCard({ icon, label, value, isDark }: any) {'
);

// 15. Convert StatCard styling
content = content.replace(
  'return (\n    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">\n      <div className="text-2xl mb-2">{icon}</div>\n      <p className="text-gray-600 text-sm">{label}</p>\n      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>\n    </div>\n  );',
  `return (
    <div className={`'${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-6 shadow-sm border`'}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className={`'text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`'}>{label}</p>
      <p className={`'text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mt-1`'}>{value}</p>
    </div>
  );`,
  'g'
);

// 16. Convert ProfileField to accept isDark
content = content.replace(
  'function ProfileField({ label, value }: any) {',
  'function ProfileField({ label, value, isDark }: any) {'
);

// 17. Convert ProfileField styling
content = content.replace(
  'return (\n    <div>\n      <p className="text-sm text-gray-600 mb-1">{label}</p>\n      <p className="font-semibold text-gray-900">{value}</p>\n    </div>\n  );',
  `return (
    <div>
      <p className={`'text-sm ${isDark ? "text-gray-400" : "text-gray-600"} mb-1`'}>{label}</p>
      <p className={`'font-semibold ${isDark ? "text-white" : "text-gray-900"}`'}>{value}</p>
    </div>
  );`,
  'g'
);

// 18. Update ProfileTab to pass isDark to ProfileField
content = content.replace(
  /<ProfileField label="Email" value={student\.email} \/>/g,
  '<ProfileField label="Email" value={student.email} isDark={isDark} />'
);

content = content.replace(
  /<ProfileField label="Phone" value={student\.phone \|\| "Not provided"} \/>/g,
  '<ProfileField label="Phone" value={student.phone || "Not provided"} isDark={isDark} />'
);

content = content.replace(
  /<ProfileField label="Course" value={student\.course} \/>/g,
  '<ProfileField label="Course" value={student.course} isDark={isDark} />'
);

content = content.replace(
  /<ProfileField label="Batch" value={student\.batch} \/>/g,
  '<ProfileField label="Batch" value={student.batch} isDark={isDark} />'
);

content = content.replace(
  /<ProfileField label="Join Date" value={new Date\(student\.joinDate\)\.toLocaleDateString\(\)} \/>/g,
  '<ProfileField label="Join Date" value={new Date(student.joinDate).toLocaleDateString()} isDark={isDark} />'
);

content = content.replace(
  /<ProfileField label="Status" value={student\.status} \/>/g,
  '<ProfileField label="Status" value={student.status} isDark={isDark} />'
);

// 19. Convert ActivityItem to accept isDark
content = content.replace(
  'function ActivityItem({ title, time, status }: any) {',
  'function ActivityItem({ title, time, status, isDark }: any) {'
);

// 20. Convert ActivityItem styling
content = content.replace(
  'const statusColor = {\n    completed: "bg-green-100 text-green-700",\n    "in-progress": "bg-blue-100 text-blue-700",\n    pending: "bg-yellow-100 text-yellow-700",\n  };\n\n  return (\n    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">\n      <div>\n        <p className="font-medium text-gray-900">{title}</p>\n        <p className="text-sm text-gray-600">{time}</p>\n      </div>',
  `const statusColor = {
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  };

  return (
    <div className={`'flex items-center justify-between p-3 border ${isDark ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"} rounded-lg transition`'}>
      <div>
        <p className={`'font-medium ${isDark ? "text-white" : "text-gray-900"}`'}>{title}</p>
        <p className={`'text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`'}>{time}</p>
      </div>`
);

// 21. Convert ProgressCard to accept isDark
content = content.replace(
  'function ProgressCard({ label, value, color }: any) {',
  'function ProgressCard({ label, value, color, isDark }: any) {'
);

// 22. Convert ProgressCard styling
content = content.replace(
  'return (\n    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">\n      <div className={`${color} w-12 h-12 rounded-lg mb-4`}></div>\n      <p className="text-gray-600 text-sm">{label}</p>\n      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>\n    </div>\n  );\n}\n\n```',
  `return (
    <div className={`'${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-6 shadow-sm border`'}>
      <div className={`'${color} w-12 h-12 rounded-lg mb-4`'}></div>
      <p className={`'text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`'}>{label}</p>
      <p className={`'text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} mt-2`'}>{value}</p>
    </div>
  );
}

\`\`\``
);

fs.writeFileSync(filePath, content);
console.log('✅ Dark mode support added to entire student dashboard!');
console.log('📝 File updated:', filePath);
