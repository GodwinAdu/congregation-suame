import { currentUser } from "@/lib/helpers/session";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordChange } from "@/components/profile/password-change";
import { LocationUpdate } from "@/components/location/location-update";
import { EmergencyContactsForm } from "@/components/profile/emergency-contacts-form";
import { MedicalInfoForm } from "@/components/profile/medical-info-form";
import { ServicePreferencesForm } from "@/components/profile/service-preferences-form";
import { NotificationPreferencesForm } from "@/components/profile/notification-preferences-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const user = await currentUser();
    
    if (!user) {
        redirect("/sign-in");
    }

    return (
        <div className="container mx-auto px-4 py-4 sm:py-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Manage your personal information and account settings</p>
                </div>
                
                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="emergency">Emergency</TabsTrigger>
                        <TabsTrigger value="medical">Medical</TabsTrigger>
                        <TabsTrigger value="service">Service</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                        <ProfileForm user={user} />
                        <LocationUpdate currentLocation={user.location} />
                    </TabsContent>

                    <TabsContent value="emergency">
                        <EmergencyContactsForm contacts={user.emergencyContacts || []} />
                    </TabsContent>

                    <TabsContent value="medical">
                        <MedicalInfoForm medicalInfo={user.medicalInfo || {}} />
                    </TabsContent>

                    <TabsContent value="service">
                        <ServicePreferencesForm preferences={user.servicePreferences || {}} />
                    </TabsContent>

                    <TabsContent value="notifications">
                        <NotificationPreferencesForm preferences={user.notificationPreferences || {}} />
                    </TabsContent>

                    <TabsContent value="security">
                        <PasswordChange />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}