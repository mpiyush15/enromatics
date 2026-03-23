#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/app/student/dashboard/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update ProfileTab signature
content = content.replace(
  'function ProfileTab({ student }: any) {',
  'function ProfileTab({ student, isDark }: any) {'
);

// Update ProfileTab main card
content = content.replace(
  `<div className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>`,
  `<div className="space-y-6 max-w-2xl">
      <div className={\`\${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-6 shadow-sm border\`}>
        <h2 className={\`text-2xl font-bold \${isDark ? "text-white" : "text-gray-900"} mb-6\`}>My Profile</h2>`
);

// Update Profile avatar and name section
content = content.replace(
  `<div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{student.name}</h3>
            <p className="text-gray-600">Roll: {student.rollNumber}</p>`,
  `<div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className={\`text-2xl font-bold \${isDark ? "text-white" : "text-gray-900"}\`}>{student.name}</h3>
            <p className={\`\${isDark ? "text-gray-400" : "text-gray-600"}\`}>Roll: {student.rollNumber}</p>`
);

// Update ProfileField calls to pass isDark
content = content.replace(/<ProfileField label="([^"]+)" value={([^}]+)} \/>/g, '<ProfileField label="$1" value={$2} isDark={isDark} />');

// Update ProfileField function
content = content.replace(
  'function ProfileField({ label, value }: any) {',
  'function ProfileField({ label, value, isDark }: any) {'
);

content = content.replace(
  `  return (
    <div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}`,
  `  return (
    <div>
      <p className={\`text-sm \${isDark ? "text-gray-400" : "text-gray-600"} mb-1\`}>{label}</p>
      <p className={\`font-semibold \${isDark ? "text-white" : "text-gray-900"}\`}>{value}</p>
    </div>
  );
}`
);

// Update LessonsTab signature
content = content.replace(
  'function LessonsTab() {',
  'function LessonsTab({ isDark }: any) {'
);

// Update LessonsTab headings
content = content.replace(
  `<div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lessons</h2>
        <p className="text-gray-600">Learn from expert instructors at your own pace</p>
      </div>`,
  `<div>
        <h2 className={\`text-2xl font-bold \${isDark ? "text-white" : "text-gray-900"} mb-2\`}>Lessons</h2>
        <p className={\`\${isDark ? "text-gray-400" : "text-gray-600"}\`}>Learn from expert instructors at your own pace</p>
      </div>`
);

// Update lesson card
content = content.replace(
  `<div className="bg-white rounded-lg p-4 border border-gray-200 group-hover:border-blue-600 transition-colors">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {lesson.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {lesson.brief}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{lesson.instructor}</span>`,
  `<div className={\`\${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-4 border group-hover:border-blue-600 transition-colors\`}>
                <h3 className={\`font-bold \${isDark ? "text-white" : "text-gray-900"} mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors\`}>
                  {lesson.title}
                </h3>
                <p className={\`text-sm \${isDark ? "text-gray-400" : "text-gray-600"} mb-3 line-clamp-2\`}>
                  {lesson.brief}
                </p>
                <div className={\`flex items-center justify-between text-xs \${isDark ? "text-gray-400" : "text-gray-500"}\`}>
                  <span>{lesson.instructor}</span>`
);

// Update TestsTab signature
content = content.replace(
  'function TestsTab() {',
  'function TestsTab({ isDark }: any) {'
);

// Update TestsTab styling
content = content.replace(
  `<div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Tests</h2>
      <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Tests coming soon!</p>
      </div>
    </div>`,
  `<div className="space-y-6">
      <h2 className={\`text-2xl font-bold \${isDark ? "text-white" : "text-gray-900"}\`}>Tests</h2>
      <div className={\`\${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-12 text-center shadow-sm border\`}>
        <FileText size={48} className={\`mx-auto \${isDark ? "text-gray-600" : "text-gray-400"} mb-4\`} />
        <p className={\`\${isDark ? "text-gray-400" : "text-gray-600"}\`}>Tests coming soon!</p>
      </div>
    </div>`
);

// Update ProgressTab signature
content = content.replace(
  'function ProgressTab({ stats }: any) {',
  'function ProgressTab({ stats, isDark }: any) {'
);

// Update ProgressTab styling
content = content.replace(
  `<div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProgressCard label="Attendance" value={\`\${stats?.attendance || 0}%\`} color="bg-blue-600" />
        <ProgressCard label="Average Marks" value={\`\${stats?.marks || 0}\`} color="bg-green-600" />
        <ProgressCard label="Lessons Completed" value="12" color="bg-purple-600" />
      </div>
    </div>`,
  `<div className="space-y-6">
      <h2 className={\`text-2xl font-bold \${isDark ? "text-white" : "text-gray-900"}\`}>Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProgressCard label="Attendance" value={\`\${stats?.attendance || 0}%\`} color="bg-blue-600" isDark={isDark} />
        <ProgressCard label="Average Marks" value={\`\${stats?.marks || 0}\`} color="bg-green-600" isDark={isDark} />
        <ProgressCard label="Lessons Completed" value="12" color="bg-purple-600" isDark={isDark} />
      </div>
    </div>`
);

// Update StatCard signature
content = content.replace(
  'function StatCard({ icon, label, value }: any) {',
  'function StatCard({ icon, label, value, isDark }: any) {'
);

// Update StatCard styling
content = content.replace(
  `  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function ProfileField({ label, value, isDark }: any) {`,
  `  return (
    <div className={\`\${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-6 shadow-sm border\`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className={\`text-sm \${isDark ? "text-gray-400" : "text-gray-600"}\`}>{label}</p>
      <p className={\`text-2xl font-bold \${isDark ? "text-white" : "text-gray-900"} mt-1\`}>{value}</p>
    </div>
  );
}

function ProfileField({ label, value, isDark }: any) {`
);

// Update ActivityItem signature
content = content.replace(
  'function ActivityItem({ title, time, status }: any) {',
  'function ActivityItem({ title, time, status, isDark }: any) {'
);

// Update ActivityItem styling
content = content.replace(
  `  const statusColor = {
    completed: "bg-green-100 text-green-700",
    "in-progress": "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{time}</p>
      </div>`,
  `  const statusColor = {
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  };

  return (
    <div className={\`flex items-center justify-between p-3 border \${isDark ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"} rounded-lg transition\`}>
      <div>
        <p className={\`font-medium \${isDark ? "text-white" : "text-gray-900"}\`}>{title}</p>
        <p className={\`text-sm \${isDark ? "text-gray-400" : "text-gray-600"}\`}>{time}</p>
      </div>`
);

// Update ProgressCard signature
content = content.replace(
  'function ProgressCard({ label, value, color }: any) {',
  'function ProgressCard({ label, value, color, isDark }: any) {'
);

// Update ProgressCard styling
content = content.replace(
  `  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className={\`\${color} w-12 h-12 rounded-lg mb-4\`}></div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}`,
  `  return (
    <div className={\`\${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-6 shadow-sm border\`}>
      <div className={\`\${color} w-12 h-12 rounded-lg mb-4\`}></div>
      <p className={\`text-sm \${isDark ? "text-gray-400" : "text-gray-600"}\`}>{label}</p>
      <p className={\`text-3xl font-bold \${isDark ? "text-white" : "text-gray-900"} mt-2\`}>{value}</p>
    </div>
  );
}`
);

fs.writeFileSync(filePath, content);
console.log('✅ Dark mode support added to all components!');
console.log('📝 Updated:', filePath);
