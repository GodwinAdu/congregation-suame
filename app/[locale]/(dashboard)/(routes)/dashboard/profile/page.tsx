import { currentUser } from "@/lib/helpers/session";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordChange } from "@/components/profile/password-change";
import { LocationUpdate } from "@/components/location/location-update";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const user = await currentUser();
    
    if (!user) {
        redirect("/sign-in");
    }

    return (
        <div className="container mx-auto px-4 py-4 sm:py-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Manage your personal information and account settings</p>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                    <ProfileForm user={user} />
                    <LocationUpdate currentLocation={user.location} />
                    <PasswordChange />
                </div>
            </div>
        </div>
    );
}