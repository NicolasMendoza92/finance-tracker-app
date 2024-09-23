import { z } from "zod";


export const CreateTransactionSchema = z.object({
  amount: z.coerce.number().positive().multipleOf(0.01),
  description: z.string().optional(),
  date: z.coerce.date(),
  category: z.string(),
  payMethod: z.string().optional(),
  type: z.union([z.literal("income"), z.literal("expense")]),
  installmentCount: z.number().min(1, "El número de cuotas debe ser al menos 1"),
  installmentNumber: z.number().optional(),
  installmentAmount: z.number().min(0, "El monto por cuota debe ser mayor o igual a 0").optional(),
});

export type CreateTransactionSchemaType = z.infer<typeof CreateTransactionSchema>