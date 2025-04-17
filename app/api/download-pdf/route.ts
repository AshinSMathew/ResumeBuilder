// app/api/download-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';

async function getResumeData(req: NextRequest) {
  try {
    const authToken = req.cookies.get('authToken')?.value;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/preview`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `authToken=${authToken || ''}`
      },
      credentials: 'include',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch resume data: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching resume data:", error);
    throw error;
  }
}

async function generatePDF(data: any) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFont('helvetica');
  
  // Constants for positioning
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (margin * 2);
  
  // Color scheme - Black and white with grays
  const colors = {
    black: [0, 0, 0],          // #000000 - For main headings and important text
    darkGray: [51, 51, 51],    // #333333 - For subheadings and secondary text
    mediumGray: [102, 102, 102], // #666666 - For descriptions and body text
    lightGray: [153, 153, 153],
  };
  
  function addWrappedText(text: string, x: number, y: number, maxWidth: number, fontSize: number, fontStyle: string = 'normal', align: any = 'left', color: number[] = colors.mediumGray) {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(color[0], color[1], color[2]);
    const textLines = doc.splitTextToSize(text, maxWidth);
    doc.text(textLines, x, y, { align });
    return textLines.length;
  }
  
  // Helper function for adding a section title
  function addSectionTitle(title: string, y: number) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
    doc.text(title.toUpperCase(), margin, y);
    
    // Add a subtle divider line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    
    return y + 6;
  }
  
  // Helper function to check and add new page if needed
  function checkNewPage(currentY: number, requiredSpace: number = 30): number {
    if (currentY + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      return margin;
    }
    return currentY;
  }
  
  // Helper function for adding bullet points
  function addBulletPoint(text: string, x: number, y: number, maxWidth: number) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.mediumGray[0], colors.mediumGray[1], colors.mediumGray[2]);
    
    const bulletSymbol = '•';
    const bulletTextIndent = 4;
    doc.text(bulletSymbol, x, y);
    
    const bulletText = text.trim();
    const textLines = doc.splitTextToSize(bulletText, maxWidth - bulletTextIndent);
    doc.text(textLines, x + bulletTextIndent, y);
    
    return textLines.length;
  }
  
  let yPos = margin;
  
  // Name - Large, bold, and centered
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.text(data.user?.name || 'John Doe', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  
  // Contact info - Centered and neatly spaced
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
  
  const contactItems = [];
  if (data.user?.location) contactItems.push(data.user.location);
  if (data.user?.email) contactItems.push(data.user.email);
  if (data.user?.phone) contactItems.push(data.user.phone);
  
  const contactLine = contactItems.join(' | ');
  doc.text(contactLine, pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  
  // Social links - Centered and in a slightly different color
  if (data.user?.linkedin || data.user?.github) {
    const socialItems = [];
    
    if (data.user?.linkedin) {
      const linkedinUsername = data.user.linkedin.split('/').pop();
      socialItems.push(`LinkedIn: linkedin.com/in/${linkedinUsername}`);
    }
    
    if (data.user?.github) {
      const githubUsername = data.user.github.split('/').pop();
      socialItems.push(`GitHub: github.com/${githubUsername}`);
    }
    
    const socialLine = socialItems.join(' | ');
    doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
    doc.text(socialLine, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
  } else {
    yPos += 4;
  }
  
  // Add a subtle divider line after the header
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;
  
  // Summary section
  if (data.user?.summary) {    
    yPos = addSectionTitle('PROFESSIONAL SUMMARY', yPos);
    yPos += 2;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colors.mediumGray[0], colors.mediumGray[1], colors.mediumGray[2]);
    const lines = addWrappedText(data.user.summary, margin, yPos, contentWidth, 10, 'normal', 'left', colors.mediumGray);
    yPos += (lines * 4) + 8;
  }
  
  // Experience section
  if (data.experiences && data.experiences.length > 0) {
    yPos = addSectionTitle('PROFESSIONAL EXPERIENCE', yPos);
    yPos += 2;
    
    data.experiences.forEach((exp: any, index: number) => {
      // Check if we need a new page
      yPos = checkNewPage(yPos, 20);
      
      // Company and position - Bold
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
      doc.text(exp.company || '', margin, yPos);
      
      // Date range - Right aligned with lighter color
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
      const dateText = `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`;
      doc.text(dateText, pageWidth - margin, yPos, { align: 'right' });
      yPos += 4;
      
      // Position and location
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      const positionText = `${exp.position}${exp.location ? ` – ${exp.location}` : ''}`;
      doc.text(positionText, margin, yPos);
      yPos += 4;
      
      // Description with bullet points
      if (exp.description) {
        const descLines = exp.description.split('\n')
          .filter((line: string) => line.trim());
        
        descLines.forEach((line: string) => {
          // Check if we need a new page
          yPos = checkNewPage(yPos, 10);
          
          const linesCount = addBulletPoint(line.trim(), margin, yPos, contentWidth - 5);
          yPos += (linesCount * 4);
        });
      }
      
      // Add spacing between experiences
      yPos += (index < data.experiences.length - 1) ? 8 : 4;
    });
    
    yPos += 4;
  }
  
  // Education section
  if (data.educations && data.educations.length > 0) {
    // Check if we need a new page
    yPos = checkNewPage(yPos, 30);
    
    yPos = addSectionTitle('EDUCATION', yPos);
    yPos += 2;
    
    data.educations.forEach((edu: any, index: number) => {
      // Check if we need a new page
      yPos = checkNewPage(yPos, 15);
      
      // Institution - Bold
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
      doc.text(edu.institution, margin, yPos);
      
      // Date range - Right aligned with lighter color
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
      const dateText = `${edu.startDate} – ${edu.endDate || 'Present'}`;
      doc.text(dateText, pageWidth - margin, yPos, { align: 'right' });
      yPos += 4;
      
      // Degree and field of study
      if (edu.degree || edu.fieldOfStudy) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
        const degreeText = `${edu.degree || ''}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}`;
        doc.text(degreeText, margin, yPos);
        yPos += 4;
      }
      
      // Description with bullet points
      if (edu.description) {
        const descLines = edu.description.split('\n')
          .filter((line: string) => line.trim());
        
        descLines.forEach((line: string) => {
          // Check if we need a new page
          yPos = checkNewPage(yPos, 10);
          
          const linesCount = addBulletPoint(line.trim(), margin, yPos, contentWidth - 5);
          yPos += (linesCount * 4);
        });
      }
      
      // Add spacing between education entries
      yPos += (index < data.educations.length - 1) ? 8 : 4;
    });
    
    yPos += 4;
  }
  
  // Skills section - Format as a more visible component
  if (data.skills && data.skills.length > 0) {
    // Check if we need a new page
    yPos = checkNewPage(yPos, 20);
    
    yPos = addSectionTitle('SKILLS', yPos);
    yPos += 2;
    
    data.skills.forEach((skillGroup: any, index: number) => {
      // Check if we need a new page
      yPos = checkNewPage(yPos, 10);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      const categoryText = `${skillGroup.category}: `;
      doc.text(categoryText, margin, yPos);
      
      // Calculate the width of the category text
      const categoryWidth = doc.getTextWidth(categoryText);
      
      // Skill list
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.mediumGray[0], colors.mediumGray[1], colors.mediumGray[2]);
      
      const skillsList = Array.isArray(skillGroup.skills) 
        ? skillGroup.skills.join(', ') 
        : skillGroup.skills;
      
      const lines = addWrappedText(skillsList, margin + categoryWidth, yPos, 
        contentWidth - categoryWidth, 10, 'normal', 'left', colors.mediumGray);
      yPos += (lines * 4) + (index < data.skills.length - 1 ? 4 : 0);
    });
    
    yPos += 8;
  }
  
  // Projects section
  if (data.projects && data.projects.length > 0) {
    // Check if we need a new page
    yPos = checkNewPage(yPos, 30);
    
    yPos = addSectionTitle('PROJECTS', yPos);
    yPos += 2;
    
    data.projects.forEach((project: any, index: number) => {
      yPos = checkNewPage(yPos, 15);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
      doc.text(project.name, margin, yPos);
      yPos += 4;
      if (project.link) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
        doc.text(project.link, margin, yPos);
        yPos += 4;
      }
      
      if (project.description) {
        const descLines = project.description.split('\n')
          .filter((line: string) => line.trim());
        
        descLines.forEach((line: string) => {
          yPos = checkNewPage(yPos, 10);
          
          const linesCount = addBulletPoint(line.trim(), margin, yPos, contentWidth - 5);
          yPos += (linesCount * 4);
        });
      }

      if (project.technologies) {
        yPos = checkNewPage(yPos, 10);
        
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
        const techText = `Technologies: ${project.technologies}`;
        const lines = addWrappedText(techText, margin, yPos, contentWidth, 10, 'italic', 'left', colors.darkGray);
        yPos += (lines * 4);
      }

      yPos += (index < data.projects.length - 1) ? 8 : 4;
    });
    
    yPos += 4;
  }

  if (data.certifications && data.certifications.length > 0) {
    yPos = checkNewPage(yPos, 30);
    
    yPos = addSectionTitle('CERTIFICATIONS', yPos);
    yPos += 2;
    
    data.certifications.forEach((cert: any, index: number) => {
      yPos = checkNewPage(yPos, 15);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
      doc.text(cert.name, margin, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
      doc.text(cert.date, pageWidth - margin, yPos, { align: 'right' });
      yPos += 4;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      doc.text(cert.issuer, margin, yPos);
      yPos += 4;

      if (cert.description) {
        yPos = checkNewPage(yPos, 10);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(colors.mediumGray[0], colors.mediumGray[1], colors.mediumGray[2]);
        const lines = addWrappedText(cert.description, margin, yPos, contentWidth, 10);
        yPos += (lines * 4);
      }
      yPos += (index < data.certifications.length - 1) ? 6 : 4;
    });
    
    yPos += 4;
  }

  if (data.achievements && data.achievements.length > 0) {
    yPos = checkNewPage(yPos, 30);
    
    yPos = addSectionTitle('ACHIEVEMENTS', yPos);
    yPos += 2;
    
    data.achievements.forEach((ach: any, index: number) => {
      yPos = checkNewPage(yPos, 15);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
      doc.text(ach.title, margin, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
      doc.text(ach.date, pageWidth - margin, yPos, { align: 'right' });
      yPos += 4;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
      doc.text(ach.organization, margin, yPos);
      yPos += 4;

      if (ach.description) {
        yPos = checkNewPage(yPos, 10);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(colors.mediumGray[0], colors.mediumGray[1], colors.mediumGray[2]);
        const lines = addWrappedText(ach.description, margin, yPos, contentWidth, 10);
        yPos += (lines * 4);
      }

      yPos += (index < data.achievements.length - 1) ? 6 : 4;
    });
  }

  const totalPages = doc.getNumberOfPages();
  if (totalPages > 1) {
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}

export async function GET(req: NextRequest) {
  try {
    const resumeData = await getResumeData(req);
    const pdfBuffer = await generatePDF(resumeData);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error) {
    console.error('Error in PDF generation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}