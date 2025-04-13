"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import LoadingSpinner from "@/components/loading-spinner"

interface Achievement {
  id: string
  title: string
  organization: string
  date: string
  description: string
}

export default function AchievementsForm() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch("/api/achievements")
        if (response.ok) {
          const data = await response.json()
          if (data.achievements && data.achievements.length > 0) {
            setAchievements(
              data.achievements.map((ach: any) => ({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                ...ach,
              })),
            )
          } else {
            setAchievements([createEmptyAchievement()])
          }
        }
      } catch (error) {
        console.error("Error fetching achievements:", error)
        setAchievements([createEmptyAchievement()])
        toast({
          title: "Error",
          description: "Failed to load achievements",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAchievements()
  }, [toast])

  const createEmptyAchievement = (): Achievement => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title: "",
    organization: "",
    date: "",
    description: "",
  })

  const handleChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAchievements((prev) => prev.map((ach) => (ach.id === id ? { ...ach, [name]: value } : ach)))
  }

  const addAchievement = () => {
    setAchievements((prev) => [...prev, createEmptyAchievement()])
  }

  const removeAchievement = (id: string) => {
    if (achievements.length > 1) {
      setAchievements((prev) => prev.filter((ach) => ach.id !== id))
    } else {
      toast({
        title: "Cannot remove",
        description: "You must have at least one achievement",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const achievementsToSave = achievements.map(({ id, ...rest }) => rest)

    try {
      const response = await fetch("/api/achievements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ achievements: achievementsToSave }),
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: data.message || "Achievements saved successfully",
        variant: "success",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "There was an error saving your achievements",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner text="Loading achievements..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        {achievements.map((achievement) => (
          <Card key={achievement.id} className="relative mb-4">
            <CardContent className="pt-6">
              <div className="absolute right-4 top-4 flex space-x-2">
                {achievements.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeAchievement(achievement.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`title-${achievement.id}`}>Achievement Title</Label>
                  <Input
                    id={`title-${achievement.id}`}
                    name="title"
                    value={achievement.title}
                    onChange={(e) => handleChange(achievement.id, e)}
                    placeholder="Hackathon Winner, Volunteer Award, etc."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`organization-${achievement.id}`}>Organization</Label>
                  <Input
                    id={`organization-${achievement.id}`}
                    name="organization"
                    value={achievement.organization}
                    onChange={(e) => handleChange(achievement.id, e)}
                    placeholder="Organization Name"
                    required
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor={`date-${achievement.id}`}>Year</Label>
                <Input
                  id={`date-${achievement.id}`}
                  name="date"
                  type="text"
                  value={achievement.date}
                  onChange={(e) => handleChange(achievement.id, e)}
                  placeholder="2023"
                />
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor={`description-${achievement.id}`}>Description</Label>
                <Textarea
                  id={`description-${achievement.id}`}
                  name="description"
                  value={achievement.description}
                  onChange={(e) => handleChange(achievement.id, e)}
                  placeholder="Describe the achievement and its significance"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="outline" className="w-full mb-4" onClick={addAchievement}>
          <Plus className="mr-2 h-4 w-4" />
          Add Achievement
        </Button>

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Achievements"
          )}
        </Button>
      </form>
    </div>
  )
}
