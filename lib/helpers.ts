import { Currencies } from "./currencies";
import * as XLSX from "xlsx";
import { TransactionType } from "./types";

export function DateToUTCDate(date: Date) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );
}

export function GetFormatterForCurrency(currency: string) {
  const locale = Currencies.find((c) => c.value === currency)?.locale;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
}

// Tipo TransactionWithRelations
type TransactionWithRelations = {
  data: {
    formattedAmount: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    amount: number;
    description: string;
    date: Date;
    userId: string;
    type: string;
    category: string;
    categoryIcon: string;
    account: string | null;
  }[];
};

const mapToTransactionWithRelations = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: Record<string, any>
): TransactionWithRelations["data"][0] => {
  // Helper function to safely parse dates
  const parseDate = (dateString: string | number) => {
    if (!dateString) return new Date();

    // If it's an Excel serial number
    if (typeof dateString === "number") {
      return XLSX.SSF.parse_date_code(dateString);
    }

    // Try parsing the string date
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseNumber = (value: any): number => {
    if (typeof value === "number") return value;
    if (!value) return 0;
    const parsed = Number(value.replace(/[^0-9.-]+/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  };

  return {
    formattedAmount:
      typeof item.amount === "number"
        ? item.amount.toLocaleString("es-ES", {
            style: "currency",
            currency: "ARS",
          })
        : item["Formatted Amount"] || "0",
    id: item.id || item["ID"] || crypto.randomUUID(),
    createdAt: parseDate(item["Created At"] || item.createdAt || new Date()),
    updatedAt: parseDate(item["Updated At"] || item.updatedAt || new Date()),
    amount: parseNumber(item["Amount"] || item.amount),
    description: item["Description"] || item.description || "",
    date: parseDate(item["Date"] || item.date || new Date()),
    userId: item["User ID"] || item.userId || "",
    type: item["Type"] || item.type || "expense",
    category: item["Category"] || item.category || "others",
    categoryIcon: item["Category Icon"] || item.categoryIcon || "📦",
    account: item["Account"] || item.account || null,
  };
};

export const handleImportXlsx = (
  e: React.ChangeEvent<HTMLInputElement>
): Promise<TransactionWithRelations["data"]> => {
  return new Promise((resolve, reject) => {
    const file = e.target.files?.[0];
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<
          string,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          any
        >[];

        const transactions = jsonData.map(mapToTransactionWithRelations);
        resolve(transactions);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any

export function isTransactionType(value: string): value is TransactionType {
  return value === "income" || value === "expense";
}