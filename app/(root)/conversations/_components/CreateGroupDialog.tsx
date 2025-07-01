import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { api } from '@/convex/_generated/api';
import { useMutationState } from '@/hooks/useMutationState';
import { zodResolver } from '@hookform/resolvers/zod';
import { } from '@radix-ui/react-alert-dialog';
import { useQuery } from 'convex/react';
import { ConvexError } from 'convex/values';
import { CirclePlusIcon, Flag, X } from 'lucide-react';
import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod'

type Props = {}

const createGroupFormSchema = z.object({
  name: z.string().min(1, { message: "This field can not be empty" }),
  members: z.string().array().min(1, { message: "You must select at least one friend" })
});

const CreateGroupDialog = (props: Props) => {
  const [selectAll, setSelect] = useState(false);
  const friends = useQuery(api.friends.get);
  const { mutate: createGroup, pending } = useMutationState(api.conversation.createGroup);

  const form = useForm<z.infer<typeof createGroupFormSchema>>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      name: "",
      members: []
    }
  });

  const members = form.watch("members", []);
  const unselectedFriends = useMemo(() => {
    return friends ? friends.filter(friend => !members.includes(friend._id)) : []
  }, [members.length, friends?.length])

  const handleSubmit = async (values: z.infer<typeof createGroupFormSchema>) => {
    try {
      await createGroup({ name: values.name, members: values.members });
      form.reset();
      toast.success("Group created!");
    } catch (err) {
      toast.error(err instanceof ConvexError ? err.data : "Unexpected error occurred");
    }
  }

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) { form.reset(); setSelect(false) };
    }}>
      <Tooltip>
        <TooltipTrigger>
          <Button size="icon" variant="outline" asChild>
            <DialogTrigger asChild>
              <CirclePlusIcon />
            </DialogTrigger>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Create group
        </TooltipContent>
      </Tooltip>
      <DialogContent className='block'>
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>
            Add your friends to get started!
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
            <FormField control={form.control} name='name' render={({ field }) => {
              return <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Group name...' {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            }} />
            <FormField control={form.control} name='members' render={({ field }) => {
              return <FormItem>
                <FormLabel>Friends</FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild >
                      <Button className='w-full' variant="outline">Select</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-full max-h-52 overflow-y-auto no-scrollbar'>

                      <DropdownMenuCheckboxItem checked={selectAll} onCheckedChange={(checked) => {
                        setSelect(checked);
                        form.setValue("members", checked ? friends!.map(friend => friend._id) : []);
                      }} >
                        <div className="flex w-full p-2 gap-2 items-center justify-center">
                          Select All
                        </div>
                      </DropdownMenuCheckboxItem>

                      {
                        unselectedFriends.map(friend => {
                          return (
                            <DropdownMenuCheckboxItem key={friend._id} className='flex w-full p-2 gap-2 items-center'
                              onCheckedChange={
                                checked => {
                                  if (checked) {
                                    form.setValue("members", [...members, friend._id])
                                    form.clearErrors("members");
                                  }
                                }
                              }
                            >
                              <Avatar className='w-8 h-8'>
                                <AvatarImage src={friend.imageUrl} />
                                <AvatarFallback>
                                  {friend.username.substring(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              <h4 className='truncate'>
                                {friend.username}
                              </h4>
                            </DropdownMenuCheckboxItem>
                          )
                        })
                      }
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                <FormMessage />
              </FormItem>
            }} />
            {
              members && members.length ?
                <Card className='flex items-center gap-3 h-28 p-2 overflow-x-auto overflow-y-hidden w-full'>
                  {
                    // friends?.filter(friend => members.includes(friend._id)).map(friend => {
                    members.map(id => {
                      const friend = friends?.find(friend => friend._id === id)!
                      return <div key={friend._id} className='flex flex-col gap-1 items-center'>
                        <div className='relative'>
                          <Avatar className='w-12 h-12'>
                            <AvatarImage src={friend.imageUrl} />
                            <AvatarFallback>
                              {friend.username.substring(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <X className='text-muted-foreground w-4 h-4 absolute bottom-9 left-9 bg-muted rounded-full cursor-pointer'
                            onClick={() => {
                              form.setValue("members", members.filter(id => id !== friend._id));
                              setSelect(false);
                            }}
                          />
                        </div>
                        <p className='truncate text-sm'> {friend.username.split(' ')[0]} </p>
                      </div>
                    })
                  }
                </Card>
                : null
            }
            <DialogFooter>
              <Button disabled={pending} type='submit'>Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateGroupDialog;