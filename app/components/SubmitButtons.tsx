'use client'

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import Image from "next/image"
import GoogleLogo from '@/public/google.svg'
import GitHubLogo from '@/public/github.svg'
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

//this interface is made to make the submit button content dynamic
interface iAppProps{
    text:string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined,
    className?:string; //we added this optional classname value because by default the button width is set to fit 
                        //but we want the button to take w-full
}

export function  SubmitButton({text,variant, className}:iAppProps){
    const {pending} = useFormStatus()
    return(
        <>
        { pending ? (
            <Button disabled variant="outline" className={cn("w-fit",className)}>
                <Loader2 className="size-4 mr-4 animate-spin">
                    Please wait
                </Loader2>
            </Button>
        ):(
            <Button type="submit" variant={variant} className={cn("w-fit",className)}>
                 {/* default width is w-fit , if it changes we override it to the new width */}
                 {text}
            </Button>
        )}
        </>
    )
}

export function  GoogleAuthButton(){
    const {pending} = useFormStatus()
    return(
        <>
        { pending ? (
            <Button disabled variant="outline" className="w-full">
                <Loader2 className="size-4 mr-4 animate-spin">
                    Please wait
                </Loader2>
            </Button>
        ):(
            <Button variant="outline" className="w-full">
                <Image src={GoogleLogo} alt="Google Logo" className="size-4 mr-2"/>
                Sign in with Google
            </Button>
        )}
        </>
    )
}


export function  GitHubAuthButton(){
    const {pending} = useFormStatus()
    return(
        <>
        { pending ? (
            <Button disabled variant="outline" className="w-full">
                <Loader2 className="size-4 mr-4 animate-spin">
                    Please wait
                </Loader2>
            </Button>
        ):(
            <Button variant="outline" className="w-full">
                <Image src={GitHubLogo} alt="GitHub Logo" className="size-4 mr-2"/>
                Sign in with GitHub
            </Button>
        )}
        </>
    )
}

