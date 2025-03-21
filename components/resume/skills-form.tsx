"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, X, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SkillCategory {
  id: string
  name: string
  skills: string[]
}

interface SkillsFormProps {}

export default function SkillsForm({}: SkillsFormProps) {
  const [skillInput, setSkillInput] = useState("")
  const [categories, setCategories] = useState<SkillCategory[]>([
    {
      id: "1",
      name: "Programming Languages",
      skills: [],
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch existing skills on component mount
  useEffect(() => {
    const fetchSkills = async () => {
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/skills`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }
        
        const data = await response.json();
        
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
        // Show error message
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  });

  const handleCategoryNameChange = (id: string, name: string) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, name } : cat)))
  }

  const addSkill = (categoryId: string) => {
    if (skillInput.trim()) {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === categoryId ? { ...cat, skills: [...cat.skills, skillInput.trim()] } : cat)),
      )
      setSkillInput("")
    }
  }

  const removeSkill = (categoryId: string, skillIndex: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              skills: cat.skills.filter((_, index) => index !== skillIndex),
            }
          : cat,
      ),
    )
  }

  const addCategory = () => {
    setCategories((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "New Category",
        skills: [],
      },
    ])
  }

  const removeCategory = (id: string) => {
    if (categories.length > 1) {
      setCategories((prev) => prev.filter((cat) => cat.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
  
    // Convert categories to the required multi-valued list format
    const formattedData = categories.map(category => [category.name, ...category.skills]);
  
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData), // Send transformed data
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      alert(data.message); // Show success message
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error saving your skills.');
    } finally {
      setIsSaving(false);
    }
  };
  

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading skills...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        {categories.map((category) => (
          <Card key={category.id} className="relative mb-4">
            <CardContent className="pt-6">
              <div className="absolute right-4 top-4 flex space-x-2">
                {categories.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeCategory(category.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`category-${category.id}`}>Category Name</Label>
                <Input
                  id={`category-${category.id}`}
                  value={category.name}
                  onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                  placeholder="e.g., Programming Languages, Tools, Soft Skills"
                />
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor={`skills-${category.id}`}>Skills</Label>
                <div className="flex space-x-2">
                  <Input
                    id={`skills-${category.id}`}
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addSkill(category.id)
                      }
                    }}
                  />
                  <Button type="button" onClick={() => addSkill(category.id)} size="sm">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add</span>
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {category.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {skill}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-1 h-4 w-4 p-0"
                      onClick={() => removeSkill(category.id, index)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="outline" className="w-full mb-6" onClick={addCategory}>
          <Plus className="mr-2 h-4 w-4" />
          Add Skill Category
        </Button>

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Skills"
          )}
        </Button>
      </form>
    </div>
  )
}