

import { getSession } from "./session";
import { fetchRole } from "../actions/role.actions";



export async function currentUserRole() {
    try {

        const user = await getSession();

        if (!user) {
            throw new Error('User not found');
        }

        const role = user?.role as string;
        const userRole = await fetchRole(role);

        console.log("User Role in get-user-role", userRole);

        if (!userRole) {
            console.log("cant find User role");
            return;
        }

        return userRole;

    } catch (error) {
        console.log("Error happen while fetching role", error)
    }
}