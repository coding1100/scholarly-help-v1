type Assignement = {
  title: string;
  fileName: string;
  pages: string;
  documentType: string;
  citation: string;
  academicLevel: string;
};
export type SubjectAssignment = {
  mainTitle: string;
  assignments: Assignement[];
};
export const SubjectAssignmentContent: SubjectAssignment[]= [
  {
    mainTitle: "Biology Assignments",
    assignments: [
      {
        title: "Research Project",
        fileName: "biological-assignment.pdf",
        pages: "6 pages",
        documentType: "Research Paper",
        citation: "APA",
        academicLevel: "Masters",
      },
      {
        title: "Research Project",
        fileName: "biological-assignment.pdf",
        pages: "6 pages",
        documentType: "Research Paper",
        citation: "APA",
        academicLevel: "Masters",
      },
      {
        title: "Research Project",
        fileName: "biological-assignment.pdf",
        pages: "6 pages",
        documentType: "Research Paper",
        citation: "APA",
        academicLevel: "Masters",
      },
    ],
  },
  {
    mainTitle: "Business Assignments",
    assignments: [
      {
        title: "Research Project",
        pages: "6 pages",
        academicLevel: "Masters",
        documentType: "Research Paper",
        fileName: "research-project.pdf",
        citation: "APA",
      },
      {
        title: "What-If Analysis",
        pages: "1 Sheet",
        academicLevel: "Masters",
        documentType: "Excel Project",
        fileName: "assignment-on-what-if-analysis.pdf",
        citation: "None",
      },
      {
        title: "Numerical Project",
        pages: "2 Sheet",
        academicLevel: "Masters",
        documentType: "Excel Project",
        fileName: "numerical-project.pdf",
        citation: "None",
      },
    ],
  },
  {
    mainTitle: "Economics Assignments",
    assignments: [
      {
        title: "Case Study",
        pages: "6 pages",
        academicLevel: "Masters",
        documentType: "Case Study",
        citation: "APA",
        fileName: "economic-impacts-of-renewable-energy.pdf",
      },
      {
        title: "Income Statement",
        pages: "5 pages",
        academicLevel: "Masters",
        documentType: "Income Statement",
        citation: "None",
        fileName: "pro-forma-income-statement.pdf",
      },
      {
        title: "Numerical Project",
        pages: "2 Sheet",
        academicLevel: "Masters",
        documentType: "Excel Project",
        fileName: "numerical-project.pdf",
        citation: "None",
      },
    ],
  },
  {
    mainTitle: "English Assignments",
    assignments: [
      {
        title: "Research Paper",
        pages: "4 pages",
        academicLevel: "Masters",
        documentType: "Research Paper",
        citation: "MLA",
        fileName: "rerwrite-assignement-of-english-literature-final.pdf",
      },
      {
        title: "Research Paper",
        pages: "4 pages",
        academicLevel: "Masters",
        documentType: "Research Paper",
        citation: "MLA",
        fileName: "rerwrite-assignement-of-english-literature-final.pdf",
      },
      {
        title: "Research Paper",
        pages: "4 pages",
        academicLevel: "Masters",
        documentType: "Research Paper",
        citation: "MLA",
        fileName: "rerwrite-assignement-of-english-literature-final.pdf",
      },
    ],
  },
  {
    mainTitle: "Essay Writing",
    assignments: [
      {
        title: "Essay",
        pages: "4 pages",
        academicLevel: "Masters",
        documentType: "Essay Paper",
        citation: "APA",
        fileName: "essay-writing.pdf",
      },
      {
        title: "Essay",
        pages: "4 pages",
        academicLevel: "Masters",
        documentType: "Essay Paper",
        citation: "APA",
        fileName: "essay-writing.pdf",
      },
      {
        title: "Essay",
        pages: "4 pages",
        academicLevel: "Masters",
        documentType: "Essay Paper",
        citation: "APA",
        fileName: "essay-writing.pdf",
      },
    ],
  },
  {
    mainTitle: "Geography Assignments",
    assignments: [
      {
        title: "Sample Questions",
        pages: "3 pages",
        academicLevel: "Masters",
        documentType: "Questions",
        citation: "APA",
        fileName: "geography-sample-question.pdf",
      },
      {
        title: "Maps",
        pages: "4 pages",
        academicLevel: "Masters",
        documentType: "Screenshots",
        citation: "None",
        fileName: "ges-questions-tutorial.pdf",
      },
      {
        title: "Map Screenshot",
        pages: "1 page",
        academicLevel: "Masters",
        documentType: "Screenshot",
        citation: "None",
        fileName: "gis-fuzzy-map-solution.pdf",
      },
    ],
  },
  {
    mainTitle: "Law Assignments",
    assignments: [
      {
        title: "Case",
        pages: "4 pages",
        academicLevel: "Masters",
        documentType: "Case Study",
        citation: "None",
        fileName: "law.pdf",
      },
      {
        title: "Case",
        pages: "4 pages",
        academicLevel: "Masters",
        documentType: "Case Study",
        citation: "None",
        fileName: "law.pdf",
      },
      {
        title: "Case",
        pages: "4 pages",
        academicLevel: "Masters",
        documentType: "Case Study",
        citation: "None",
        fileName: "law.pdf",
      },
    ],
  },

  {
    mainTitle: "Mathematics Assignments",
    assignments: [
      {
        title: "Problem",
        pages: "1 page",
        academicLevel: "Masters",
        documentType: "Mathematical Problem",
        citation: "None",
        fileName: "sample-question.pdf",
      },
      {
        title: "Problem",
        pages: "1 page",
        academicLevel: "Masters",
        documentType: "Mathematical Problem",
        citation: "None",
        fileName: "sample-question.pdf",
      },
      {
        title: "Problem",
        pages: "1 page",
        academicLevel: "Masters",
        documentType: "Mathematical Problem",
        citation: "None",
        fileName: "sample-question.pdf",
      },
    ],
  },
  {
    mainTitle: "Physics Assignments",
    assignments: [
      {
        title: "Lab 1",
        pages: "31 pages",
        academicLevel: "Masters",
        documentType: "Lab",
        citation: "None",
        fileName: "lab-1-physics.pdf",
      },
      {
        title: "Lab 2",
        pages: "9 page",
        academicLevel: "Masters",
        documentType: "Lab",
        citation: "None",
        fileName: "lab-2-physics.pdf",
      },
      {
        title: "Lab 3",
        pages: "9 page",
        academicLevel: "Masters",
        documentType: "Mathematical Problem",
        citation: "None",
        fileName: "lab-2-physics.pdf",
      },
    ],
  },
  {
    mainTitle: "Psychology Assignments",
    assignments: [
      {
        title: "Case Study",
        pages: "6 pages",
        academicLevel: "Masters",
        documentType: "Case Study",
        citation: "APA",
        fileName: "psychology.pdf",
      },
      {
        title: "PTSD Case Study",
        pages: "4 pages",
        academicLevel: "Masters",
        documentType: "Case Study",
        citation: "MLA",
        fileName: "ptsd-case-study-docx.pdf",
      },
      {
        title: "Case Study",
        pages: "6 pages",
        academicLevel: "Masters",
        documentType: "Case Study",
        citation: "APA",
        fileName: "psychology.pdf",
      },
    ],
  },
  {
    mainTitle: "Sociology Assignments",
    assignments: [
      {
        title: "Case Study",
        pages: "4 pages",
        academicLevel: "Masters",
        documentType: "Case Study",
        citation: "APA",
        fileName: "assignment-for-website.pdf",
      },
      {
        title: "Research Paper",
        pages: "3 pages",
        academicLevel: "Masters",
        documentType: "Research Paper",
        citation: "APA",
        fileName: "sociology-assignment-2.pdf",
      },
      {
        title: "Research Paper",
        pages: "5 pages",
        academicLevel: "Masters",
        documentType: "Research Paper",
        citation: "APA",
        fileName: "sociology-assignment.pdf",
      },
    ],
  },
];
