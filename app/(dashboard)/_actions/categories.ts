"use server";

import prisma from "@/lib/prisma";
import {
  CreateCategorySchema,
  CreateCategorySchemaType,
  DeleteCategorySchema,
  DeleteCategorySchemaType,
} from "@/schema/categories";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function getCategories() {
  const user = await currentUser();
  if (!user) {
    redirect("sign-in");
  }

  return await prisma.category.findMany({
    where: {
      userId: user.id,
    },
  });
}

export async function CreateCategory(form: CreateCategorySchemaType) {
  const parsedBody = CreateCategorySchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("sign-in");
  }

  const { name, icon, type } = parsedBody.data;
   // Normalizar el nombre a minúsculas
   const normalizedName = name.toLowerCase();

   // Verificar si la categoría ya existe
   const existingCategory = await prisma.category.findFirst({
     where: {
       userId: user.id,
       name: normalizedName,
       type,
     },
   });
 
   if (existingCategory) {
     throw new Error("Category with the same name and type already exists.");
   }
   
  return await prisma.category.create({
    data: {
      userId: user.id,
      name,
      icon,
      type,
    },
  });
}

export async function DeleteCategory(form: DeleteCategorySchemaType) {
  const parsedBody = DeleteCategorySchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("sign-in");
  }

  return await prisma.category.delete({
    where: {
      name_userId_type: {
        userId: user.id,
        name: parsedBody.data.name,
        type: parsedBody.data.type,
      },
    },
  });
}
