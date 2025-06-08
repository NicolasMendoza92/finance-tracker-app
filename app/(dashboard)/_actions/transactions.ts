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

// FUNCION PARA EDITAR TRASNACCION 
export async function EditTransaction(
  form: CreateTransactionSchemaType,
  id?:string
) {
  const parsedBody = CreateTransactionSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("Bad request: Invalid form data.");
  }

  const user = await currentUser();
  if (!user) {
    redirect("sign-in");
  }

  const { amount, category, date, description, type, account } = parsedBody.data;
  console.log(id, amount)

  const categoryRow = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: category,
    },
  });

  if (!categoryRow) {
    throw new Error("Categoria no encontrada");
  }

  // Usamos una transacción para asegurarnos de que las operaciones estén sincronizadas
  await prisma.$transaction([
    // Actualizamos la transacción existente
    prisma.transaction.update({
      where: {
        id,
      },
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

    // Actualizamos el historial mensual
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

    // Actualizamos el historial anual
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

export async function getTransactionById(id: string) {
  try {
    const transactionFound = await prisma.transaction.findUnique({
      where: { id },
    })
    return { success: true, transactionFound }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { error: 'Internal Server Error' }
  }
}

export async function DeleteTransaction(id: string) {
  console.log("Deleting transaction with id:", id);
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in"); // Usa una ruta absoluta para el redirect
  }

  const transaction = await prisma.transaction.findUnique({
    where: {
      userId: user.id,
      id,
    },
  });

  if (!transaction) {
    throw new Error("Bad request: Transaction not found.");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Eliminar la transacción
    await tx.transaction.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    // 2. Actualizar MonthHistory
    const day = transaction.date.getUTCDate();
    const month = transaction.date.getUTCMonth();
    const year = transaction.date.getUTCFullYear();

    const monthHistory = await tx.monthHistory.findUnique({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day,
          month,
          year,
        },
      },
    });

    if (monthHistory) {
      if (transaction.type === "income") {
        await tx.monthHistory.update({
          where: {
            day_month_year_userId: {
              userId: user.id,
              day,
              month,
              year,
            },
          },
          data: {
            income: monthHistory.income - transaction.amount,
          },
        });
      } else {
        await tx.monthHistory.update({
          where: {
            day_month_year_userId: {
              userId: user.id,
              day,
              month,
              year,
            },
          },
          data: {
            expense: monthHistory.expense - transaction.amount,
          },
        });
      }
    }
    // Si no existe monthHistory, significa que esta era la única transacción para ese día
    // o hubo un problema previo. En este caso, no hay nada que actualizar/eliminar en monthHistory.

    // 3. Actualizar YearHistory
    const yearHistory = await tx.yearHistory.findUnique({
      where: {
        month_year_userId: {
          userId: user.id,
          month,
          year,
        },
      },
    });

    if (yearHistory) {
      if (transaction.type === "income") {
        await tx.yearHistory.update({
          where: {
            month_year_userId: {
              userId: user.id,
              month,
              year,
            },
          },
          data: {
            income: yearHistory.income - transaction.amount,
          },
        });
      } else {
        await tx.yearHistory.update({
          where: {
            month_year_userId: {
              userId: user.id,
              month,
              year,
            },
          },
          data: {
            expense: yearHistory.expense - transaction.amount,
          },
        });
      }
    }
    // Si no existe yearHistory, similar al monthHistory, no hay nada que actualizar/eliminar.
  });
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
      // Obtener todas las categorías del usuario actual
      const existingCategories = await prisma.category.findMany({
        where: { userId: user.id },
      });

      const existingCategoryNames = new Set(existingCategories.map(c => c.name));

      // Crear las categorías que no existan
      const newCategories = transactions
        .map(t => ({ name: t.category, icon: t.categoryIcon, type: t.type }))
        .filter(cat => !existingCategoryNames.has(cat.name)); // Solo categorías nuevas

      if (newCategories.length > 0) {
        const uniqueNewCategories = Array.from(
          new Map(newCategories.map(cat => [cat.name, cat])).values()
        ); // Elimina duplicados

        await prisma.category.createMany({
          data: uniqueNewCategories.map(cat => ({
            userId: user.id,
            name: cat.name,
            icon: cat.icon,
            type: cat.type,
          })),
        });
      }

      // Preparar datos de transacciones
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

      // Insertar transacciones
      await prisma.transaction.createMany({
        data: transactionData,
      });

      // Actualizar MonthHistory
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

      // Actualizar YearHistory
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
// export async function createBulkTransactions(transactions: BulkTransactionType[]) {
//   const user = await currentUser();
//   if (!user) {
//     redirect("/sign-in");
//   }

//   try {
//     await prisma.$transaction(async (prisma) => {
//       // Prepare bulk transaction data
//       const transactionData = transactions.map(t => ({
//         userId: user.id,
//         amount: t.amount,
//         date: t.date,
//         description: t.description || "",
//         type: t.type,
//         category: t.category,
//         categoryIcon: t.categoryIcon,
//         account: t.account,
//       }));

//       // Bulk insert transactions
//       await prisma.transaction.createMany({
//         data: transactionData,
//       });

//       // Aggregate month history updates
//       const monthUpdates = transactions.reduce((acc, t) => {
//         const key = `${t.date.getUTCDate()}-${t.date.getUTCMonth()}-${t.date.getUTCFullYear()}`;
//         if (!acc[key]) {
//           acc[key] = { income: 0, expense: 0 };
//         }
//         if (t.type === "income") {
//           acc[key].income += t.amount;
//         } else {
//           acc[key].expense += t.amount;
//         }
//         return acc;
//       }, {} as Record<string, { income: number; expense: number }>);

//       // Apply month history updates
//       for (const [key, value] of Object.entries(monthUpdates)) {
//         const [day, month, year] = key.split('-').map(Number);
//         await prisma.monthHistory.upsert({
//           where: {
//             day_month_year_userId: {
//               userId: user.id,
//               day,
//               month,
//               year,
//             },
//           },
//           create: {
//             userId: user.id,
//             day,
//             month,
//             year,
//             income: value.income,
//             expense: value.expense,
//           },
//           update: {
//             income: { increment: value.income },
//             expense: { increment: value.expense },
//           },
//         });
//       }

//       // Aggregate year history updates
//       const yearUpdates = transactions.reduce((acc, t) => {
//         const key = `${t.date.getUTCMonth()}-${t.date.getUTCFullYear()}`;
//         if (!acc[key]) {
//           acc[key] = { income: 0, expense: 0 };
//         }
//         if (t.type === "income") {
//           acc[key].income += t.amount;
//         } else {
//           acc[key].expense += t.amount;
//         }
//         return acc;
//       }, {} as Record<string, { income: number; expense: number }>);

//       // Apply year history updates
//       for (const [key, value] of Object.entries(yearUpdates)) {
//         const [month, year] = key.split('-').map(Number);
//         await prisma.yearHistory.upsert({
//           where: {
//             month_year_userId: {
//               userId: user.id,
//               month,
//               year,
//             },
//           },
//           create: {
//             userId: user.id,
//             month,
//             year,
//             income: value.income,
//             expense: value.expense,
//           },
//           update: {
//             income: { increment: value.income },
//             expense: { increment: value.expense },
//           },
//         });
//       }
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("Error in createBulkTransactions:", error);
//     return { error: "Failed to create bulk transactions" };
//   }
// }