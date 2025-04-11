"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PersonalInfoForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    linkedIn: "",
    github: "",
    portfolio: "",
    summary: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPersonalDetails = async () => {
      try {
        const response = await fetch('/api/personalInfo');
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setFormData({
              fullName: data.data.fullName || "",
              email: data.data.email || "",
              phoneNumber: data.data.phoneNumber || "",
              linkedIn: data.data.linkedIn || "",
              github: data.data.github || "",
              portfolio: data.data.portfolio || "",
              summary: data.data.summary || "",
            });
          }
        }
      } catch (error) {
        console.error('Error fetching personal details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalDetails();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/personalInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save personal information');
      }

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error saving your information.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading your information...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name*</Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email*</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john.doe@example.com"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedIn">LinkedIn Profile</Label>
          <Input
            id="linkedIn"
            name="linkedIn"
            value={formData.linkedIn}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="github">GitHub Profile</Label>
          <Input
            id="github"
            name="github"
            value={formData.github}
            onChange={handleChange}
            placeholder="https://github.com/johndoe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="portfolio">Portfolio Website</Label>
          <Input
            id="portfolio"
            name="portfolio"
            value={formData.portfolio}
            onChange={handleChange}
            placeholder="https://johndoe.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea
          id="summary"
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          placeholder="A brief summary of your professional background and career goals"
          rows={4}
        />
      </div>
      <Button type="submit" className="w-full mt-4" onClick={handleSubmit}>
        Save Personal Details
      </Button>
    </div>
  )
}