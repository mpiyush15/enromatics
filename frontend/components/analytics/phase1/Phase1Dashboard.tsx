"use client";

import BounceRateCard from "./BounceRateCard";
import SessionDurationCard from "./SessionDurationCard";
import UserTypesCard from "./UserTypesCard";
import TimeOnPageTable from "./TimeOnPageTable";
import EntryExitPages from "./EntryExitPages";

export default function Phase1Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics - Phase 1</h1>
        <p className="text-gray-600 mt-1">Engagement metrics & user behavior analysis</p>
      </div>

      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BounceRateCard />
        <SessionDurationCard />
        <UserTypesCard />
      </div>

      {/* Time on Page */}
      <TimeOnPageTable />

      {/* Entry/Exit Pages */}
      <EntryExitPages />
    </div>
  );
}
