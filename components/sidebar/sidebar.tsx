import { NavMain } from "./nav-main"


const SideContent = ({ role,user}: { role:any,user:any }) => {

    return (
        <>
            <NavMain user={user} role={role} />
        </>
    )
}

export default SideContent
