'use client' //because we need js buncle when using onSelect
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

const CopyLinkMenuItem = ({ meetingUrl }: { meetingUrl: string }) => {
  const handleCopy= async()=>{
    try{
        await navigator.clipboard.writeText(meetingUrl);
        toast.success("URL has been copied")

    }catch(e){
        toast.success("could not copy URL ")
    }
  }
    return (
    <DropdownMenuItem onSelect={handleCopy} >
      <Link2 className="mr-2 w-4 h-4"  />
      Copy
    </DropdownMenuItem>
  );
};

export default CopyLinkMenuItem;
