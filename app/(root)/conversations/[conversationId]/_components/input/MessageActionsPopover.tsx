import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@/components/ui/button';
import { PlusCircle, Smile } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from "react";
import UploadFileDialog from "../dialogs/UploadFileDialog";

type Props = {
  setEmojiPickerOpen: Dispatch<SetStateAction<boolean>>
}

const MessageActionsPopover = ({ setEmojiPickerOpen }: Props) => {
  const [uploadFileDialogOpen, setUploadFileDialogOpen] = useState(false);
  const [uploadImageDialogOpen, setUploadImageDialogOpen] = useState(false);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="secondary">
          <PlusCircle />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full mb-1 flex flex-col gap-2'>
        <Button variant="outline" onClick={() => { setEmojiPickerOpen(true) }} size="icon">
          <Smile />
        </Button>
        <UploadFileDialog open={uploadFileDialogOpen} type="file" toggle={setUploadFileDialogOpen} />
        <UploadFileDialog open={uploadImageDialogOpen} type="image" toggle={setUploadImageDialogOpen} />
      </PopoverContent>
    </Popover>
  )
}

export default MessageActionsPopover;