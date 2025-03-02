"use client";

import * as React from "react";
import {  endOfMonth, format, startOfMonth } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Para que el componente DatePickerWithRange actualice tu estado dateRange en el componente Overview,
// necesitas pasar la función setDateRange como prop al componente DatePickerWithRange y luego usarla en su función onSelect.
//  Esto permitirá que DatePickerWithRange actualice el estado dateRange en Overview cuando el usuario seleccione un rango de fechas.

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  setDateRange: (range: { from: Date; to: Date }) => void;
}

export function DatePickerWithRange({
  className,
  setDateRange,
}: DatePickerWithRangeProps) {

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);

    if (newDate?.from && newDate?.to) {
      setDateRange({
        from: newDate.from,
        to: newDate.to,
      });
    }
  };



  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Seleccione fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          side="bottom"
          sideOffset={4}
          avoidCollisions={true}
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          <Calendar
            className="z-50"
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
