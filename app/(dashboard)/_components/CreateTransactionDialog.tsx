"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transactions";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CategoryPicker from "./CategoryPicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransaction } from "../_actions/transactions";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  trigger: ReactNode | null;
  type: TransactionType;
}

function CreateTransactionDialog({ trigger, type }: Props) {
  const form = useForm<CreateTransactionSchemaType>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type,
      date: new Date(),
    },
  });

  const [open, setOpen] = useState(false);

  const handleCateogryChange = useCallback(
    (value: string) => {
      form.setValue("category", value);
    },
    [form]
  );

  // Calcula automaticamente el installmentAmount basado en el amount y el installmentCount
  useEffect(() => {
    const amount = form.watch("amount");
    const installmentCount = form.watch("installmentCount");

    if (installmentCount > 1 && amount > 0) {
      form.setValue("installmentAmount", amount / installmentCount);
    } else {
      form.setValue("installmentAmount", amount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("amount"), form.watch("installmentCount")]);

  const handleInstallmentAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value);
    form.setValue("installmentAmount", value); // Permitir ajuste manual
  };

  // const handleInstallmentAmountChange = useCallback(
  //   ( e: React.ChangeEvent<HTMLInputElement>) => {
  //     console.log(e)
  //     const amount = form.watch("amount");
  //   const installmentCount = form.watch("installmentCount");
  //   if (installmentCount > 1) {
  //     setInstallmentAmount(amount / installmentCount);
  //   } else {
  //     setInstallmentAmount(amount);
  //   }
  //   },
  //   [form]
  // );

  // El usuario puede cambiar manualmente el installmentAmount
  // const handleInstallmentAmountChange = (
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   console.log(e)
  //   setInstallmentAmount(parseFloat(e.target.value));
  // };

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: CreateTransaction,
    onSuccess: () => {
      toast.success("Transaction created successfully", {
        id: "create-transaction",
      });
      form.reset({
        type,
        description: "",
        amount: 0,
        date: new Date(),
        category: undefined,
        payMethod: "cash",
        installmentCount: 1,
        installmentAmount: 0,
      });

      queryClient.invalidateQueries({
        queryKey: ["overview"],
      });

      setOpen((prev) => !prev);
    },
  });

  const onSubmit = useCallback(
    (values: CreateTransactionSchemaType) => {
      toast.loading("Creando movimiento...", {
        id: "create-transaction",
      });
      mutate({
        ...values,
        date: DateToUTCDate(values.date),
      });
      console.log(values);
    },
    [mutate]
  );

  console.log(form.getValues())

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Crear nuevo
            <span
              className={cn(
                "m-1",
                type === "income" ? "text-emerald-500" : "text-red-500"
              )}
            >
              {type === "income" ? "Ingreso" : "Egreso"}
            </span>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Descripcion</FormLabel>
                  <FormControl>
                    <Input defaultValue={""} {...field} />
                  </FormControl>
                  <FormDescription>
                    Descripcion de la transaccion (opcional)
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Monto</FormLabel>
                  <FormControl>
                    <Input
                      defaultValue={0}
                      type="number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormDescription> Monto total (requerido)</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Categoria</FormLabel>
                  <FormControl {...field}>
                    <CategoryPicker
                      type={type}
                      onChange={(e) => handleCateogryChange(e)}
                    />
                  </FormControl>
                  <FormDescription>
                    Seleccione una categoria para la transaccion (requerido)
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payMethod"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Metodo de Pago</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Metodo de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="credit-card">Tarjeta</SelectItem>
                        <SelectItem value="trasnfer">Trasnferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Seleccione un método de pago para la transacción (requerido)
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="installmentCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Cuotas</FormLabel>
                  <FormControl>
                    <Input
                      defaultValue={1}
                      type="number"
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription> Cantidad de cuotasa</FormDescription>
                </FormItem>
              )}
            />

            {form.watch("installmentCount") > 0 && (
              <FormField
                control={form.control}
                name="installmentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto por Cuota</FormLabel>
                    <FormControl>
                      <Input
                        defaultValue={0}
                        type="number"
                        {...field}
                        onChange={handleInstallmentAmountChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Puede ajustar manualmente el monto por cuota
                    </FormDescription>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[200px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Elija una fecha</span>
                          )}
                          <CalendarIcon className="opacity-50 ml-auto h-4 w-4" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(value) => {
                          if (!value) return;
                          field.onChange(value);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Seleccione una fecha</FormDescription>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <AlertDialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant={"secondary"}
              onClick={() => {
                form.reset();
              }}
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {!isPending && "Crear"}
            {isPending && <Loader2 className="animate-spin" />}
          </Button>
        </AlertDialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTransactionDialog;
