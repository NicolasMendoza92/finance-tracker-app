"use server"

import prisma from "@/lib/prisma";
import { UpdateUserCurrencySchema, UpdateUserRoleSchema } from "@/schema/userSettings"
import { currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";


export async function UpdateUserCurrency(currency:string) {

    const parsedBody = UpdateUserCurrencySchema.safeParse({
        currency,
    });
    if(!parsedBody.success){
        throw parsedBody.error;
    }

    const user= await currentUser();
    if(!user) {
        redirect("/sign-in")
    }

    const userSettings = await prisma.userSettings.update({
        where:{
            userId: user.id,
        },
        data: {
            currency,
        }
    });

    return userSettings;
    
}


export async function UpdateUserRole(role:string) {

    const parsedBody = UpdateUserRoleSchema.safeParse({
        role,
    });
    if(!parsedBody.success){
        throw parsedBody.error;
    }

    const user= await currentUser();
    if(!user) {
        redirect("/sign-in")
    }
     // Convertir el string 'role' a un valor de UserRole
     const roleEnumValue = UserRole[role as keyof typeof UserRole];

     if (!roleEnumValue) {
        throw new Error("Invalid role value");
    }

    const userSettings = await prisma.userSettings.update({
        where:{
            userId: user.id,
        },
        data: {
            role:roleEnumValue 
        }
    });

    return userSettings;
    
}