"use client";

import { cn } from "@/lib/utils";

import { useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EditTransaction } from "../_actions/transactions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DateToUTCDate } from "@/lib/helpers";
import { TransactionType } from "@/lib/types";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transactions";

type TransactionData = {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  account: string;
  date: Date;
};

type Props = {
  transactionData: TransactionData;
};

function EditTransactionForm({ transactionData }: Props) {
  const router = useRouter();

  const form = useForm<CreateTransactionSchemaType>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type: transactionData?.type || "expense",
      description: transactionData?.description || "",
      amount: transactionData?.amount || 0,
      category: transactionData?.category || "",
      account: transactionData?.account || "",
      date: transactionData?.date || new Date(),
    },
  });

  const handleCancel = useCallback(() => {
    form.reset();
    router.back();
  }, [form, router]);

  const handleCateogryChange = useCallback(
    (value: string) => {
      form.setValue("category", value);
    },
    [form]
  );

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateTransactionSchemaType) => {
      return EditTransaction(data, transactionData?.id);
    },
    onSuccess: () => {
      toast.success("Transaction edited successfully", {
        id: "edit-transaction",
      });
      form.reset({
        type: transactionData.type,
        description: "",
        amount: 0,
        date: new Date(),
        category: undefined,
        account: undefined,
      });

      queryClient.invalidateQueries({
        queryKey: ["overview"],
      });
      form.reset();
      router.back();
    },
    onError: () => {
      toast.error("Failed to edit transaction");
    },
  });

  const onSubmit = useCallback(
    (values: CreateTransactionSchemaType) => {
      toast.loading("Editando movimiento...", {
        id: "edit-transaction",
      });
      const result = CreateTransactionSchema.safeParse(values);
      if (!result.success) {
        toast.error("Validation failed. Please check the form.");
        return;
      }
      const adjustedDate = DateToUTCDate(values.date);

      mutate({
        ...values,
        date: adjustedDate,
      });
    },
    [mutate]
  );

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-background p-4 sm:p-8">
        <div className="w-full sm:max-w-lg bg-card p-6 rounded-lg shadow-md overflow-y-auto sm:h-auto">
          <h2 className="text-2xl font-bold">Editar</h2>
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(onSubmit)(e);
              }}
            >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("category", "");
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={cn(
                            "w-[100px]",
                            field.value === "income"
                              ? "text-emerald-500"
                              : "text-red-500"
                          )}
                        >
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Ingreso</SelectItem>
                        <SelectItem value="expense">Egreso</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
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
                      <PopoverContent
                        align="start"
                        className="w-auto p-0 z-[9999]"
                        side="bottom"
                        sideOffset={4}
                        avoidCollisions={true}
                        style={{ maxHeight: "400px", overflowY: "auto" }}
                      >
                        <Calendar
                          className="z-50"
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
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> Monto</FormLabel>
                    <FormControl>
                      <Input defaultValue={0} type="number" {...field} />
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
                    <FormControl>
                    <CategoryPicker type={form.watch("type")} onChange={handleCateogryChange} />
                    </FormControl>
                    <FormDescription>
                      {field.name}
                      Seleccione una categoria para la transaccion (requerido)
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selccione un responsable del gasto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Dante">Dante</SelectItem>
                        <SelectItem value="Jorge">Jorge</SelectItem>
                        <SelectItem value="Juanito">Juanito</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {field.name}
                      Seleccione responsable para la transaccion
                    </FormDescription>
                  </FormItem>
                )}
              />
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
                      {" "}
                      Descripcion de la transaccion (opcional)
                    </FormDescription>
                  </FormItem>
                )}
              />
              <Button type="submit" className="mb-2" disabled={isPending}>
                {!isPending && "Editar"}
                {isPending && <Loader2 className="animate-spin" />}
              </Button>
            </form>
          </Form>
          <div className="mt-2 gap-2">
            <Button type="button" variant={"secondary"} onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditTransactionForm;
