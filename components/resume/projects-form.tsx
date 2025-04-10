"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  link: string;
  startDate: string;
  description: string;
  technologies: string;
}

export default function ProjectsForm() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/project');
        if (response.ok) {
          const data = await response.json();
          if (data.projects && data.projects.length > 0) {
            // Add unique IDs for React rendering
            setProjects(data.projects.map((proj: any) => ({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              ...proj
            })));
          } else {
            // Initialize with one empty project if no projects exist
            setProjects([createEmptyProject()]);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Initialize with one empty project if fetch fails
        setProjects([createEmptyProject()]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const createEmptyProject = (): Project => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: "",
    link: "",
    startDate: "",
    description: "",
    technologies: ""
  });

  const handleChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjects((prev) => prev.map((proj) => (proj.id === id ? { ...proj, [name]: value } : proj)));
  };

  const addProject = () => {
    setProjects((prev) => [...prev, createEmptyProject()]);
  };

  const removeProject = (id: string) => {
    if (projects.length > 1) {
      setProjects((prev) => prev.filter((proj) => proj.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare projects data without the temporary IDs
    const projectsToSave = projects.map(({ id, ...rest }) => rest);

    try {
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projects: projectsToSave }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        {projects.map((project) => (
          <Card key={project.id} className="relative">
            <CardContent className="pt-6">
              <div className="absolute right-4 top-4 flex space-x-2">
                {projects.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProject(project.id)}
                  >
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
                    required
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
                    type="text"
                    value={project.startDate}
                    onChange={(e) => handleChange(project.id, e)}
                    placeholder="2023"
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
        <Button type="submit" className="w-full mt-4">
          Save Projects
        </Button>
      </form>
    </div>
  );
}