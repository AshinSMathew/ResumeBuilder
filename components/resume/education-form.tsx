"use client"

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Education {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

export default function EducationPage() {
  const [educations, setEducations] = useState<Education[]>([
    {
      id: 1,
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();
  const nextIdRef = useRef(2);

  useEffect(() => {
    const fetchEducations = async () => {
      try {
        const response = await fetch('/api/education');
        if (!response.ok) {
          throw new Error('Failed to fetch education data');
        }
        
        const data = await response.json();
        if (data.educations && data.educations.length > 0) {
          const formattedEducations: Education[] = data.educations.map((edu: any) => ({
            id: typeof edu.id === 'number' ? edu.id : parseInt(edu.id, 10) || 0,
            institution: edu.institution || "",
            degree: edu.degree || "",
            fieldOfStudy: edu.fieldOfStudy || "",
            startDate: edu.startDate || "",
            endDate: edu.endDate || "",
            description: edu.description || ""
          }));
          
          setEducations(formattedEducations);
          
          // Find the highest ID to set the nextIdRef value
          const highestId = Math.max(...formattedEducations.map(edu => edu.id));
          nextIdRef.current = highestId + 1;
        }
      } catch (error) {
        console.error('Error fetching education data:', error);
        toast({
          title: "Error",
          description: "Failed to load your education details.",
          variant: "destructive"
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchEducations();
  }, [toast]);

  const handleChange = (id: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEducations((prev) => prev.map((edu) => (edu.id === id ? { ...edu, [name]: value } : edu)));
  };

  const addEducation = () => {
    setEducations((prev) => [
      ...prev,
      {
        id: nextIdRef.current,
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
    nextIdRef.current += 1; // Increment the ID counter
  };

  const removeEducation = (id: number) => {
    if (educations.length > 1) {
      setEducations((prev) => prev.filter((edu) => edu.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
      toast({
        title: "Success",
        description: data.message,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "There was an error submitting your education details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Education Information</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {educations.map((education) => (
          <Card key={education.id} className="relative">
            <CardContent className="pt-6">
              <div className="absolute right-4 top-4 flex space-x-2">
                {educations.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    type="button"
                    onClick={() => removeEducation(education.id)}
                  >
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
                    value={education.startDate}
                    onChange={(e) => handleChange(education.id, e)}
                    placeholder="2018"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${education.id}`}>End Year (or Expected)</Label>
                  <Input
                    id={`endDate-${education.id}`}
                    name="endDate"
                    value={education.endDate}
                    onChange={(e) => handleChange(education.id, e)}
                    placeholder="2022"
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

        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          onClick={addEducation}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Education
        </Button>
        
        <Button 
          type="submit" 
          className="w-full mt-4" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Education"
          )}
        </Button>
      </form>
    </div>
  );
}