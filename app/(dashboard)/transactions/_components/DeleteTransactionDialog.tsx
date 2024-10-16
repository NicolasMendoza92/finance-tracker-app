"use client"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import { toast } from 'sonner';
import { DeleteTransaction } from '../../_actions/transactions';

interface Props {
    open: boolean,
    setOpen:(open: boolean) => void,
    transactionId: string, 
}
function DeleteTransactionDialog({open, setOpen, transactionId}: Props) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
      mutationFn: DeleteTransaction,
      onSuccess: async () => {
        toast.success("Movimiento eliminado correctamente", {
          id: transactionId,
        });
        await queryClient.invalidateQueries({
          queryKey: ["transaction"],
        });
        await queryClient.refetchQueries({
          queryKey: ["transaction"],
        });
      },
      onError: () => {
        toast.error("Algo salio mal", {
          id: transactionId,
        });
      },
    });
    return (
      <AlertDialog open={open} onOpenChange={setOpen} >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Estas seguro de eliminar el movimiento?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Una vez eliminado no se puede recuperar
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.loading("Eliminando movimiento...", {
                  id: transactionId,
                });
                deleteMutation.mutate(transactionId);
              }}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
}

export default DeleteTransactionDialog