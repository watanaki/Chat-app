import { Card } from '@/components/ui/card'
import { Id } from '@/convex/_generated/dataModel'
import React from 'react'

type Props = {
  id: Id<"requests">,
  imageUrl: string,
  username: string,
  email: string,

}

const Request = ({ id, imageUrl, username, email }: Props) => {
  return (
    <Card className='w-full p-2 flex flex-row items-center justify-between gap-2'></Card>
  )
}

export default Request;