"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
  credentialURL: string;
  description: string;
}

export default function CertificationsForm() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const response = await fetch('/api/certifications');
        if (response.ok) {
          const data = await response.json();
          if (data.certifications && data.certifications.length > 0) {
            setCertifications(data.certifications.map((cert: any) => ({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              ...cert
            })));
          } else {
            setCertifications([createEmptyCertification()]);
          }
        }
      } catch (error) {
        console.error('Error fetching certifications:', error);
        setCertifications([createEmptyCertification()]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  const createEmptyCertification = (): Certification => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: "",
    issuer: "",
    date: "",
    credentialId: "",
    credentialURL: "",
    description: ""
  });

  const handleChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCertifications((prev) => prev.map((cert) => (cert.id === id ? { ...cert, [name]: value } : cert)));
  };

  const addCertification = () => {
    setCertifications((prev) => [...prev, createEmptyCertification()]);
  };

  const removeCertification = (id: string) => {
    if (certifications.length > 1) {
      setCertifications((prev) => prev.filter((cert) => cert.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const certificationsToSave = certifications.map(({ id, ...rest }) => rest);

    try {
      const response = await fetch('/api/certifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ certifications: certificationsToSave }),
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
        {certifications.map((certification) => (
          <Card key={certification.id} className="relative">
            <CardContent className="pt-6">
              <div className="absolute right-4 top-4 flex space-x-2">
                {certifications.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCertification(certification.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`name-${certification.id}`}>Certification Name</Label>
                  <Input
                    id={`name-${certification.id}`}
                    name="name"
                    value={certification.name}
                    onChange={(e) => handleChange(certification.id, e)}
                    placeholder="AWS Certified Solutions Architect"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`issuer-${certification.id}`}>Issuing Organization</Label>
                  <Input
                    id={`issuer-${certification.id}`}
                    name="issuer"
                    value={certification.issuer}
                    onChange={(e) => handleChange(certification.id, e)}
                    placeholder="Amazon Web Services"
                    required
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`date-${certification.id}`}>Issue Date</Label>
                  <Input
                    id={`date-${certification.id}`}
                    name="date"
                    type="text"
                    value={certification.date}
                    onChange={(e) => handleChange(certification.id, e)}
                    placeholder="2023"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`credentialId-${certification.id}`}>Credential ID</Label>
                  <Input
                    id={`credentialId-${certification.id}`}
                    name="credentialId"
                    value={certification.credentialId}
                    onChange={(e) => handleChange(certification.id, e)}
                    placeholder="ABC123XYZ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`credentialURL-${certification.id}`}>Credential URL</Label>
                  <Input
                    id={`credentialURL-${certification.id}`}
                    name="credentialURL"
                    value={certification.credentialURL}
                    onChange={(e) => handleChange(certification.id, e)}
                    placeholder="https://www.credential.net/abc123xyz"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor={`description-${certification.id}`}>Description</Label>
                <Textarea
                  id={`description-${certification.id}`}
                  name="description"
                  value={certification.description}
                  onChange={(e) => handleChange(certification.id, e)}
                  placeholder="Brief description of the certification and skills acquired"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="outline" className="w-full" onClick={addCertification}>
          <Plus className="mr-2 h-4 w-4" />
          Add Certification
        </Button>
        <Button type="submit" className="w-full mt-4">
          Save Certifications
        </Button>
      </form>
    </div>
  );
}