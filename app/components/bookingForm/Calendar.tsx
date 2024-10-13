"use client"

import { CalendarProps, DateValue, useCalendar, useLocale } from "react-aria";
import { useCalendarState } from "react-stately";
import { createCalendar } from "@internationalized/date";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";



export function Calendar(
    props: CalendarProps<DateValue> & {
        isDateUnavailable?: (date: DateValue) => boolean;
      }){
   //initialize calendar
   const {locale}=useLocale(); //returns user Locale: it formats calendar according to user's language and region (7asb loughit pc)
   //initialize state of calendar
   const state = useCalendarState({
    ...props,
    visibleDuration: { months: 1 }, //show one calendar with one month
    locale,
    createCalendar,
  });

  let { calendarProps, prevButtonProps, nextButtonProps,title } = useCalendar( //useCalendar :makes sure the calender is accessible
    props,
    state
  );
   
    return(
        <div {...calendarProps}  className="inline-block">
            <CalendarHeader 
            state={state}
            calendarProps={calendarProps}
            nextButtonProps={nextButtonProps}
            prevButtonProps={prevButtonProps}
            />
         <div className="flex gap-8">
        <CalendarGrid
          state={state}
          isDateUnavailable={props.isDateUnavailable}
        />
      </div>

        </div>
    )
}