export const PricingContent = [
  {
    plan: "Free",
    submitPlan: "none",
    subTitle: "A great way to try every tool before you commit",
    price: "$0",
    duration: "Forever",
    button: "Get started free",
    FeatureHeading: "What you get:",
    Features: [
      "Free runs across every AI tool",
      "Grammar Checker, Humanizer, Summarizer, and more",
      "Essay and thesis writing tools",
      "Citation generator",
    ],
  },
  {
    plan: "Starter",
    submitPlan: "starter",
    subTitle: "Full access to every tool, billed monthly",
    price: "$5",
    duration: "per month",
    button: "Upgrade to Starter",
    FeatureHeading: "Everything in Free, plus:",
    Features: [
      "About $2 of AI tool usage every month",
      "5 plagiarism scans a month",
      "Full length document scans, up to 10,000 words",
      "Priority access to new tools",
    ],
  },
  {
    plan: "Starter Annual",
    submitPlan: "starter_annual",
    subTitle: "The best value, two months free every year",
    price: "$40",
    duration: "per year",
    button: "Upgrade to Starter Annual",
    FeatureHeading: "Everything in Starter, plus:",
    Features: [
      "About $10 of AI tool usage every year",
      "20 plagiarism scans a year",
      "Full length document scans, up to 10,000 words",
      "Priority access to new tools",
    ],
  },
];

export const PricingTableContent = {
  simpleContent: [
    {
      option: "AI tool usage",
      free: "Limited free runs",
      unlimited: "About $2 a month or $10 a year",
    },
    {
      option: "Plagiarism checker scans",
      free: "Not included",
      unlimited: "5 a month or 20 a year",
    },
    {
      option: "Max document length",
      free: "Standard limits",
      unlimited: "Up to 10,000 words",
    },
    {
      option: "Support",
      free: "Standard",
      unlimited: "Priority",
    },
  ],
  booleanContent: [
    {
      option: "Grammar Checker",
      free: true,
      unlimited: true,
    },
    {
      option: "Humanizer and AI Detector",
      free: true,
      unlimited: true,
    },
    {
      option: "Essay and thesis writing tools",
      free: true,
      unlimited: true,
    },
    {
      option: "Citation generator",
      free: true,
      unlimited: true,
    },
  ],
};
