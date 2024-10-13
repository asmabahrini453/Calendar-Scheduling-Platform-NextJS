"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "./SubmitButtons"
import { useFormState } from "react-dom"
import { SettingsAction } from "../actions"
import { useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { settingsSchema } from "../lib/zodSchemas"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { UploadDropzone } from "../lib/uploadThing"
import { toast } from "sonner"

//this interface to fill the form with user info
interface iAppProps{
    fullName: string, 
    email:string ,
    profileImage:string,
}

export function SettingsForm({fullName , email, profileImage}:iAppProps){
  //fetch data from server action : settingsAction
    const [lastResult , action] = useFormState(SettingsAction,undefined)
    //state where we store image
    const [currentProfileImage,setCurrentProfileImage]=useState(profileImage)
  //validate on client side with conform
  const[form,fields]=useForm({
    lastResult,
    onValidate({formData}){
        return parseWithZod(formData,{
            schema: settingsSchema
        });
    },
    shouldValidate:'onBlur',
    shouldRevalidate:"onInput"
  })

  //delete the img
  const handleDeleteImage=()=>{
    setCurrentProfileImage("")
  }
    return(
        <Card>
        <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <form id={form.id} onSubmit={form.onSubmit} action={action} noValidate>
            <CardContent className="flex flex-col gap-y-4" >
                <div className="flex flex-col gap-y-2">
                    <Label>Full Name</Label>
                    <Input name={fields.fullName.name}
                    key={fields.fullName.key}
                     defaultValue={fullName} placeholder="Asma Bahrini"/>
                <p className="text-red-500">{fields.fullName.errors}</p>
                </div>
                <div className="flex flex-col gap-y-2">
                    <Label>Email</Label>
                    <Input
                     disabled defaultValue={email} placeholder="test@test.com"/>
                </div>
                <div className="grid gap-y-5">
                    <Label>Profile Image</Label>
                    <input type="hidden" 
                    name={fields.profileImage.name}
                    key={fields.profileImage.key}
                    value={currentProfileImage}
                    />
                    {/* if we have a currentimg then display it if not then say no img */}
                    {currentProfileImage ? (
                      <div className="relative size-16">
                          <img src={currentProfileImage} alt="Profile Image"
                        className="size-16 rounded-lg"/>
                        <Button variant="destructive"
                        onClick={handleDeleteImage}
                        type="button"
                         size="icon" 
                         className="size-5 absolute -top-3 -right-3">
                            {/* delete icon imported from lucide react */}
                            <X className="size-4"/>
                        </Button>
                    </div>
                    ):(
                    
                        <UploadDropzone onClientUploadComplete={(res)=>{
                            setCurrentProfileImage(res[0].url),
                            toast.success("Profile image has been uploaded.")
                        }}
                        onUploadError={(error)=>{
                            console.log("error",error),
                            toast.success(error.message)

                        }}
                         endpoint="imageUploader"/>
                    )
                }
                <p className="text-red-500">{fields.profileImage.errors}</p>
                </div>
            </CardContent>
            <CardFooter>
                <SubmitButton text="Save changes"/>
            </CardFooter>
        </form>
    </Card>
    )
}