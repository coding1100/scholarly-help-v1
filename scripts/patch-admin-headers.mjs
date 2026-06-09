import fs from "fs";

const replacements = [
  [
    "app/(admin)/admin/home/page.tsx",
    '<AdminPageHeader title="Manage Home Page Content" />',
    /<div className="mb-8">\s*<h1[^>]*>Manage Home Page Content<\/h1>\s*<p[^>]*>[^<]*<\/p>\s*<\/div>/s,
  ],
  [
    "app/(admin)/admin/assignment/page.tsx",
    '<AdminPageHeader title="Manage Assignment Content" subtitle="Select a page to edit its content" />',
    /<div className="mb-8">\s*<h1[^>]*>Manage Assignment Content<\/h1>\s*<p[^>]*>[^<]*<\/p>\s*<\/div>/s,
  ],
  [
    "app/(admin)/admin/homework/page.tsx",
    '<AdminPageHeader title="Manage Homework Content" subtitle="Select a page to edit its content" />',
    /<div className="mb-8">\s*<h1[^>]*>Manage Homework Content<\/h1>\s*<p[^>]*>[^<]*<\/p>\s*<\/div>/s,
  ],
  [
    "app/(admin)/admin/online-class/page.tsx",
    '<AdminPageHeader title="Manage Online Class Content" subtitle="Select a page to edit its content" />',
    /<div className="mb-8">\s*<h1[^>]*>Manage Online Class Content<\/h1>\s*<p[^>]*>[^<]*<\/p>\s*<\/div>/s,
  ],
  [
    "app/(admin)/admin/essay-writing/page.tsx",
    '<AdminPageHeader title="Manage Essay Writing Content" subtitle="Select a page to edit its content" />',
    /<div className="mb-8">\s*<h1[^>]*>Manage Essay Writing Content<\/h1>\s*<p[^>]*>[^<]*<\/p>\s*<\/div>/s,
  ],
  [
    "app/(admin)/admin/exam/page.tsx",
    '<AdminPageHeader title="Manage Exam Content" subtitle="Select a page to edit its content" />',
    /<div className="mb-8">\s*<h1[^>]*>\s*Manage Exam Content\s*<\/h1>\s*<p[^>]*>[^<]*<\/p>\s*<\/div>/s,
  ],
  [
    "app/(admin)/admin/tools/page.tsx",
    '<AdminPageHeader title="Edit Tools Page" />',
    /<div className="mb-6">\s*<h1[^>]*>Edit Tools Page<\/h1>[\s\S]*?<\/div>/,
  ],
  [
    "app/(admin)/admin/guarantee-anonymity/page.tsx",
    '<AdminPageHeader title="Edit Guarantee Anonymity Page" />',
    /<div className="mb-6">\s*<h1[^>]*>Edit Guarantee Anonymity Page<\/h1>[\s\S]*?<\/div>/,
  ],
  [
    "app/(admin)/admin/us-based-phd-experts/page.tsx",
    '<AdminPageHeader title="Edit US-Based PhD Experts Page" />',
    /<div className="mb-6">\s*<h1[^>]*>Edit US-Based PhD Experts Page<\/h1>[\s\S]*?<\/div>/,
  ],
  [
    "app/(admin)/admin/success-stories-and-reviews/page.tsx",
    '<AdminPageHeader title="Edit Success Stories & Reviews Page" />',
    /<div className="mb-6">\s*<h1[^>]*>Edit Success Stories & Reviews Page<\/h1>[\s\S]*?<\/div>/,
  ],
  [
    "app/(admin)/admin/plagiarism-free-process/page.tsx",
    '<AdminPageHeader title="Edit Plagiarism-Free Process Page" />',
    /<div className="mb-6">\s*<h1[^>]*>Edit Plagiarism-Free Process Page<\/h1>[\s\S]*?<\/div>/,
  ],
  [
    "app/(admin)/admin/on-time-delivery-guarantee/page.tsx",
    '<AdminPageHeader title="Edit On-Time Delivery Guarantee Page" />',
    /<div className="mb-6">\s*<h1[^>]*>Edit On-Time Delivery Guarantee Page<\/h1>[\s\S]*?<\/div>/,
  ],
  [
    "app/(admin)/admin/take-my-class-1/page.tsx",
    '<AdminPageHeader title="Manage Take My Class 1 Page Content" />',
    /<div className="mb-8">\s*<h1[^>]*>Manage Take My Class 1 Page Content<\/h1>[\s\S]*?<\/div>/,
  ],
  [
    "app/(admin)/admin/take-my-class-2/page.tsx",
    '<AdminPageHeader title="Manage Take My Class 2 Page Content" />',
    /<div className="mb-8">\s*<h1[^>]*>Manage Take My Class 2 Page Content<\/h1>[\s\S]*?<\/div>/,
  ],
  [
    "app/(admin)/admin/faq/page.tsx",
    '<AdminPageHeader title="Edit FAQ Content" />',
    /<div className="mb-8">\s*<h1[^>]*>Edit FAQ Content<\/h1>[\s\S]*?<\/div>/,
  ],
  [
    "app/(admin)/admin/pages/page.tsx",
    '<AdminPageHeader title="Manage Pages" />',
    /<div className="mb-8">\s*<h1[^>]*>Manage Pages<\/h1>[\s\S]*?<\/div>/,
  ],
  [
    "app/(admin)/admin/take-my-exam/page.tsx",
    '<AdminPageHeader title={`Manage ${pageLabel} Page Content`} subtitle={`Edit the ${pageLabel} page content`} />',
    /<div className="mb-8">\s*<h1[^>]*>\s*Manage \{pageLabel\} Page Content\s*<\/h1>\s*<p[^>]*>\s*Edit the \{pageLabel\} page content\s*<\/p>\s*<\/div>/s,
  ],
];

for (const [file, rep, re] of replacements) {
  let c = fs.readFileSync(file, "utf8");
  if (!c.includes("AdminPageHeader")) {
    c = c.replace(
      'import { useState, useEffect } from "react";',
      'import { useState, useEffect } from "react";\nimport AdminPageHeader from "@/app/components/Admin/AdminPageHeader";',
    );
  }
  const next = c.replace(re, rep);
  if (next === c) console.log("NO MATCH", file);
  else fs.writeFileSync(file, next);
}
console.log("done");
