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
  description: string;
  assignments: Assignement[];
};
export const SubjectAssignmentContent: SubjectAssignment[] = [
  {
    mainTitle: "Biology Assignments",
    description: `Our <a href="/assignment/" class="text-[#323dd6] hover:underline">biology assignment</a> samples demonstrate clear scientific understanding, accurate terminology, and well-structured explanations. These examples highlight how complex biological concepts are presented logically, supported by research, and formatted according to academic standards expected at college and university levels.`,
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
    description: `The business assignment samples showcase practical analysis, real-world application, and structured reasoning. From case studies to research-based reports, these samples reflect how business concepts are explained clearly, supported with data, and aligned with academic expectations across various business disciplines.`,
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
    description: `Our <a href="/assignment/economics/" class="text-[#323dd6] hover:underline">economics assignment</a> samples focus on analytical thinking, numerical accuracy, and clear interpretation of economic theories. These examples demonstrate how data, graphs, and economic models are used effectively to explain concepts while maintaining clarity and proper academic formatting.`,
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
    description: `The English assignment samples highlight strong writing skills, critical analysis, and clear argument development. These examples show how literary texts, themes, and language elements are examined thoughtfully, with proper structure, citations, and academic tone suitable for higher education.`,
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
    description: `Our <a href="/essay-writing/" class="text-[#323dd6] hover:underline">essay</a> samples reflect clear thesis development, logical flow, and well-supported arguments. Each example demonstrates how ideas are organized, evidence is incorporated, and academic writing standards are maintained across different essay types and subject areas.`,
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
    description: `The geography assignment samples illustrate effective use of maps, data interpretation, and spatial analysis. These examples show how geographic concepts are explained clearly, supported with research, and presented in a structured format aligned with academic requirements.`,
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
    description: `Our <a href="/assignment/law/" class="text-[#323dd6] hover:underline">law assignment</a> samples demonstrate precise legal reasoning, case analysis, and structured argumentation. These examples highlight how legal principles are applied accurately, supported by relevant cases or statutes, and presented in a clear academic writing style.`,
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
    description: `The mathematics assignment samples focus on step-by-step problem solving, logical reasoning, and accuracy. These examples show how mathematical concepts, formulas, and calculations are presented clearly, making complex problems easier to understand and follow.`,
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
    description: `Our <a href="/assignment/physics/" class="text-[#323dd6] hover:underline">physics assignment</a> samples demonstrate clear explanations of physical principles, accurate calculations, and logical problem-solving methods. These examples show how theoretical concepts and numerical problems are handled systematically and presented in a structured academic format.`,
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
    description: `The psychology assignment samples highlight critical thinking, theory application, and research-based discussion. These examples show how psychological concepts are explained clearly, supported by studies, and written in an academic tone suitable for psychology coursework.`,
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
    description: `Our <a href="/assignment/sociology/" class="text-[#323dd6] hover:underline">sociology assignment</a> samples focus on social analysis, theoretical perspectives, and real-world examples. These samples demonstrate how sociological concepts are discussed thoughtfully, supported with research, and structured clearly to meet academic writing standards.`,
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
