"use server";
import { CurrencyComboBox } from "@/components/CurrencyComboBox";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import React from "react";

async function page() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return (
    <div className="flex max-w-2xl flex-col items-center justify-between gap-4 m-auto">
      <div className="mt-8">
        <Logo />
      </div>
      <div>
        <h1 className="text-center text-3xl">
          Bienvenido, <span className="ml-2 font-bold">{user.firstName}!</span>
        </h1>
        <h2 className="mt-4 text-center text-base text-muted-foreground">
          Empecemos por definir la moneda
        </h2>
        <h3 className="mt-2 text text-sm text-muted-foreground">
          Puedes cambiar el tipo de moneda cuando quieras.
        </h3>
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Moneda</CardTitle>
          <CardDescription>
            {" "}
            Configura la moneda para tus transacciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencyComboBox />
        </CardContent>
      </Card>
      <Separator />
      <Button className="w-full" asChild>
        <Link href={"/"}>Listo, vamos al tablero</Link>
      </Button>
    </div>
  );
}

export default page;
