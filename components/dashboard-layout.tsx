"use client";

import type React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserCircle, FileText, Settings, LogOut } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Important for cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Also clear any client-side storage for good measure
        localStorage.removeItem("authToken");
        
        // Navigate to login page
        router.push("/");
      } else {
        console.error("Logout failed:", await response.text());
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: force navigate even if the API call fails
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center">
            <h1 className="text-2xl font-bold">ResumeBuilder</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <UserCircle className="h-8 w-8" />
              <span className="sr-only">Profile</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 lg:block">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-auto py-6">
              <nav className="grid items-start px-4 text-sm font-medium">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-primary hover:bg-muted"
                >
                  <FileText className="h-4 w-4" />
                  My Resumes
                </Link>
                <Link
                  href="/dashboard/details"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted"
                >
                  <FileText className="h-4 w-4" />
                  Create Resume
                </Link>
              </nav>
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}