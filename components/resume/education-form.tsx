"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EducationFormProps {}

export default function EducationForm({}: EducationFormProps) {
  const [educations, setEducations] = useState<Education[]>([
    {
      id: "1",
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ]);

  const handleChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEducations((prev) => prev.map((edu) => (edu.id === id ? { ...edu, [name]: value } : edu)));
  };

  const addEducation = () => {
    setEducations((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const removeEducation = (id: string) => {
    if (educations.length > 1) {
      setEducations((prev) => prev.filter((edu) => edu.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ educations }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      alert(data.message); // Show success message
      // Reset the form after successful submission
      setEducations([{ id: "1", institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", description: "" }]);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form.');
    }
  };


  return (
    <div className="space-y-6">
      {educations.map((education, index) => (
        <Card key={education.id} className="relative">
          <CardContent className="pt-6">
            <div className="absolute right-4 top-4 flex space-x-2">
              {educations.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeEducation(education.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`institution-${education.id}`}>Institution</Label>
                <Input
                  id={`institution-${education.id}`}
                  name="institution"
                  value={education.institution}
                  onChange={(e) => handleChange(education.id, e)}
                  placeholder="University of Example"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`degree-${education.id}`}>Degree</Label>
                <Input
                  id={`degree-${education.id}`}
                  name="degree"
                  value={education.degree}
                  onChange={(e) => handleChange(education.id, e)}
                  placeholder="Bachelor of Science"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor={`fieldOfStudy-${education.id}`}>Field of Study</Label>
              <Input
                id={`fieldOfStudy-${education.id}`}
                name="fieldOfStudy"
                value={education.fieldOfStudy}
                onChange={(e) => handleChange(education.id, e)}
                placeholder="Computer Science"
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`startDate-${education.id}`}>Start Year</Label>
                <Input
                  id={`startDate-${education.id}`}
                  name="startDate"
                  type="year"
                  value={education.startDate}
                  onChange={(e) => handleChange(education.id, e)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`endDate-${education.id}`}>End Year (or Expected)</Label>
                <Input
                  id={`endDate-${education.id}`}
                  name="endDate"
                  type="year"
                  value={education.endDate}
                  onChange={(e) => handleChange(education.id, e)}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor={`description-${education.id}`}>Description</Label>
              <Textarea
                id={`description-${education.id}`}
                name="description"
                value={education.description}
                onChange={(e) => handleChange(education.id, e)}
                placeholder="Relevant coursework, achievements, or activities"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" className="w-full" onClick={addEducation}>
        <Plus className="mr-2 h-4 w-4" />
        Add Education
      </Button>
      <Button type="submit" className="w-full mt-4" onClick={handleSubmit}>
        Save Education
      </Button>
    </div>
  )
}

