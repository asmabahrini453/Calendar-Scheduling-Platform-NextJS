//this route is responsible for redirecting the user after a seuccessfull nylas authentication *

import prisma from "@/app/lib/db";
import requireUser from "@/app/lib/hooks";
import { nylas, nylasConfig } from "@/app/lib/nylas";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req:NextRequest) {
    const session = await requireUser(); //only authenticated user are able to acces this route

    const url = new URL(req.url as string);
    //nylas includes a code as a query param in the successfull response that we want to extract 
    const code = url.searchParams.get("code");

    if(!code){
        return Response.json(" we did not get an authorization code." ,{
            status:400,
        });
    }


//exchange the code for a token  
const codeExchangePayload = {
    clientSecret: nylasConfig.apiKey,
    clientId: nylasConfig.clientId as string,
    redirectUri: nylasConfig.redirectUri,
    code:code,
  };
    try{
        const response = await nylas.auth.exchangeCodeForToken(codeExchangePayload)
         
        //from this response , we extract both the id and email
        const {grantId, email}=response ;
       //store them in db
        await prisma.user.update({
            where:{
                id:session.user?.id as string, //user we want to update
            },//data we want to update
            data:{
                grantId: grantId,
                grantEmail : email ,
            },
        });
        console.log({ grantId });
        console.log({ email });

    }catch(error){
        console.log("error: "+error)
    }

    redirect("/dashboard")
}

