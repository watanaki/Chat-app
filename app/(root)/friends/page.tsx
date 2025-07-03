"use client"

import ConversationFallback from '@/components/shared/conversations/ConversationFallback';
import ItemList from '@/components/shared/item-list/ItemList';
import React from 'react'
import AddFriendDialog from './_components/AddFriendDialog';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Loader2 } from 'lucide-react';
import Request from './_components/Request';
// import { useMutationState } from '@/hooks/useMutationState';

const FriendsPage = () => {

  const requests = useQuery(api.requests.get);

  // const { mutate: createFriends, pending} = useMutationState(api.test.createFriends);

  // const handleCreateFriends = async () => {
  //   try {
  //     await createFriends({});
  //   } catch (err) {
  //     throw err;
  //   }

  // }

  return (
    <>
      <ItemList title='Friends' action={<AddFriendDialog />}>
        {requests ?
          requests.length === 0 ?
            <p className='w-full h-full flex items-center justify-center'>No friend request found</p>
            : requests.map(({ request, sender }) => {
              return <Request
                key={request._id}
                id={request._id}
                imageUrl={sender.imageUrl}
                username={sender.username}
                email={sender.email}
              />
            })
          : <Loader2 className='h-8 w-8' />}
      </ItemList>
      {/* <Button onClick={handleCreateFriends} disabled={pending}>insert data</Button> */}
      <ConversationFallback />
    </>
  )
}

export default FriendsPage;