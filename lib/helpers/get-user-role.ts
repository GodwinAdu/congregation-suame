

import { currentUser, } from "./session";
import { fetchRole } from "../actions/role.actions";



export async function currentUserRole() {
    try {

        const user = await currentUser();

        if (!user) {
            throw new Error('User not found');
        }

        const role = user?.role as string;
        const userRole = await fetchRole(role);


        if (!userRole) {
            console.log("cant find User role");
            return;
        }

        return userRole;

    } catch (error) {
        console.log("Error happen while fetching role", error)
    }
}