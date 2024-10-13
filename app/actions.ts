"use server";

import prisma from "./lib/db";
import requireUser from "./lib/hooks";
import {parseWithZod} from '@conform-to/zod'
import { eventTypeSchema, onboardingSchema, onboardingSchemaValidation, settingsSchema } from "./lib/zodSchemas";
import { redirect } from "next/navigation";
import { Item } from "@radix-ui/react-dropdown-menu";
import { revalidatePath } from "next/cache";
import { title } from "process";
import { Drum } from "lucide-react";
import { threadId } from "worker_threads";
import { nylas } from "./lib/nylas";

//this file store all of our server actions

//this action is responsible for updating the userName and storing it for the user
//after receiving the value of it from the form 
//prevState : after we submit the new formadata it will be the new initial state
const OnboardingAction=async(prevState:any ,formData: FormData)=>{
    const session = await requireUser();

    //formadata input validations with the zod schema we created , this validation is on the server side
    const submission = await parseWithZod(formData, {
        schema: onboardingSchemaValidation({
            async isUsernameUnique() {
                // asynchronously,Fetch username that matches the form data of the username
                // Prisma returns either null or the non-unique username value
                const existingUsername = await prisma.user.findUnique({
                    where: {
                        userName: formData.get("userName") as string, // This should correctly reference the unique userName
                    }
                });
                return !existingUsername; // if username = null =>unique, !existingUsername = true; if not, false
            },
        }),
        async:true, //indicate that the validation func with zod should return a promise
    });
    
    console.log(submission);
    if( submission.status !=="success"){
        return submission.reply();
    }

    const data = await prisma.user.update({
        where:{
            id:session.user?.id
        },
        data:{
            userName:submission.value.userName,
            name:submission.value.fullName,
    //    creating a default availability for the user
            availability:{
                createMany:{
                    data:[
                        {
                            day:'Monday',
                            fromTime:"08:00",
                            tillTime:"18:00"

                        },
                        
                        {
                        day: "Tuesday",
                        fromTime: "08:00",
                        tillTime: "18:00",
                        },
                        {
                        day: "Wednesday",
                        fromTime: "08:00",
                        tillTime: "18:00",
                        },
                        {
                        day: "Thursday",
                        fromTime: "08:00",
                        tillTime: "18:00",
                        },
                        {
                        day: "Friday",
                        fromTime: "08:00",
                        tillTime: "18:00",
                        },
                        {
                        day: "Saturday",
                        fromTime: "08:00",
                        tillTime: "18:00",
                        },
                        {
                        day: "Sunday",
                        fromTime: "08:00",
                        tillTime: "18:00",
                        },
          ]
                }
            }
        }
    });

    return redirect("/onboarding/grant-id") //redirect to connect with calendar
}

export default OnboardingAction;

//server action responsible for updating user info
export async function SettingsAction(prevState: any ,formdata:FormData){
    const session = await requireUser();//only authenticate duser
    //server side validation :compare formdata with SettingsSchema
    const submission = parseWithZod(formdata,{
        schema:settingsSchema,
    });
    if(submission.status !== "success"){
        return submission.reply();
    }

    //update user
    const user= await prisma.user.update({
        where:{
            id: session.user?.id,
        },
        data: {
            name:submission.value.fullName,
            image:submission.value.profileImage
        }
    });
    return redirect("/dashboard");

}

//action to handle the availability of the user
export async function updateAvailabilityAction(formData: FormData) {
    const session = await requireUser();
    //converting formdata into raw data
    const rawData = Object.fromEntries(formData.entries())

    const availabilityData = Object.keys(rawData).filter((key)=> 
        key.startsWith("id-")
).map((key)=>{
    const id= key.replace("id-","");

    return{
        id,
        isActive:rawData[`isActive-${id}`] ==="on",
        //==="on" and not true because the switch  returns a string when true it returns "on" , false -> "off"
        fromTime:rawData[`fromTime-${id}`] as string,
        tillTime:rawData[`tillTime-${id}`] as string,
    }
});

    try{
        //transaction: using it we can execute multiple db operations in a single transaction
        //if we don't do it we will have 7 transactions (because we have 7days)=>overloading db
        await prisma.$transaction(
            availabilityData.map((item)=>prisma.availability.update({
                where:{
                    id:item.id //update dat when id matches
                },
                data:{
                    isActive: item.isActive,
                    fromTime:item.fromTime,
                    tillTime: item.tillTime
                }
            })
        )
        )
        //reset the cache for the route
        revalidatePath("/dashboard/availability")
    }catch(err){
        console.log(err);
    }
    
}

export async function CreateEventTypeAction(prevState:any ,formData: FormData) {
    const session = await requireUser();
    const submission = parseWithZod(formData, {
        schema: eventTypeSchema,
    });

    if (submission.status !== "success") {
        return submission.reply();
    }

    const data = await prisma.eventType.create({
        data: {
            title: submission.value.title,
            duration: submission.value.duration,
            url: submission.value.url,
            description: submission.value.description,
            videoCallSoftware: submission.value.videoCallSoftware,
            userId: session.user?.id as string,
        },
    });

    return redirect("/dashboard");
}


//create meeting
export async function createMeetingAction(formData:FormData){
    const getUserData = await prisma.user.findUnique({
        where:{
            userName: formData.get("username") as string
        },
        select:{
            grantEmail:true,
            grantId:true
        }
    });
    if(!getUserData){
        throw new Error("user not found");
    }

    const eventTypeData = await prisma.eventType.findUnique({
        where:{
            id:formData.get('eventTypeId') as string,
        },
        select:{
            title:true,
            description:true,
        }
    });
    //get date & time of the event 
    const formTime = formData.get("fromTime") as string;
    const meetingLength = Number(formData.get("meetingLength"));
    const provider = formData.get('provider') as string;
    const eventDate = formData.get("eventDate") as string;
    //combine the from time & eventDate into a js date obj
    const startDateTime = new Date(`${eventDate}T${formTime}:00`);
    const endDateTime  = new Date(startDateTime.getTime()+meetingLength*60000 )
    //*6000: min to millisec

    //create the event using nylas
    await nylas.events.create({
        identifier:getUserData.grantId as string, //authenticated user via grantId
        requestBody:{
            title:eventTypeData?.title,
            description:eventTypeData?.description,
            //tell nylas when we want to schedule this event
            when:{
                startTime:Math.floor(startDateTime.getTime()/1000),   
                endTime: Math.floor(endDateTime.getTime() / 1000),
            },
            conferencing:{
                autocreate:{},
                provider: provider as any,
            },
            //who will participate to the event
            participants: [
              {
                name: formData.get("name") as string,
                email: formData.get("email") as string,
                status: "yes",
              },
            ],
               

            },
            queryParams: {
              calendarId: getUserData?.grantEmail as string,
              notifyParticipants: true, //email notification containing reminder of the event
            },
    
    });

    return redirect(`/success`);

}

//delete or cancel meet server action 
export async function cancelMeetingAction(formData: FormData) {
    const session = await requireUser();
  
    const userData = await prisma.user.findUnique({
      where: {
        id: session.user?.id as string,
      },
      select: {
        grantEmail: true,
        grantId: true,
      },
    });
  
    if (!userData) {
      throw new Error("User not found");
    }
  
    const data = await nylas.events.destroy({
      eventId: formData.get("eventId") as string,
      identifier: userData?.grantId as string,
      queryParams: {
        calendarId: userData?.grantEmail as string,
      },
    });
  
    revalidatePath("/dashboard/meetings");
  }
  
  //edit event type

  export async function EditEventTypeAction(prevState: any, formData: FormData) {
    const session = await requireUser();
  
    const submission = await parseWithZod(formData, {
      schema: eventTypeSchema,
  
    });
  
    if (submission.status !== "success") {
      return submission.reply();
    }
  
    const data = await prisma.eventType.update({
      where: {
        id: formData.get("id") as string,
        userId: session.user?.id as string,
      },
      data: {
        title: submission.value.title,
        duration: submission.value.duration,
        url: submission.value.url,
        description: submission.value.description,
        videoCallSoftware: submission.value.videoCallSoftware,
      },
    });
  
    return redirect("/dashboard");
  }

//switch action for event type
export async function UpdateEventTypeStatusAction(prevState:any,
    {eventTypeId,isChecked}:
    {
        eventTypeId:string ,
        isChecked:boolean
    }
){
   try{
    const session = await requireUser();
    const data = await prisma.eventType.update({
        where:{
            id:eventTypeId,
            userId:session.user?.id
        },
        data:{
            active:isChecked,
        },
    });
    revalidatePath("/dashboard") //update =revalidate the cache = the data
    return {
        status:'success',
        message:'Event Type Status has been updated! '
    }
   }catch(e){
    return{
         status:'success',
         message:'Something is wrong! '

    }
   }
}

//delete event type

export async function DeleteEventTypeAction(formData:FormData){
    const session = await requireUser();

    const data = await prisma.eventType.delete({
        where:{
            id:formData.get("id") as string,
            userId:session.user?.id
        },
    });
    return redirect("/dashboard")
}
