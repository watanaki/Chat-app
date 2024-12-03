import SidebarWrapper from '@/components/sidebar/SidebarWrapper';
import React from 'react'

type Props = React.PropsWithChildren<{}>;

const Layout = ({ children }: Props) => {
  return (
    <SidebarWrapper>
      {children}
    </SidebarWrapper>
  )
}

export default Layout;