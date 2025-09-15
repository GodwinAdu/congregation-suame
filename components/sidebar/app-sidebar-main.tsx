import React from 'react'
import { AppSidebar } from './app-sidebar'
import { currentUserRole } from '@/lib/helpers/get-user-role';
import { currentUser } from '@/lib/helpers/session';


const AppSidebarMain = async () => {

    const [user,userRole] = await Promise.all([
        currentUser(),
        currentUserRole(),
    ])


    return (
        <>
            <AppSidebar userRole={userRole as IRole}  user={user} />
        </>
    )
}

export default AppSidebarMain
