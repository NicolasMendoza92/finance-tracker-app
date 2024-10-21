"use client";
import React, { useState } from "react";
import TransactionTable from "./_components/TransactionTable";
import { DatePickerWithRange } from "../_components/DatePickerWithRange";
import { startOfMonth } from "date-fns";

function TransactionPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-start gap-2 p-6 border-b bg-card">
        <h2 className="text-3xl font-bold">Historial de Movimientos </h2>
        <div className="flex items-center gap-3">
          <DatePickerWithRange className="z-50" setDateRange={setDateRange} />
        </div>
      </div>
      <div className="p-8">
        <TransactionTable from={dateRange.from} to={dateRange.to} />
      </div>
    </>
  );
}

export default TransactionPage;
