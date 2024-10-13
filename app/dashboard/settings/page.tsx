// This route is responsible for managing account settings:
// updating user name and image

import { SettingsForm } from "@/app/components/SettingsForm";
import prisma from "@/app/lib/db";
import requireUser from "@/app/lib/hooks";
import { notFound } from "next/navigation";

//fetch user data
async function getData(id: string) {
    const data = await prisma.user.findUnique({
        where:{
            id:id
         },
         select:{
            name:true,
            email:true , 
            image: true,
         },
    });
    if(!data){
        return notFound();
    }
    return data ;
}


const SettingsRoute = async () => {
    const session = await requireUser();
   const data = await getData(session.user?.id as string);
    return (
        <SettingsForm 
        email={data.email}
        fullName={data.name as string}
        profileImage={data.image as string}

        />
    );
}

export default SettingsRoute;
