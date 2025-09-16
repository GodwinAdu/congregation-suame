import { currentUser } from "@/lib/helpers/session";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordChange } from "@/components/profile/password-change";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const user = await currentUser();
    
    if (!user) {
        redirect("/sign-in");
    }

    return (
        <div className="container mx-auto py-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">My Profile</h1>
                    <p className="text-muted-foreground">Manage your personal information and account settings</p>
                </div>
                
                <div className="space-y-6">
                    <ProfileForm user={user} />
                    <PasswordChange />
                </div>
            </div>
        </div>
    );
}