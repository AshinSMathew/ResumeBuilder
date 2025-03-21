"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface Achievement {
  id: string
  title: string
  organization: string
  date: string
  description: string
}

interface AchievementsFormProps {
  resumeId: string; // Add resumeId as a prop
}

export default function AchievementsForm({ resumeId }: AchievementsFormProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "1",
      title: "",
      organization: "",
      date: "",
      description: "",
    },
  ])

  const handleChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAchievements((prev) => prev.map((ach) => (ach.id === id ? { ...ach, [name]: value } : ach)))
  }

  const addAchievement = () => {
    setAchievements((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: "",
        organization: "",
        date: "",
        description: "",
      },
    ])
  }

  const removeAchievement = (id: string) => {
    if (achievements.length > 1) {
      setAchievements((prev) => prev.filter((ach) => ach.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ achievements }), // Include resumeId and achievements in the request body
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      alert(data.message); // Show success message
      // Reset the form after successful submission
      setAchievements([{ id: "1", title: "", organization: "", date: "", description: "" }]);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form.');
    }
  };

  return (
    <div className="space-y-6">
      {achievements.map((achievement) => (
        <Card key={achievement.id} className="relative">
          <CardContent className="pt-6">
            <div className="absolute right-4 top-4 flex space-x-2">
              {achievements.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeAchievement(achievement.id)}>
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
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor={`date-${achievement.id}`}>Year</Label>
              <Input
                id={`date-${achievement.id}`}
                name="date"
                type="year"
                value={achievement.date}
                onChange={(e) => handleChange(achievement.id, e)}
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

      <Button type="button" variant="outline" className="w-full" onClick={addAchievement}>
        <Plus className="mr-2 h-4 w-4" />
        Add Achievement
      </Button>
      <Button type="submit" className="w-full mt-4" onClick={handleSubmit}>
        Save Achievements
      </Button>
    </div>
  )
}

