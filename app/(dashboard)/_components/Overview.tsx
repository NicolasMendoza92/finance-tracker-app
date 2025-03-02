"use client";

import { UserSettings } from "@prisma/client";
import { useState } from "react";
import StatsCards from "./StatsCards";
import CategoriesStats from "./CategoriesStats";
import GraphStats from "./GraphStats";
import { DatePickerWithRange } from "./DatePickerWithRange";
import { endOfMonth, startOfMonth } from "date-fns";


function Overview({ userSettings }: { userSettings: UserSettings }) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  console.log(dateRange)

  return (
    <>
      <div className="flex flex-wrap justify-start gap-2 p-6">
        <h2 className="text-3xl font-bold"> Dashboard </h2>
        <div className="flex items-center gap-3">
          <DatePickerWithRange className="z-50" setDateRange={setDateRange}/>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2 p-6">
        <StatsCards
          userSettings={userSettings}
          from={dateRange.from}
          to={dateRange.to}
        />

        <CategoriesStats
          userSettings={userSettings}
          from={dateRange.from}
          to={dateRange.to}
        />

        <GraphStats
          userSettings={userSettings}
          from={dateRange.from}
          to={dateRange.to}
        />
      </div>
    </>
  );
}

export default Overview;
