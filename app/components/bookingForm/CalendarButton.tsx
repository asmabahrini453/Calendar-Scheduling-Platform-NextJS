import { Button } from "@/components/ui/button";
import { type AriaButtonProps, useButton } from "@react-aria/button";
import { useFocusRing } from "@react-aria/focus";
import { mergeProps } from "@react-aria/utils";
import type { CalendarState } from "@react-stately/calendar";
import { useRef } from "react";

export function CalendarButton(
  props: AriaButtonProps<"button"> & {
    state?: CalendarState;
    side?: "left" | "right";
  }
) {
    //ref =button interacts with the DOM
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps } = useButton(props, ref);//get button behaviour / handler
  const { focusProps, isFocusVisible } = useFocusRing();//provides styles whenver the button::focus
  return (
    <Button 
      {...mergeProps(buttonProps, focusProps)} //mergeProps combines both buttonprops & focusProps to handle them both
      ref={ref}
      disabled={props.isDisabled} //disable the previous month 
      variant="outline"
      size="icon"
    >
      {props.children}
    </Button>
  );
}
