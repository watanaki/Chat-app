import { UploadDropzone } from '@/lib/uploadthing';
import { UploadThingError } from "uploadthing/server";
import { Json } from "@uploadthing/shared";
import React from 'react';
import { toast } from 'sonner';

type Props = {
  onChange: (infos: { url: string, name: string }[]) => void,
  type: "image" | "file"
}

const Uploader = ({ type, onChange }: Props) => {
  return (
    <UploadDropzone
      endpoint={type}
      onClientUploadComplete={res => onChange(res.map(item => ({ url: item.ufsUrl, name: item.name })))}
      onUploadError={(error: UploadThingError<Json>) => { toast.error(error.message); }}
    />
  )
}

export default Uploader;