import Link from "next/link"
import { Button } from "@/components/ui/button"
import DashboardLayout from "@/components/dashboard-layout"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome to ResumeBuilder</h1>
          <p className="text-muted-foreground">Create and manage your professional resumes</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col space-y-4">
              <h3 className="text-xl font-semibold">Create New Resume</h3>
              <p className="text-muted-foreground">Start building a new professional resume from scratch</p>
              <Link href="/dashboard/details" className="mt-auto">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col space-y-4">
              <h3 className="text-xl font-semibold">Resume Templates</h3>
              <p className="text-muted-foreground">Choose from our collection of professional templates</p>
              <Button variant="outline" className="mt-auto w-full">
                Browse Templates
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col space-y-4">
              <h3 className="text-xl font-semibold">Resume Tips</h3>
              <p className="text-muted-foreground">Learn how to create a resume that stands out</p>
              <Button variant="outline" className="mt-auto w-full">
                View Tips
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

