
import { z } from "zod";

export const CreateTransactionSchema = z.object({
  amount: z.coerce.number().positive().multipleOf(0.01),
  description: z.string().optional(),
  date: z.coerce.date(),
  category: z.string(),
  type: z.union([z.literal("income"), z.literal("expense")]),
  account: z.string().optional(),
});

export type CreateTransactionSchemaType = z.infer<
  typeof CreateTransactionSchema
>;

// export const EditTransactionSchema = z.object({
//   id: z.string(),
//   type: z.union([z.literal("income"), z.literal("expense")]),
//   description: z.string().optional(),
//   amount: z.coerce.number().positive().multipleOf(0.01),
//   category: z.string(),
//   account: z.string().nullable(),
//   date: z.coerce.date(),
// });

// export type EditTransactionSchemaType = z.infer<
//   typeof EditTransactionSchema
// >;