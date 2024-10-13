import { EmptyState } from "@/app/components/EmptyState";
import prisma from "../../lib/db"
import requireUser from "../../lib/hooks";
import { nylas } from "../../lib/nylas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, fromUnixTime } from "date-fns";
import { Icon, Video } from "lucide-react";
import React from "react";
import { SubmitButton } from "@/app/components/SubmitButtons";
import { Separator } from "@/components/ui/separator";
import { cancelMeetingAction } from "@/app/actions";

//fetching the events
async function getData(userId:string) {
    //get grantId & grantEmail to authenticate to nylas in order to manage a certain calendar
    const userData = await prisma.user.findUnique({
        where:{
            id:userId
        },
        select:{
            grantId:true,
            grantEmail:true
        }
    })

    if(!userData){
        throw new Error("user not found")
    }
//fetching the events from nylas

    const data = await nylas.events.list({
        identifier:userData.grantId as string,
        queryParams:{
            calendarId:userData.grantEmail as string
        }

    });
    return data
    
}



const MeetingRoute= async()=>{
    const session = await requireUser()
    const data = await getData(session.user?.id as string)
    return(
        <>
        {data.data.length < 1 ? (
          <EmptyState
            title="No meetings found"
            description="You don't have any meetings yet."
            buttonText="Create a new event type"
            href="/dashboard/new"
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>
                See upcoming and past events booked through your event type links.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.data.map((item) => (
                <form  action={cancelMeetingAction}
                key={item.id}
                 >
                  <input type="hidden" name="eventId" value={item.id} />
                  <div className="grid grid-cols-3 justify-between items-center">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        {/* @ts-ignore */}
                         {format(fromUnixTime(item.when.startTime), "EEE, dd MMM")} 
                      </p>
                      <p className="text-muted-foreground text-xs pt-1">
                         {/* @ts-ignore */}
                        {format(fromUnixTime(item.when.startTime), "hh:mm a")} -{" "}
                       {/* @ts-ignore */}
                        {format(fromUnixTime(item.when.endTime), "hh:mm a")} 
                      </p>
                      <div className="flex items-center mt-1">
                        <Video className="size-4 mr-2 text-primary" />{" "}
                        <a
                          className="text-xs text-primary underline underline-offset-4"
                          target="_blank"
                          //@ts-ignore
                          href={item.conferencing.details.url}
                        >
                          Join Meeting
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-col items-start">
                      <h2 className="text-sm font-medium">{item.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        You and {item.participants[0].name}
                      </p>
                    </div>
                    <SubmitButton
                      text="Cancel Event"
                      variant="destructive"
                      className="w-fit flex ml-auto"
                    />
                  </div>
                  <Separator className="my-3" />
                </form>
              ))}
            </CardContent>
          </Card>
        )}
      </>
    )

}

export default MeetingRoute