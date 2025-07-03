"use client"

import ItemList from '@/components/shared/item-list/ItemList';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Loader2 } from 'lucide-react';
import React from 'react'
import DMConversationItem from './_components/DMConversationItem';
import CreateGroupDialog from './_components/CreateGroupDialog';
import GroupConversationItem from './_components/GroupConversationItem';

type Props = React.PropsWithChildren

const ConversationPage = ({ children }: Props) => {

  const conversations = useQuery(api.conversations.get);

  return (
    <>
      <ItemList title='Conversations' action={<CreateGroupDialog />}>
        {
          conversations ?
            conversations.length === 0 ? <p className='w-full h-full flex items-center justify-center'>No conversations found</p>
              : conversations.map(item => {
                return item.conversation.isGroup ? <GroupConversationItem
                  key={item.conversation._id}
                  id={item.conversation._id}
                  name={item.conversation.name || ""}
                  lastMessageSender={item.lastMessage?.sender}
                  lastMessageContent={item.lastMessage?.content}
                  unseenCount={item.unseenCount}
                /> :
                  <DMConversationItem
                    key={item.conversation._id}
                    id={item.conversation._id}
                    imageUrl={item.otherMember?.imageUrl || ""}
                    username={item.otherMember?.username || ""}
                    lastMessageSender={item.lastMessage?.sender}
                    lastMessageContent={item.lastMessage?.content}
                    unseenCount={item.unseenCount}
                  />
              })
            : <Loader2 />
        }
      </ItemList>
      {children}
    </>
  )
}

export default ConversationPage;