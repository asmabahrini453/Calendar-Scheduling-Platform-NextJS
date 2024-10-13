import { nylas, nylasConfig } from "@/app/lib/nylas";
import { redirect } from "next/navigation";

//route handler for authentication using Nylas
export async function GET(){
    //redirect user to the hosted auth page
    const authUrl= nylas.auth.urlForOAuth2({
        clientId:nylasConfig.clientId,
        redirectUri:nylasConfig.redirectUri,
    });

    return redirect(authUrl)
}