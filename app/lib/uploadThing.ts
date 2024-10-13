import {
    generateUploadButton,
    generateUploadDropzone,
  } from "@uploadthing/react";
import type { OurFileRouter } from "../api/uploadthing/core";
  
  //we re assigned the comp with the ourFileRouter type 
  export const UploadButton = generateUploadButton<OurFileRouter>();
  export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
  