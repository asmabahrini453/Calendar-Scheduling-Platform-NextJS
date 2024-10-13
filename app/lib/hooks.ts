import { redirect } from "next/navigation";
import { auth } from "./auth";

//returns if user has a session (if he is authenticated or not)
const requireUser=async()=>{
    const session = await auth();
    if(!session?.user){
        return redirect("/")
    }

    return session;
}

export default requireUser;