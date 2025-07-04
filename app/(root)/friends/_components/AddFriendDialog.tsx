"use client"

import React from 'react'
import { useForm } from 'react-hook-form';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { DialogTitle } from '@radix-ui/react-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useMutationState } from '@/hooks/useMutationState';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { ConvexError } from 'convex/values';

const addFriendFormSchema = z.object({
  email: z.string()
    .min(1, { message: "This field can't be empty" })
    .email("Please enter a valid email"),
});

const AddFriendDialog = () => {
  const { mutate: createRequest, pending } = useMutationState(api.request.create);

  const form = useForm<z.infer<typeof addFriendFormSchema>>({
    resolver: zodResolver(addFriendFormSchema),
    defaultValues: {
      email: ''
    }
  });

  const handleSubmit = async (values: z.infer<typeof addFriendFormSchema>) => {
    try {
      await createRequest({ email: values.email });
      form.reset();
      toast.success("Request has been sent!");
    } catch (e) {
      toast.error(e instanceof ConvexError ? e.data : "Unexpected error occurred!");
    }
  };

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size={"icon"} variant={"outline"}>
              <UserPlus />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Friends</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            Send a request to connect with your friends!
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
            <FormField control={form.control} name='email' render={({ field }) => (
              <FormItem>
                <FormLabel> Email </FormLabel>
                <FormControl>
                  <Input placeholder='email...' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />
            <DialogFooter>
              <Button disabled={pending} type="submit"> Send</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddFriendDialog;