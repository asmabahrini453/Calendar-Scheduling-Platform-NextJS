import { notFound, redirect } from "next/navigation"; //always import it from next/navigation
import { auth } from "../lib/auth";
import requireUser from "../lib/hooks";
import prisma from "../lib/db";
import { EmptyState } from "../components/EmptyState";
import { title } from "process";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLink, Link2, Pen, Settings, Trash, Users2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CopyLinkMenuItem from "../components/CopyLinkMenu";
import { MenuActiveSwitch } from "../components/EventTypeSwitcher";

//fetch event data
async function getData(userId:string) {
  const data = await prisma.user.findUnique({
    where:{
      id: userId
    },
    select :{
      userName:true,
      eventType:{
        select:{
          id:true,
          active:true , 
          title:true,
          url:true,
          duration:true
        }
      }
    }
  });
  if(!data){
    return notFound()
  }
  return data;
}

const  DashboardPage=async()=>{
    //check if user is authenticated 
    const session = await requireUser();
//get event data
    const data = await getData(session.user?.id as string)

    return(
      <>
      {data.eventType.length ===0?
      (
        <EmptyState 
        title="You have no event types"
        description="You can create your first event type by clicking on the button bellow."
        buttonText="Add event Type"
        href="/dashboard/new"
        />
      ):
      (
       <>
        <div className="flex items-center justify-between px-2">
          <div className="hidden sm:grid gap-y-1">
            <h1 className="text-3xl md:text-4xl font-semibold">Event Types</h1>
            <p className="text-muted-foreground">Create and manage your event types right here.</p>
          </div>
        <Button asChild>
          <Link href="/dashboard/new">
          Create New Event 
          </Link>
        </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* map over data  */}
          {data.eventType.map((item)=>(
            // whenever you map over data you need to give a unique identifier as a key
            <div
             key={item.id}
             className="overflow-hidden shadow rounded-lg border relative"
             >
             <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-20" align="end">
                    <DropdownMenuLabel>Event</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                    
                      <DropdownMenuItem asChild>
                        <Link href={`/${data.userName}/${item.url}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          <span>Preview</span>
                        </Link>
                      </DropdownMenuItem>
                    
                    
                      <CopyLinkMenuItem 
                      meetingUrl={`${process.env.NEXT_PUBLIC_URL}/${data.userName}/${item.url}`}/>
                   
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/event/${item.id}`}>
                          <Pen className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/event/${item.id}/delete`}>
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Link href="/" className="flex items-center p-5">
              
                <div className="flex-shrink-0"> {/* icon wrapper */}
                  <Users2 className="size-6"/>
                </div>

                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground">
                      {item.duration} Minute Meeting
                    </dt>
                    <dd className="text-lg font-medium">
                      {item.title}
                    </dd>
                  </dl>
                </div>
              </Link>
              <div className="bg-muted px-5 py-3 justify-between flex items-center">
                <MenuActiveSwitch 
                initialChecked={item.active}
                eventTypeId={item.id}
                />  
                <Button asChild>
                  <Link href={`/dashboard/event/${item.id}`}>
                   Edit event
                  </Link>
                  </Button>
               </div>

            </div>
          ))}
        </div>
       </>
      )
    }
      </>
    )
}


export default DashboardPage ; 