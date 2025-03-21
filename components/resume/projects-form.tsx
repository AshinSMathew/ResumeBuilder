"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface Project {
  id: string
  name: string
  link: string
  startDate: string
  description: string
  technologies: string
}

interface ProjectsFormProps {}

export default function ProjectsForm({}: ProjectsFormProps) {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "",
      link: "",
      startDate: "",
      description: "",
      technologies: "",
    },
  ])

  const handleChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProjects((prev) => prev.map((proj) => (proj.id === id ? { ...proj, [name]: value } : proj)))
  }

  const addProject = () => {
    setProjects((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        link: "",
        startDate: "",
        description: "",
        technologies: "",
      },
    ])
  }

  const removeProject = (id: string) => {
    if (projects.length > 1) {
      setProjects((prev) => prev.filter((proj) => proj.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projects }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      alert(data.message); // Show success message
      // Reset the form after successful submission
      setProjects([{ id: "1", name: "", link: "", startDate: "", description: "", technologies: "" }]);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form.');
    }
  };

  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <Card key={project.id} className="relative">
          <CardContent className="pt-6">
            <div className="absolute right-4 top-4 flex space-x-2">
              {projects.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeProject(project.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`name-${project.id}`}>Project Name</Label>
                <Input
                  id={`name-${project.id}`}
                  name="name"
                  value={project.name}
                  onChange={(e) => handleChange(project.id, e)}
                  placeholder="Project Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`link-${project.id}`}>Project Link</Label>
                <Input
                  id={`link-${project.id}`}
                  name="link"
                  value={project.link}
                  onChange={(e) => handleChange(project.id, e)}
                  placeholder="https://github.com/username/project"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`startDate-${project.id}`}>Year</Label>
                <Input
                  id={`startDate-${project.id}`}
                  name="startDate"
                  type="year"
                  value={project.startDate}
                  onChange={(e) => handleChange(project.id, e)}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor={`technologies-${project.id}`}>Technologies Used</Label>
              <Input
                id={`technologies-${project.id}`}
                name="technologies"
                value={project.technologies}
                onChange={(e) => handleChange(project.id, e)}
                placeholder="React, Node.js, MongoDB, etc."
              />
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor={`description-${project.id}`}>Description</Label>
              <Textarea
                id={`description-${project.id}`}
                name="description"
                value={project.description}
                onChange={(e) => handleChange(project.id, e)}
                placeholder="Describe the project, your role, and achievements"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" className="w-full" onClick={addProject}>
        <Plus className="mr-2 h-4 w-4" />
        Add Project
      </Button>
      <Button type="submit" className="w-full mt-4" onClick={handleSubmit}>
        Save Projects
      </Button>
    </div>
  )
}

