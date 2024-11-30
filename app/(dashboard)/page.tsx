import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import Overview from "./_components/Overview";
import History from "./_components/History";
import Link from "next/link";

async function page() {
  const user = await currentUser();
  if (!user) {
    redirect("sign-in");
  }

  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!userSettings) {
    redirect("/wizard");
  }
  return (
    <div className="h-full bg-background">
      <div className="border-b bg-card">
        <div className="flex flex-wrap items-center justify-between gap-6 p-8">
          <p className="text-3xl font-bold"> Hola, {user.firstName || user.username}! </p>
          <div className="flex items-center gap-3">
          <Link href="/newIncome" passHref>
              <Button
                variant={"outline"}
                className="bg-emerald-500 text-white hover:bg-emerald-400 hover:text-white"
              >
                Nuevo Ingreso
              </Button>
            </Link>
            <Link href="/newExpense" passHref>
              <Button
                variant={"outline"}
                className="bg-rose-500 text-white hover:bg-rose-400 hover:text-white"
              >
                Nuevo Gasto
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Overview userSettings={userSettings}/>
      <History userSettings={userSettings}/>
    </div>
  );
}

export default page;
