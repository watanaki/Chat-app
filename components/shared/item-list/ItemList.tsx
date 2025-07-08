"use client"

import { Card } from '@/components/ui/card';
import { useConversation } from '@/hooks/useConversation';
import { cn } from '@/lib/utils';
import React from 'react'

type Props = React.PropsWithChildren<{
  title: string,
  action?: React.ReactNode,
}>



const ItemList = ({ children, title, action: Action }: Props) => {
  const { isActive } = useConversation();
  return (
    <Card className={cn('hidden h-full w-full lg:flex-none lg:w-80 p-2 overflow-hidden', {
      "block": !isActive,
      "lg:block": isActive,
    })}>
      <div className='mb-4 flex items-center justify-between'>
        <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
        {Action ?? null}
      </div>
      <div className='px-1 py-2 w-full h-[calc(100%-3.5rem)] flex flex-col items-center justify-start gap-2 overflow-scroll no-scrollbar'>
        {children}
      </div>
    </Card>
  )
}

export default ItemList;