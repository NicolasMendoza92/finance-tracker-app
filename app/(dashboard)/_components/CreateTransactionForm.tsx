"use client";

import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transactions";
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
import { CreateTransaction } from "../_actions/transactions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DateToUTCDate } from "@/lib/helpers";

interface Props {
  type: TransactionType;
}

function CreateTransactionForm({ type }: Props) {
  const router = useRouter();

  const form = useForm<CreateTransactionSchemaType>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type,
      date: new Date(),
    },
  });

  const handleCancel = useCallback(() => {
    form.reset(); // Resetea el formulario
    router.back(); // Vuelve a la página anterior
  }, [form, router]);

  const handleCateogryChange = useCallback(
    (value: string) => {
      form.setValue("category", value);
    },
    [form]
  );

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
      });

      queryClient.invalidateQueries({
        queryKey: ["overview"],
      });
      router.push("/"); // Ajusta la ruta según tu aplicación
    },
    onError: () => {
      toast.error("Failed to create transaction");
    },
  });

  const onSubmit = useCallback(
    (values: CreateTransactionSchemaType) => {
      toast.loading("Creando movimiento...", {
        id: "create-transaction",
      });
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
          <h2 className="text-2xl font-bold">
            Crear nuevo
            <span
              className={cn(
                "m-1",
                type === "income" ? "text-emerald-500" : "text-red-500"
              )}
            >
              {type === "income" ? "Ingreso" : "Egreso"}
            </span>
          </h2>

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
                      <CategoryPicker
                        type={type}
                        onChange={handleCateogryChange}
                      />
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
            </form>
          </Form>
          <div className="mt-2 gap-2">
            <Button type="button" variant={"secondary"} onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              className="mb-2"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isPending}
            >
              {!isPending && "Crear"}
              {isPending && <Loader2 className="animate-spin" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateTransactionForm;
