"use client"
import LoadingLogo from '@/components/shared/LoadingLogo';
import { ClerkProvider, SignIn, SignInButton, useAuth, UserButton } from '@clerk/nextjs';
import { Authenticated, AuthLoading, ConvexReactClient, Unauthenticated } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const convex = new ConvexReactClient(CONVEX_URL);

const ConvexClientProvider = ({ children }: Props) => {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
        <AuthLoading>
          <LoadingLogo />
        </AuthLoading>
        <Authenticated>
          {children}
        </Authenticated>
        <Unauthenticated>
          <div className='flex justify-center item-center'>
            <SignIn />
          </div>
        </Unauthenticated>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};
/*
        
        <Unauthenticated>
          <SignIn />
        </Unauthenticated>
*/


export default ConvexClientProvider;