import { Currencies } from "@/lib/currencies";
import { Roles } from "@/lib/roles";
import { z } from "zod";

export const UpdateUserCurrencySchema = z.object({
    currency: z.custom((value) =>{
        const found = Currencies.some((c) => c.value === value);
        if(!found) {
            throw new Error (`Invalid currency: ${value}`)
        }
        return value;
    })
})

export const UpdateUserRoleSchema = z.object({
    role: z.custom((value) =>{
        const found = Roles.some((c) => c.value === value);
        if(!found) {
            throw new Error (`Invalid Role: ${value}`)
        }
        return value;
    })
})