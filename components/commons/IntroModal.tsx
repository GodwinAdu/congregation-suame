"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    School,
    Calendar,
    Users,
    BookOpen,
    BarChart,
    MessageSquare,
    Bell,
    AlertTriangle,
    CheckCircle2,
    Sparkles,
    ArrowRight,
} from "lucide-react"
import { useModalStore } from "@/hooks/use-store-intro"

const IntroModal = () => {
    const { isOpen, lastOpened, openModal, closeModal, reset } = useModalStore();
    const [activeTab, setActiveTab] = useState("welcome");

    useEffect(() => {
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const now = Date.now();

        if (!lastOpened || now - lastOpened >= twentyFourHours) {
            setTimeout(() => {
                openModal();
                reset(); // Ensure lastOpened updates after opening
            }, 3000);
        }
    }, [lastOpened, openModal, reset]);


    const features = [
        {
            icon: <Users className="h-5 w-5 text-primary" />,
            title: "Student Management",
            description: "Comprehensive student profiles, attendance tracking, and performance analytics.",
        },
        {
            icon: <BookOpen className="h-5 w-5 text-primary" />,
            title: "Curriculum Planning",
            description: "Design, organize, and distribute course materials with ease.",
        },
        {
            icon: <Calendar className="h-5 w-5 text-primary" />,
            title: "Scheduling",
            description: "Automated timetable generation and event management.",
        },
        {
            icon: <BarChart className="h-5 w-5 text-primary" />,
            title: "Assessment & Grading",
            description: "Create assessments, record grades, and generate detailed reports.",
        },
        {
            icon: <MessageSquare className="h-5 w-5 text-primary" />,
            title: "Communication",
            description: "Integrated messaging system for students, teachers, and parents.",
        },
        {
            icon: <Bell className="h-5 w-5 text-primary" />,
            title: "Notifications",
            description: "Real-time alerts for important events, deadlines, and announcements.",
        },
    ]

    const upcomingFeatures = [
        "Mobile application for on-the-go access",
        "AI-powered learning recommendations",
        "Advanced analytics dashboard",
        "Integration with popular learning management systems",
        "Virtual classroom capabilities",
    ]

    return (
        <Dialog open={isOpen} onOpenChange={closeModal}>
            <DialogContent className="w-[96%] max-w-5xl max-h-[90vh] overflow-y-auto p-0">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <School className="h-8 w-8 text-primary" />
                            <DialogTitle className="text-2xl font-bold">CampusIQ</DialogTitle>
                            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                                <Sparkles className="h-3 w-3 mr-1" />
                                BETA
                            </Badge>
                        </div>
                    </div>
                    <DialogDescription className="text-base">The next generation school management platform</DialogDescription>

                    <Tabs defaultValue="welcome" className="mt-6 w-full">
                        <div className="sticky top-0 z-10 bg-background">
                            <TabsList className="grid grid-cols-3 w-full">
                                <TabsTrigger value="welcome">Welcome</TabsTrigger>
                                <TabsTrigger value="features">Features</TabsTrigger>
                                <TabsTrigger value="updates">Updates</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="welcome" className="mt-4 space-y-4">
                            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 mt-6">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Beta Version Notice</h3>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                            CampusIQ is currently in beta. We&apos;re working hard to complete all planned features and improve
                                            stability. If you encounter any issues, we sincerely apologize and encourage you to report them
                                            through the feedback form. Your input is invaluable in helping us create the best possible
                                            experience.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Welcome to the Future of Education Management
                                </h3>
                                <p className="text-muted-foreground">
                                    CampusIQ is revolutionizing how educational institutions operate by providing a comprehensive,
                                    intuitive platform that streamlines administrative tasks, enhances communication, and improves
                                    learning outcomes.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Why CampusIQ?</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-primary/10 p-2 rounded-full">
                                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">All-in-One Solution</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Everything you need to manage your educational institution in one platform.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-primary/10 p-2 rounded-full">
                                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">User-Friendly Interface</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Intuitive design that requires minimal training to master.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-primary/10 p-2 rounded-full">
                                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">Data-Driven Insights</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Make informed decisions with comprehensive analytics and reporting.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-primary/10 p-2 rounded-full">
                                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">Continuous Improvement</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Regular updates and new features based on user feedback.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="features" className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="bg-primary/10 p-2 rounded-full">{feature.icon}</div>
                                        <div>
                                            <h3 className="font-medium">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Coming Soon
                                </h3>
                                <ul className="space-y-2">
                                    {upcomingFeatures.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm">
                                            <ArrowRight className="h-4 w-4 text-primary" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </TabsContent>

                        <TabsContent value="updates" className="mt-4 space-y-4">
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge
                                            variant="outline"
                                            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900"
                                        >
                                            Latest
                                        </Badge>
                                        <h3 className="font-semibold">Version 0.9.2 - March 2025</h3>
                                    </div>
                                    <ul className="space-y-2 ml-5 list-disc text-sm text-muted-foreground">
                                        <li>Enhanced dashboard with customizable widgets</li>
                                        <li>Improved performance for large datasets</li>
                                        <li>New attendance tracking features</li>
                                        <li>Bug fixes and UI improvements</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">Version 0.9.1 - February 2025</h3>
                                    <ul className="space-y-2 ml-5 list-disc text-sm text-muted-foreground">
                                        <li>Added export functionality for reports</li>
                                        <li>Implemented dark mode support</li>
                                        <li>Enhanced notification system</li>
                                        <li>Fixed critical bugs in grading module</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">Version 0.9.0 - January 2025</h3>
                                    <ul className="space-y-2 ml-5 list-disc text-sm text-muted-foreground">
                                        <li>Initial beta release</li>
                                        <li>Core functionality implemented</li>
                                        <li>Basic reporting and analytics</li>
                                        <li>User management and role-based access</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mt-6">
                                <div className="flex items-start gap-3">
                                    <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Stay Updated</h3>
                                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                            We&apos;re constantly improving CampusIQ based on your feedback. Check back regularly for new features
                                            and improvements. Follow us on social media or subscribe to our newsletter to stay informed about
                                            the latest updates.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="sticky bottom-0 w-full bg-background p-6 border-t">
                    <div className="flex flex-col sm:flex-row justify-between w-full gap-4 items-center">
                        <p className="text-sm text-muted-foreground">
                            {activeTab === "welcome"
                                ? "Thank you for choosing CampusIQ for your educational institution."
                                : activeTab === "features"
                                    ? "We're constantly adding new features based on user feedback."
                                    : "We appreciate your patience as we continue to improve CampusIQ."}
                        </p>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default IntroModal

