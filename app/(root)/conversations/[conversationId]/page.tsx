"use client"

import ConversationContainer from "@/components/shared/conversations/ConversationContainer";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import Header from "./_components/Header";
import Body from "./_components/body/Body";
import ChatInput from "./_components/input/ChatInput";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import RemoveFriendDialog from "./_components/dialogs/RemoveFriendDialog";
import DeleteGroupDialog from "./_components/dialogs/DeleteGroupDialog";
import LeaveGroupDialog from "./_components/dialogs/LeaveGroupDialog";

const ConversationPage = () => {
  const params = useParams<{ conversationId: Id<"conversations"> }>();
  const { conversationId } = params;
  const conversation = useQuery(api.conversation.get, { id: conversationId });

  const [removeFriendDialogOpen, setRemoveFriendDialogOpen] = useState(false);
  const [deleteGroupDialogOpen, setdeleteGroupDialogOpen] = useState(false);
  const [leaveGroupDialogOpen, setleaveGroupDialogOpen] = useState(false);
  const [callType, setCallType] = useState<"audio" | 'video' | null>(null);

  return conversation === undefined ?
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="h-8 w-8" />
    </div>
    :
    conversation === null ?
      <p className="w-full h-full flex items-center justify-center">Conversation not found</p>
      :
      <ConversationContainer>
        <RemoveFriendDialog
          conversationId={conversationId}
          open={removeFriendDialogOpen}
          setOpen={setRemoveFriendDialogOpen}
        />
        <DeleteGroupDialog
          conversationId={conversationId}
          open={deleteGroupDialogOpen}
          setOpen={setdeleteGroupDialogOpen}
        />
        <LeaveGroupDialog
          conversationId={conversationId}
          open={leaveGroupDialogOpen}
          setOpen={setleaveGroupDialogOpen}
        />
        <Header
          name={(conversation.isGroup ? conversation.name : conversation.otherMember?.username) || ""}
          imageUrl={conversation.isGroup ? undefined : conversation.otherMember?.imageUrl}
          options={conversation.isGroup ? [
            { label: 'Leave group', destructive: false, onClick: () => setleaveGroupDialogOpen(true) },
            { label: 'Delete group', destructive: true, onClick: () => setdeleteGroupDialogOpen(true) },
          ] : [{ label: 'Remove friend', destructive: true, onClick: () => setRemoveFriendDialogOpen(true) }]}
        />
        <Body members={conversation.isGroup ?
          conversation.otherMembers ?? [] :
          conversation.otherMember ? [conversation.otherMember] : []} />
        <ChatInput />
      </ConversationContainer>;
}

export default ConversationPage;