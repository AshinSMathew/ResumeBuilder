"use client"

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

interface Experience {
  id: number;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: 1,
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();
  const nextIdRef = useRef(2); // Track the next ID to use

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await fetch('/api/experience');
        if (!response.ok) {
          throw new Error('Failed to fetch experience data');
        }
        
        const data = await response.json();
        if (data.experiences && data.experiences.length > 0) {
          // Convert string IDs to numbers if needed and ensure proper typing
          const formattedExperiences: Experience[] = data.experiences.map((exp: any) => ({
            id: typeof exp.id === 'number' ? exp.id : parseInt(exp.id, 10) || 0,
            company: exp.company || "",
            position: exp.position || "",
            location: exp.location || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            current: exp.current || false,
            description: exp.description || ""
          }));
          
          setExperiences(formattedExperiences);
          
          // Find the highest ID to set the nextIdRef value
          const highestId = Math.max(...formattedExperiences.map(exp => exp.id));
          nextIdRef.current = highestId + 1;
        }
      } catch (error) {
        console.error('Error fetching experience data:', error);
        toast({
          title: "Error",
          description: "Failed to load your experience details.",
          variant: "destructive"
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchExperiences();
  }, [toast]);

  const handleChange = (id: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExperiences((prev) => prev.map((exp) => (exp.id === id ? { ...exp, [name]: value } : exp)));
  };

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, current: checked, endDate: checked ? "" : exp.endDate } : exp)),
    );
  };

  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        id: nextIdRef.current,
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ]);
    nextIdRef.current += 1; // Increment the ID counter
  };

  const removeExperience = (id: number) => {
    if (experiences.length > 1) {
      setExperiences((prev) => prev.filter((exp) => exp.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ experiences }),
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
        description: "There was an error submitting your experience details.",
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
      <h1 className="text-2xl font-bold mb-6">Work Experience</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {experiences.map((experience) => (
          <Card key={experience.id} className="relative">
            <CardContent className="pt-6">
              <div className="absolute right-4 top-4 flex space-x-2">
                {experiences.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    type="button"
                    onClick={() => removeExperience(experience.id)}
                  >
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
                  <Label htmlFor={`startDate-${experience.id}`}>Start Year</Label>
                  <Input
                    id={`startDate-${experience.id}`}
                    name="startDate"
                    value={experience.startDate}
                    onChange={(e) => handleChange(experience.id, e)}
                    placeholder="2020"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${experience.id}`}>End Year</Label>
                  <Input
                    id={`endDate-${experience.id}`}
                    name="endDate"
                    value={experience.endDate}
                    onChange={(e) => handleChange(experience.id, e)}
                    placeholder="2022"
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

        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          onClick={addExperience}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
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
            "Save Experience"
          )}
        </Button>
      </form>
    </div>
  );
}