"use client";

import * as React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMutation, useQuery } from "@tanstack/react-query";
import SkeletonWrapper from "./SkeletonWrapper";
import { UserSettings } from "@prisma/client";
import {  UpdateUserRole } from "@/app/wizard/_actions/userSettings";
import { toast } from "sonner";
import { Role, Roles } from "@/lib/roles";


export function UserRoleBox() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedOption, setSelectedOption] = React.useState<Role | null>(
    null
  );

  // Hago el llamado a la api con useQuery
  const userSettings = useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: () => fetch("/api/user-settings").then((res) => res.json()),
  });

  // Hacemos el useEffect para setear la opcion si es que ya la tiene seleccionada el usuario
  React.useEffect(() => {
    if (!userSettings.data) return;
    const userRole = Roles.find(
      (role) => role.value === userSettings.data.role
    );
    if (userRole) setSelectedOption(userRole);
  }, [userSettings.data]);

  const mutation = useMutation({
    mutationFn: UpdateUserRole,
    onSuccess: (data: UserSettings) => {
      toast.success("Role de usuario configurado correctamente", {
        id: "update-role",
      });

      setSelectedOption(
        Roles.find((c) => c.value === data.role) || null
      );
    },
    onError: (e) => {
      console.error(e);
      toast.error("Algo salio mal :(", {
        id: "update-roley",
      });
    },
  });

  //  llamamos a la funcion mutation cuando el cliente cambia
  // esto evita probelmas de reenderizado u sea un loop
  const selectOption = React.useCallback(
    (role: Role | null) => {
      if (!role) {
        toast.error("Por favor seleccione un role");
        return;
      }
      toast.loading(" Configurando role...", {
        id: "update-role",
      });

      mutation.mutate(role.value);
    },
    [mutation]
  );

  if (isDesktop) {
    return (
      <SkeletonWrapper isLoading={userSettings.isFetching}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={mutation.isPending}
            >
              {selectedOption ? (
                <>{selectedOption.label}</>
              ) : (
                <>+ Selecciona Role</>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
          </PopoverContent>
        </Popover>
      </SkeletonWrapper>
    );
  }

  return (
    <SkeletonWrapper isLoading={userSettings.isFetching}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={mutation.isPending}
          >
            {selectedOption ? (
              <>{selectedOption.label}</>
            ) : (
              <>+ Selecciona tipo</>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">
            <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
          </div>
        </DrawerContent>
      </Drawer>
    </SkeletonWrapper>
  );
}

function OptionList({
  setOpen,
  setSelectedOption,
}: {
  setOpen: (open: boolean) => void;
  setSelectedOption: (option: Role | null) => void;
}) {
  return (
    <Command>
      <CommandInput placeholder="Filtrar moneda..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {Roles.map((role: Role) => (
            <CommandItem
              key={role.value}
              value={role.value}
              onSelect={(value) => {
                setSelectedOption(
                  Roles.find((priority) => priority.value === value) ||
                    null
                );
                setOpen(false);
              }}
            >
              {role.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
