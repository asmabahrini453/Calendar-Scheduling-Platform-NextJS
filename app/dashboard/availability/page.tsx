import { updateAvailabilityAction } from "@/app/actions";
import { SubmitButton } from "@/app/components/SubmitButtons";
import prisma from "@/app/lib/db"
import requireUser from "@/app/lib/hooks";
import { times } from "@/app/lib/times";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { notFound } from "next/navigation";


async function getData(id: string){
    const data = await prisma.availability.findMany(
        {
            where:{
                userId:id
            },
        }
    );
   if( !data){
    return notFound();
   }
    return data
}

const AvailabilityRoute=async()=>{
    const session  = await requireUser()
    const data = await getData(session.user?.id as string);
    return(
        <Card>
            <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>In this section you can manage your availability!</CardDescription>
            </CardHeader>
            <form action={updateAvailabilityAction}>
                <CardContent className="flex flex-col gap-4">
                    {/* we want to render the days & times from the server and map  over it*/}
                    {data.map((item)=>(
                        // the key of the div must be unique
                        <div  key={item.id}
                        className="grid grid-cols-1 sm:grid-cols-2 
                        md:grid-cols-3 items-center gap-4">
                             {/* //get the id value as formdata */}
                             <input type="hidden" name={`id-${item.id}`} value={item.id}/>

                            <div className="flex  items-center gap-x-3 ">
                                <Switch
                                 name={`isActive-${item.id}`} 
                                 defaultChecked={item.isActive} />
                                <p>{item.day}</p>
                            </div>
                           
                            <Select name={`fromTime-${item.id}`} defaultValue={item.fromTime}>
                            <SelectTrigger className="w-full">
                            <SelectValue placeholder="From Time" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectGroup>
                                {times.map((time) => (
                                <SelectItem key={time.id} value={time.time}>
                                    {time.time}
                                </SelectItem>
                                ))}
                            </SelectGroup>
                            </SelectContent>
                         </Select>
                        <Select name={`tillTime-${item.id}`} defaultValue={item.tillTime}>
                            <SelectTrigger className="w-full">
                            <SelectValue placeholder="Till Time" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectGroup>
                                {times.map((time) => (
                                <SelectItem key={time.id} value={time.time}>
                                    {time.time}
                                </SelectItem>
                                ))}
                            </SelectGroup>
                            </SelectContent>
                           
                        </Select>
                      
                        </div>
                    ))}

                </CardContent>
                <CardFooter>
                    <SubmitButton text="Save changes"/>
                 </CardFooter>
            </form>
        </Card>
    )
}

export default AvailabilityRoute