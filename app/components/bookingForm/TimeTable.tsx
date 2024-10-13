import {
    addMinutes,
    format,
    fromUnixTime,
    isAfter,
    isBefore,
    parse,
  } from "date-fns";
  import { Prisma } from "@prisma/client";
  import Link from "next/link";
  import { Button } from "@/components/ui/button";
  import { NylasResponse, GetFreeBusyResponse } from "nylas";
  import prisma from "@/app/lib/db";
  import { nylas } from "@/app/lib/nylas";
  
  interface iAppProps {
    selectedDate: Date;
    userName: string;
    meetingDuration: number;
  }
  
  async function getData(userName: string, selectedDate: Date) {
    const currentDay = format(selectedDate, "EEEE"); // name of the day
  
    // Define the start and end of the day
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
  
    // Fetch availability data from Prisma
    const data = await prisma.availability.findFirst({
      where: {
        day: currentDay as Prisma.EnumDayFilter,
        user: {
          userName: userName,
        },
      },
      select: {
        fromTime: true,
        tillTime: true,
        id: true,
        user: {
          select: {
            grantEmail: true,
            grantId: true,
          },
        },
      },
    });
  
    // Check if user has granted access for calendar data, then call Nylas
    if (data?.user?.grantId && data?.user?.grantEmail) {
      // Use Nylas calendar API to check user's availability
      const nylasCalendarData = await nylas.calendars.getFreeBusy({
        identifier: data.user.grantId as string,
        requestBody: {
          startTime: Math.floor(startOfDay.getTime() / 1000), // Convert the time to Unix timestamps
          endTime: Math.floor(endOfDay.getTime() / 1000),
          emails: [data.user.grantEmail as string],
        },
      });
      return { data, nylasCalendarData };
    }
  
    return { data, nylasCalendarData: null };
  }
  
  // Function to calculate available time slots
  function calculateAvailableTimeSlots(
    dbAvailability: {
      fromTime: string | undefined;
      tillTime: string | undefined;
    },
    nylasData: NylasResponse<GetFreeBusyResponse[]> | null,
    date: string,
    duration: number
  ) {
    const now = new Date(); // Get the current time
  
    // Convert DB availability to Date objects
    const availableFrom = parse(
      `${date} ${dbAvailability.fromTime}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );
    const availableTill = parse(
      `${date} ${dbAvailability.tillTime}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );
  
    // Extract busy slots from Nylas data (check for valid data and skip errors)
    const busySlots =
      nylasData?.data
        .filter((res) => 'timeSlots' in res) // Filter out any error responses
        .flatMap((res) => res.timeSlots.map((slot: any) => ({
          start: fromUnixTime(slot.startTime),
          end: fromUnixTime(slot.endTime),
        }))) || [];
  
    // Generate all possible time slots based on duration
    const allSlots = [];
    let currentSlot = availableFrom;
    while (isBefore(currentSlot, availableTill)) {
      allSlots.push(currentSlot);
      currentSlot = addMinutes(currentSlot, duration);
    }
  
    // Filter out busy slots and slots before the current time
    const freeSlots = allSlots.filter((slot) => {
      const slotEnd = addMinutes(slot, duration);
      return (
        isAfter(slot, now) && // Ensure the slot is after the current time
        !busySlots.some(
          (busy: { start: Date; end: Date }) =>
            (!isBefore(slot, busy.start) && isBefore(slot, busy.end)) || //if slot start during a buzy period
            (isAfter(slotEnd, busy.start) && !isAfter(slotEnd, busy.end)) ||//if slot ends during a buzy period
            (isBefore(slot, busy.start) && isAfter(slotEnd, busy.end))//if slot is during a buzy period
        )
      );
    });
  
    // Format the free slots
    return freeSlots.map((slot) => format(slot, "HH:mm"));
  }
  
  
  export async function TimeTable({
    selectedDate,
    userName,
    meetingDuration,
  }: iAppProps) {
    // Get availability data from Prisma and Nylas
    const { data, nylasCalendarData } = await getData(userName, selectedDate);
  
    // Extract availability from the database response
    const dbAvailability = { fromTime: data?.fromTime, tillTime: data?.tillTime };
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
  
    // Calculate the available time slots
    const availableSlots = calculateAvailableTimeSlots(
      dbAvailability,
      nylasCalendarData,
      formattedDate,
      meetingDuration
    );
  
    return (
      <div>
        <p className="text-base font-semibold">
          {format(selectedDate, "EEE")}.{" "}
          <span className="text-sm text-muted-foreground">
            {format(selectedDate, "MMM. d")}
          </span>
        </p>
  
        <div className="mt-3 max-h-[350px] overflow-y-auto">
          {availableSlots.length > 0 ? (
            availableSlots.map((slot, index) => (
              <Link
                key={index}
                href={`?date=${format(selectedDate, "yyyy-MM-dd")}&time=${slot}`}
              >
                <Button variant="outline" className="w-full mb-2">
                  {slot}
                </Button>
              </Link>
            ))
          ) : (
            <p>No available time slots for this date.</p>
          )}
        </div>
      </div>
    );
  }
  