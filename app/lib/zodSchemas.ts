//for type safety validation : we create this schema to mention things we want to check on the format in the server
// to validate a form input
import { conformZodMessage } from '@conform-to/zod'
import{z} from 'zod'

export const onboardingSchema = z.object({
    fullName: z.string().min(3).max(150), //min,max length
    userName:z.string().min(3).max(150)
    .regex(/^[a-zA-Z0-9-]+$/, {
        message: 'Username can only contain letters, numbers, and hyphens'
     }), //no want spaces are allowed
})

//check if userName is unique or not
export function onboardingSchemaValidation(options?:{
    isUsernameUnique:()=> Promise<boolean>
}){
//run it async so we can fetch data from server and check uniqueness
    return z.object({
        userName:z.string().min(3).max(150)
        .regex(/^[a-zA-Z0-9-]+$/, {
            message: 'Username can only contain letters, numbers, and hyphens'
         }).pipe(
            //z.string().superRefine:allows to add custom validation logic (if username unique or not)
            //ctx: context obj allows a*us to throw validation errors
            z.string().superRefine((_,ctx)=>{
                if(typeof options?.isUsernameUnique !== "function"){
                    ctx.addIssue({
                        code:'custom',
                        message:conformZodMessage.VALIDATION_UNDEFINED,
                        fatal:true
                    });
                    return;
                }
                // This if block is checking whether the isUsernameUnique function is actually provided and is of type function.

                return options.isUsernameUnique().then((isUnique)=>{
                    if(!isUnique){
                        ctx.addIssue({
                            code:'custom',
                            message:"Username is already used",
                            fatal:true
                        });
                    }
                    //this if checks if userName unique or not
                })

            })
         ),
         //the fullname field was added to ensure the overall schema used for validation includes all the fields
         fullName: z.string().min(3).max(150)
    })
}

//settings schema
export const settingsSchema= z.object({
    fullName:z.string().min(3).max(150),
    profileImage: z.string(),
})


//Event type schema
export const eventTypeSchema= z.object({
    title: z.string().min(3).max(150),
  duration: z.number().min(1).max(100),
  url: z.string().min(3).max(150),
  description: z.string().min(3).max(300),
  videoCallSoftware: z.string(),
})
