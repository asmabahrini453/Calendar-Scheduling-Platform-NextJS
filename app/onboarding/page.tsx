"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormState } from "react-dom";
import OnboardingAction from "../actions";
import {useForm} from '@conform-to/react'
import {parseWithZod} from '@conform-to/zod'
import { onboardingSchema } from "../lib/zodSchemas";
import { SubmitButton } from "../components/SubmitButtons";


const OnboardingRoute=()=>{
    const [lastResult, action] = useFormState(OnboardingAction,undefined)
//validating the data on the client side
    const[form, fields] = useForm({
        lastResult , 
        onValidate({formData}){
            return parseWithZod(formData,{
                schema: onboardingSchema,
            });
        },
        //whenever user type smthng as an input then click outside of the input we re-validate
        shouldValidate: 'onBlur', 
        shouldRevalidate:"onInput"
    }
    )
    return(
        <div className="min-h-screen w-screen flex items-center justify-center">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to Calendar <span className="text-primary">AB</span></CardTitle>
                    <CardDescription>We need the following information to set up your profile</CardDescription>
                </CardHeader>
               <form id={form.id} onSubmit={form.onSubmit} action={action} noValidate>
               <CardContent className="grid gap-y-5">
                    <div className="grid gap-y-2">
                        <Label>Full name</Label>
                        <Input
                         name={fields.fullName.name} //the value of the fullname the user will submit
                         defaultValue={fields.fullName.initialValue} //the default value 
                        key={fields.fullName.key} //A unique key ensures React can track the specific Input component for this field
                        placeholder="Asma Bahrini"/>
                        <p className="text-red-500 text-sm">{fields.fullName.errors}</p> 
                    </div>
                    <div className="grid gap-y-2">
                        <Label>Username</Label>
                        <div className="flex rounded-md">
                            <span className="inline-flex items-center px-3 rounded-l-md
                            border border--r-0 border-muted bg-muted text-sm text-muted-foreground">
                                CalendarAB.com/
                            </span>
                            
                            <Input 
                            name={fields.userName.name}
                            defaultValue={fields.userName.initialValue}
                            key={fields.userName.key} 
                            placeholder="exemple-use-1" 
                            className="rounded-l-none"/>
                        </div>
                        <p className="text-red-500 text-sm">{fields.userName.errors}</p> 

                    </div>

                </CardContent>
                <CardFooter>
                    <SubmitButton text="Submit" className="w-full"/>
                 </CardFooter>
               </form>
            </Card>

        </div>
    )

}

export default OnboardingRoute;