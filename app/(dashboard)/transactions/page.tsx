"use client";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { differenceInDays, startOfMonth } from "date-fns";
import React, { useState } from "react";
import { toast } from "sonner";
import TransactionTable from "./_components/TransactionTable";

function TransactionPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  return (
    <>
     <div className="flex flex-wrap items-center justify-between gap-2 p-6 border-b bg-card">
      <h2 className="text-3xl font-bold">Historial de Movimientos </h2>
      <div className="flex items-center gap-3">
        <DateRangePicker
          initialDateFrom={dateRange.from}
          initialDateTo={dateRange.to}
          showCompare={false}
          onUpdate={(values) => {
            const { from, to } = values.range;
            if (!from || !to) return;
            if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
              toast.error(
                `El rango de seleccion es muy grande. Máximo: ${MAX_DATE_RANGE_DAYS} días`
              );
              return;
            }
            // si selecciona bien, seteo los dias
            setDateRange({ from, to });
          }}
        />
      </div>
    </div>
    <div className="p-8">
        <TransactionTable from={dateRange.from} to={dateRange.to}/>
    </div>
    </>
   
  );
}

export default TransactionPage;
