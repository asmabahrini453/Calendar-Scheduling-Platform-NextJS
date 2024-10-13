// This component is responsible for the authentication modal dialog that opens when the user wants to log in

import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogContent, DialogTrigger } from "@/components/ui/dialog"; // Import everything from the same module if applicable
import Image from "next/image";
import Logo from "@/public/logo.png";
import { signIn } from "../lib/auth";
import { GitHubAuthButton, GoogleAuthButton } from "./SubmitButtons";

export function AuthModal() {
    return (
        <Dialog>
            {/* Trigger to open the dialog */}
            <DialogTrigger asChild>
                {/* asChild allows the button to control the dialog directly */}
                <Button>Try for Free</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[360px]">
                <DialogHeader className="flex flex-row justify-center items-cenetr gap-2">
                    <Image src={Logo} alt="Logo" className="size-10" />
                    <h4 className="text-3xl font-semibold">
                        Calendar <span className="text-primary">AB</span>
                    </h4>
                </DialogHeader>
                <div className="flex flex-col mt-5 gap-3">
                   <form className="w-full" action={async()=> {
                    "use server"
                    await signIn("google");
                   }}>
                    <GoogleAuthButton/>             
                  </form>

                  <form className="w-full" action={async()=> {
                    "use server"
                    await signIn("github");
                   }}>
                    <GitHubAuthButton/>             
                  </form>



                </div>



            </DialogContent>
        </Dialog>
    );
}
