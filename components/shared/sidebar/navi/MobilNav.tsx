"use client"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModeToggle } from '@/components/ui/theme/theme-toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigation } from '@/hooks/useNavigation'
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react'

const MobileNav = () => {
  const paths = useNavigation();
  return (
    <Card className='fixed bottom-4 w-[calc(100vw-32px)]
    flex items-center h-16 p-2 lg:hidden'>
      <nav className='w-full'>
        <ul className='flex justify-evenly items-center'>
          {
            paths.map((path, id) => {
              return (
                <li key={id} className='relative'>
                  <Link href={path.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button size="icon" variant={path.active ? "default" : "outline"}>
                            {path.icon}
                          </Button>
                          {path.count ? <Badge className='absolute left-6 bottom-7 px-2'>{path.count}</Badge> : null}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{path.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Link>
                </li>
              );
            })
          }
          <ModeToggle />
          <li>
            <UserButton />
          </li>
        </ul>
      </nav>
    </Card>
  );
}

export default MobileNav