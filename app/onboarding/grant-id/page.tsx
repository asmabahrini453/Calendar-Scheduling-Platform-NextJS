import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import VideoGif from "@/public/work-is-almost-over-happy.gif"
import { CalendarCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const OnboardingroutTwo=()=>{
    //this route is meant to authenticate with Nylas to grant an id and email so
    //we will be able to authenticate to api req
    return(
        <div className="min-h-screen w-screen flex items-center justify-center">
            <Card>
                <CardHeader>
                    <CardTitle>You are almost Done ! </CardTitle>
                    <CardDescription>We have to now connect your calendar to your account</CardDescription>
                    <Image src={VideoGif} alt="Almost finished gif"
                    className="w-full rounded-lg"/>
                </CardHeader>

                <CardContent>
                    <Button asChild className="w-full">
                    {/* redirect to nylas dashboard */}
                        <Link href="/api/auth"> 
                        <CalendarCheck className="size-4 mr-2"></CalendarCheck>
                        Connect Calendar to your account
                        </Link>
                    </Button>
                </CardContent>
            </Card>

        </div>
    )

}

export default OnboardingroutTwo ;