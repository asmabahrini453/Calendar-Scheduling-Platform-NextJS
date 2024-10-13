"use client"; // Correct placement of "use client"

import { Switch } from "@/components/ui/switch";
import { useFormState } from "react-dom";
import { UpdateEventTypeStatusAction } from "../actions";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";

export function MenuActiveSwitch({ initialChecked, eventTypeId }: {
    initialChecked: boolean,
    eventTypeId: string
}) {
      // useTransition: lets you update the state without blocking the UI
      //useTransition MUST BE ON THE TOP ALWAYYYSSS!!!!
    const [isPending, startTransition] = useTransition();
    const [state, action] = useFormState(UpdateEventTypeStatusAction, undefined);
  

    useEffect(() => {
        if (state?.status === "success") {
            toast.success(state.message);
        } else if (state?.status === "error") {
            toast.error(state.message);
        }
    }, [state]);

    return (
        // disabled: when the action is pending, we disable the switch
        <Switch
            disabled={isPending}
            defaultChecked={initialChecked}
            onCheckedChange={(isChecked: boolean) => {
                startTransition(() => {
                    action({
                        eventTypeId: eventTypeId,
                        isChecked: isChecked
                    });
                });
            }}
        />
    );
}
