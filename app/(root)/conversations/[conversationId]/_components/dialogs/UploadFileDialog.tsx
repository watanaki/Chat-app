import Uploader from '@/components/shared/Uploader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { api } from '@/convex/_generated/api';
import { useConversation } from '@/hooks/useConversation';
import { useMutationState } from '@/hooks/useMutationState';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogContent } from '@radix-ui/react-dialog';
import { ConvexError } from 'convex/values';
import { File, Image } from 'lucide-react';
import React from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod'

type Props = {
  open: boolean,
  toggle: (newState: boolean) => void,
  type: "image" | "file"
}

const uploadFileSchema = z.object({
  files: z.string().array().min(1, { message: "You must select at least 1 file" })
});

const UploadFileDialog = ({ open, toggle, type }: Props) => {
  const form = useForm<z.infer<typeof uploadFileSchema>>({
    resolver: zodResolver(uploadFileSchema),
    defaultValues: {
      files: []
    }
  });

  const files = form.watch("files");

  const { conversationId } = useConversation();
  const { mutate: createMessage, pending } = useMutationState(api.message.create);

  const handleSubmit = async (values: z.infer<typeof uploadFileSchema>) => {
    try {
      await createMessage({
        conversationId,
        type,
        content: values.files
      });
      form.reset();
      toggle(false);
    } catch (e) {
      toast.error(e instanceof ConvexError ? e.data : "Unexpected error occurred");
    }
  }

  return (
    <Dialog open={open} onOpenChange={open => toggle(open)}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          {type === "image" ? <Image /> : <File />}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle> Upload files </DialogTitle>
          <DialogDescription>{
            type === "image" ?
              "Upload images and videos!" :
              "Upload images, videos, audio and PDFs!"
          }</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField control={form.control} name='files' render={() => {
              return <FormItem>
                <FormControl>
                  <div className="py-4">
                    <Uploader type={type} onChange={urls => {
                      form.setValue("files", [...files, ...urls]);
                    }} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            }} />
            <DialogFooter>
              <Button disabled={!files.length || pending} type='submit'>Send</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default UploadFileDialog;