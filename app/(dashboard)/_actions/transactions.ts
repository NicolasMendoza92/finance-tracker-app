"use server";

import prisma from "@/lib/prisma";
import {} from "@/schema/categories";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transactions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateTransaction(form: CreateTransactionSchemaType) {
  const parsedBody = CreateTransactionSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("sign-in");
  }

  // agregar paymethod y paymedium
  const { amount, category, date, description, type, account } = parsedBody.data;

  const categoryRow = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: category,
    },
  });

  if (!categoryRow) {
    throw new Error("Categoria no encontrada");
  }

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        date,
        description: description || "",
        type,
        category: categoryRow.name,
        categoryIcon: categoryRow.icon,
        account, 
      },
    }),

    // actualizo la tabla relacioanda -- busca una trasnaccion con esa fecha,... si no encuentra la crea
    prisma.monthHistory.upsert({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: date.getUTCDate(),
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        day: date.getUTCDate(),
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === "expense" ? amount : 0,
        income: type === "income" ? amount : 0,
      },
      update: {
        expense: {
          increment: type === "expense" ? amount : 0,
        },
        income: {
          increment: type === "income" ? amount : 0,
        },
      },
    }),

    prisma.yearHistory.upsert({
      where: {
        month_year_userId: {
          userId: user.id,
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === "expense" ? amount : 0,
        income: type === "income" ? amount : 0,
      },
      update: {
        expense: {
          increment: type === "expense" ? amount : 0,
        },
        income: {
          increment: type === "income" ? amount : 0,
        },
      },
    }),
  ]);
}


export async function DeleteTransaction(id:string){
  const user = await currentUser();
  if (!user) {
    redirect("sign-in");
  }

  const transaction = await prisma.transaction.findUnique({
    where:{
      userId: user.id,
      id,
    }
  });
  if( !transaction){
    throw new Error("Bad requests")
  }

  await prisma.$transaction([
    prisma.transaction.delete({
      where:{
        id,
        userId: user.id
      }
    }),

    prisma.monthHistory.update({
      where:{
        day_month_year_userId:{
          userId: user.id,
          day: transaction.date.getUTCDate(),
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data:{
        ...(transaction.type === "expense" && {
          expense: {
            decrement: transaction.amount,
          }
        }),
        ...(transaction.type === "income" && {
          income: {
            decrement: transaction.amount,
          }
        }),
      }
    }),

    prisma.yearHistory.update({
      where:{
        month_year_userId:{
          userId: user.id,
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data:{
        ...(transaction.type === "expense" && {
          expense: {
            decrement: transaction.amount,
          }
        }),
        ...(transaction.type === "income" && {
          income: {
            decrement: transaction.amount,
          }
        }),
      }
    })
  ])
}

type BulkTransactionType = {
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
};


// CREATE BULK TRANSACTIONS
export async function createBulkTransactions(transactions: BulkTransactionType[]) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  try {
    await prisma.$transaction(async (prisma) => {
      // Prepare bulk transaction data
      const transactionData = transactions.map(t => ({
        userId: user.id,
        amount: t.amount,
        date: t.date,
        description: t.description || "",
        type: t.type,
        category: t.category,
        categoryIcon: t.categoryIcon,
        account: t.account,
      }));

      // Bulk insert transactions
      await prisma.transaction.createMany({
        data: transactionData,
      });

      // Aggregate month history updates
      const monthUpdates = transactions.reduce((acc, t) => {
        const key = `${t.date.getUTCDate()}-${t.date.getUTCMonth()}-${t.date.getUTCFullYear()}`;
        if (!acc[key]) {
          acc[key] = { income: 0, expense: 0 };
        }
        if (t.type === "income") {
          acc[key].income += t.amount;
        } else {
          acc[key].expense += t.amount;
        }
        return acc;
      }, {} as Record<string, { income: number; expense: number }>);

      // Apply month history updates
      for (const [key, value] of Object.entries(monthUpdates)) {
        const [day, month, year] = key.split('-').map(Number);
        await prisma.monthHistory.upsert({
          where: {
            day_month_year_userId: {
              userId: user.id,
              day,
              month,
              year,
            },
          },
          create: {
            userId: user.id,
            day,
            month,
            year,
            income: value.income,
            expense: value.expense,
          },
          update: {
            income: { increment: value.income },
            expense: { increment: value.expense },
          },
        });
      }

      // Aggregate year history updates
      const yearUpdates = transactions.reduce((acc, t) => {
        const key = `${t.date.getUTCMonth()}-${t.date.getUTCFullYear()}`;
        if (!acc[key]) {
          acc[key] = { income: 0, expense: 0 };
        }
        if (t.type === "income") {
          acc[key].income += t.amount;
        } else {
          acc[key].expense += t.amount;
        }
        return acc;
      }, {} as Record<string, { income: number; expense: number }>);

      // Apply year history updates
      for (const [key, value] of Object.entries(yearUpdates)) {
        const [month, year] = key.split('-').map(Number);
        await prisma.yearHistory.upsert({
          where: {
            month_year_userId: {
              userId: user.id,
              month,
              year,
            },
          },
          create: {
            userId: user.id,
            month,
            year,
            income: value.income,
            expense: value.expense,
          },
          update: {
            income: { increment: value.income },
            expense: { increment: value.expense },
          },
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error in createBulkTransactions:", error);
    return { error: "Failed to create bulk transactions" };
  }
}