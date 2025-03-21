"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface Experience {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

interface ExperienceFormProps {
  resumeId: string; // Add resumeId as a prop
}

export default function ExperienceForm({ resumeId }: ExperienceFormProps) {
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: "1",
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ])

  const handleChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setExperiences((prev) => prev.map((exp) => (exp.id === id ? { ...exp, [name]: value } : exp)))
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, current: checked, endDate: checked ? "" : exp.endDate } : exp)),
    )
  }

  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ])
  }

  const removeExperience = (id: string) => {
    if (experiences.length > 1) {
      setExperiences((prev) => prev.filter((exp) => exp.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ experiences }), // Include resumeId and experiences in the request body
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      alert(data.message); // Show success message
      // Reset the form after successful submission
      setExperiences([{ id: "1", company: "", position: "", location: "", startDate: "", endDate: "", current: false, description: "" }]);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form.');
    }
  };

  return (
    <div className="space-y-6">
      {experiences.map((experience) => (
        <Card key={experience.id} className="relative">
          <CardContent className="pt-6">
            <div className="absolute right-4 top-4 flex space-x-2">
              {experiences.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeExperience(experience.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`company-${experience.id}`}>Company</Label>
                <Input
                  id={`company-${experience.id}`}
                  name="company"
                  value={experience.company}
                  onChange={(e) => handleChange(experience.id, e)}
                  placeholder="Company Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`position-${experience.id}`}>Position</Label>
                <Input
                  id={`position-${experience.id}`}
                  name="position"
                  value={experience.position}
                  onChange={(e) => handleChange(experience.id, e)}
                  placeholder="Job Title"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor={`location-${experience.id}`}>Location</Label>
              <Input
                id={`location-${experience.id}`}
                name="location"
                value={experience.location}
                onChange={(e) => handleChange(experience.id, e)}
                placeholder="City, Country or Remote"
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`startDate-${experience.id}`}>Start Date</Label>
                <Input
                  id={`startDate-${experience.id}`}
                  name="startDate"
                  type="year"
                  value={experience.startDate}
                  onChange={(e) => handleChange(experience.id, e)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`endDate-${experience.id}`}>End Date</Label>
                <Input
                  id={`endDate-${experience.id}`}
                  name="endDate"
                  type="year"
                  value={experience.endDate}
                  onChange={(e) => handleChange(experience.id, e)}
                  disabled={experience.current}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <Checkbox
                id={`current-${experience.id}`}
                checked={experience.current}
                onCheckedChange={(checked) => handleCheckboxChange(experience.id, checked as boolean)}
              />
              <Label htmlFor={`current-${experience.id}`}>I currently work here</Label>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor={`description-${experience.id}`}>Description</Label>
              <Textarea
                id={`description-${experience.id}`}
                name="description"
                value={experience.description}
                onChange={(e) => handleChange(experience.id, e)}
                placeholder="Describe your responsibilities and achievements"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" className="w-full" onClick={addExperience}>
        <Plus className="mr-2 h-4 w-4" />
        Add Experience
      </Button>
      <Button type="submit" className="w-full mt-4" onClick={handleSubmit}>
        Save Experience
      </Button>
    </div>
  )
}

