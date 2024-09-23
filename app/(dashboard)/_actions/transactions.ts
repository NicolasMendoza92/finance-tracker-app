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

  const {
    amount,
    category,
    date,
    description,
    type,
    payMethod,
    installmentCount,
    installmentAmount,
  } = parsedBody.data;

  const categoryRow = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: category,
    },
  });

  if (!categoryRow) {
    throw new Error("Categoria no encontrada");
  }

  // Villereo y convierto a numero para ver si me sale 
  // const installmentCountNumber = installmentCount ? parseInt(installmentCount, 10) : undefined;
  const transactions =  []

  if (installmentCount  > 0) {
    for (let index = 0; index < installmentCount; index++) {
      transactions.push(
        prisma.transaction.create({
          data:{
            userId: user.id,
            amount: installmentAmount || 0,
            date: new Date(date.getFullYear(), date.getMonth() + index, 1), // Sumo el indice al mes
            description: description || "",
            type,
            payMethod: payMethod || "",
            category: categoryRow.name,
            categoryIcon: categoryRow.icon,
            installmentCount: installmentCount,
            installmentNumber: index + 1, 
          },
        })
      );
    }
  } else {
    transactions.push(
      prisma.transaction.create({
        data:{
          userId: user.id,
          amount,
          date,
          description: description || "",
          type,
          payMethod: payMethod || "",
          category: categoryRow.name,
          categoryIcon: categoryRow.icon,
          installmentCount: 1,
        },
      })
    );
  }

  await prisma.$transaction([
    ...transactions,
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
  ]);
}

export async function DeleteTransaction(id: string) {
  const user = await currentUser();
  if (!user) {
    redirect("sign-in");
  }

  const transaction = await prisma.transaction.findUnique({
    where: {
      userId: user.id,
      id,
    },
  });
  if (!transaction) {
    throw new Error("Bad requests");
  }

  await prisma.$transaction([
    prisma.transaction.delete({
      where: {
        id,
        userId: user.id,
      },
    }),

    prisma.monthHistory.update({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: transaction.date.getUTCDate(),
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === "expense" && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === "income" && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),

    prisma.yearHistory.update({
      where: {
        month_year_userId: {
          userId: user.id,
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === "expense" && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === "income" && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),
  ]);
}
