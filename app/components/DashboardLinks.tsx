'use client'
import { cn } from "@/lib/utils";
//render all navigation links here that we will use inside the sidebar

import { CalendarCheck, HomeIcon, LucideProps, Settings, Users2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ForwardRefExoticComponent, RefAttributes } from "react";

//for typescript type safety we create an interface 
//this interface is the type of the dashboard links array
interface isAppProps{
    id:number;
    name:string;
    href:string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

export const dashboardLinks: isAppProps[]=[
    {
        id:0,
        name:'Event Types',
        href:'/dashboard',
        icon:HomeIcon
    },
    {
        id:1,
        name:'Meetings',
        href:'/dashboard/meetings',
        icon:Users2
    },
    {
        id:2,
        name:'Availability',
        href:'/dashboard/availability',
        icon:CalendarCheck
    },
    {
        id:3,
        name:'Settings',
        href:'/dashboard/settings',
        icon:Settings
    }
]

export function DashboardLinks(){
    //extracting the pathname from url 
    const pathname= usePathname();
    
    return(
        <>
            {dashboardLinks.map((link)=>(
                // check if pathname is active or not 
                <Link className={cn(
                    pathname===link.href ? "text-primary bg-primary/10" : "text-muted-forground hover:text-foreground",
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary"
                )} key={link.id} href={link.href}>
                    <link.icon className="size-4"/>
                    {link.name}
                </Link>

            ))}
        </>
    )

}