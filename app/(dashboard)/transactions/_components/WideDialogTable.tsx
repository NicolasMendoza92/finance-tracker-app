"use client";
import { GetTransactionHistoryResponseType } from "@/app/api/transactions-history/route";
import React, { useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBulkTransactions } from "../../_actions/transactions";

type TransactionHistoryRow = GetTransactionHistoryResponseType[0];

type DialogProps = {
  transactions: TransactionHistoryRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const WideDialogTable = ({
  transactions,
  open,
  onOpenChange,
}: DialogProps) => {

  const [isPending, startTransition] = useTransition();

  const onSubmit = async () => {
    startTransition(async () => {
      try {
        // TODO: CREAR UNA BULKTRANSACTIONS EN BACKEND
        const data = await createBulkTransactions(transactions);

        if (data?.error) {
          toast.error(data.error);
        }
        if (data?.success) {
          toast.success("upload.success");
        }
      } catch (error) {
        toast.error("upload error");
      } finally {
        onOpenChange(false);
      }
    });
  };

  const sortedTransactions = transactions.sort((a, b) => {
    return a.date > b.date ? -1 : 1;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-[1200px]">
        {isPending ? (
          <div className="h-[80vh]">
            <Loader2 />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Datos a importar</DialogTitle>
              <DialogDescription>Mira los datos que vas a subir</DialogDescription>
            </DialogHeader>
            <ScrollArea className="overflow-x-hidden h-[80vh]">
            <table className="w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Account</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.date.toLocaleDateString()}</td>
                      <td>{transaction.description}</td>
                      <td>{transaction.amount}</td>
                      <td>{transaction.type}</td>
                      <td>{transaction.category}</td>
                      <td>{transaction.account}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
            <DialogFooter className="py-2">
              <Button onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={async () => await onSubmit()}
                disabled={isPending}
              >
                Importar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
