import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default async function HomePage() {

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/subtle-spiritual-pattern-with-light-rays.jpg')] bg-cover bg-center opacity-5"></div>

        {/* Content Container */}
        <div className="relative container mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-balance leading-tight">
                <span className="text-foreground">Administrator Portal</span>
                <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Suame JW Congregation
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                Manage congregation activities, members, and administrative tasks with secure access
              </p>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
              href="/sign-in"
                className={cn(buttonVariants({size:"lg"}),"bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105")}
              >
                Admin Sign In
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground  text-lg font-semibold rounded-xl transition-all duration-300 bg-transparent"
              >
                Request Access
              </Button>
            </div>

            {/* Feature Cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-16">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-card-foreground">Member Management</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Manage congregation members, records, and contact information
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v2"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-card-foreground">Secure Access</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Role-based permissions and secure administrative controls
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-card-foreground">Reports & Analytics</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Generate reports and track congregation activities and attendance
                  </p>
                </div>
              </Card>
            </div> */}

            {/* Admin Information */}
            <div className="mt-12 p-6 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 w-full max-w-2xl">
              <h3 className="text-xl font-semibold text-center mb-4 text-card-foreground">Administrator Access</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                <div>
                  <p className="font-medium text-primary">Elders & MS</p>
                  <p className="text-muted-foreground">Full Access</p>
                </div>
                <div>
                  <p className="font-medium text-primary">Secretary</p>
                  <p className="text-muted-foreground">Records Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
