import Image from "next/image";
import { Navbar } from "./components/navbar";
import { auth } from "./lib/auth";
import { redirect } from "next/navigation";
import { Hero } from "./components/Hero";
import { Logos } from "./components/Logos";
import { Features } from "./components/Features";
import { Testimonial } from "./components/Testimonial";
import { CTA } from "./components/CTA";
import StarsCanvas from "./components/threejs/Stars";

export default async function Home() {
  // Check if the user is authenticated
  const session = await auth();
  if(session?.user){
    return redirect("/dashboard")
  }
  

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <StarsCanvas />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Navbar />
        <Hero/>
        <Logos/>
        <Features/>
        <Testimonial/>
        <CTA/>
      </div>
    </div>
   
  );
}
