"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel'
import { useMutationState } from '@/hooks/useMutationState';
import { ConvexError } from 'convex/values';
import React, { Dispatch, SetStateAction } from 'react'
import { toast } from 'sonner';

type Props = {
  conversationId: Id<"conversations">;
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>
}

const DeleteGroupDialog = ({ conversationId, open, setOpen }: Props) => {
  const { mutate: removeGroup, pending } = useMutationState(api.conversation.removeGroup);
  const handleRemoveGroup = async () => {
    try {
      await removeGroup({ id: conversationId });
      toast.success("Group removed");
    } catch (e) {
      toast.error(e instanceof ConvexError ? e.data : "Unexpected error occurred");
    }
  }
  return <AlertDialog open={open} onOpenChange={setOpen}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          Are you sure?
        </AlertDialogTitle>
        <AlertDialogDescription>
          This action can not be undone. All messages will be deleted and you will not ne able to
          message this group.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
        <AlertDialogAction disabled={pending} onClick={handleRemoveGroup}>Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
}

export default DeleteGroupDialog;