"use server"

import { compare } from "bcryptjs";
import User from "../models/user.models";
import { connectToDB } from "../mongoose";
import { createActivity } from "./activity.actions";
import { login } from "../helpers/session";



export const loginUser = async (values: { email: string; password: string; rememberMe?: boolean }) => {
    try {
        const { email, password, rememberMe } = values;

        if (!email || !password) throw new Error("Missing fields for login");

        await connectToDB();

        const user = await User.findOne({ email })


        if (!user) throw new Error(`${email} not found`);

        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) throw new Error("Invalid password");

        await login(user._id as string, user.role, rememberMe)
        await createActivity({
            userId: user._id as string,
            type: 'login',
            action: `User logged in`,
            details: { entityId: user._id, entityType: 'User' },
        });

        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error("Error while logging in user", error);
        throw error;
    }
};

