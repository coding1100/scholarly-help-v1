import { describe } from "node:test";
import { title } from "process";

export const MetaData = {
  // MetaData for About Us Page
  aboutUs: {
    title: "About Scholarly Help | Trusted Academic Assistance Experts",
    description:
      "Learn about Scholarly Help's journey, expertise, and dedication to helping students excel. Discover why we're the trusted choice in academics.",
    url: "about-us/",
  },
  // MetaData for Assignment Page
  assignment: {
    title: "Assignment Helper | Pay Someone to Do My Assignment for Me",
    description:
      "Struggling with assignments? Get professional assignment help online. Pay someone to do your assignment with trusted, affordable, and secure services. Hire expert assignment helpers today and make success stress-free!",
    url: "assignment/",
  },
  assignAccounting: {
    title: "Pay Someone to Do My Accounting Assignment | Hire Experts",
    description:
      "Struggling with accounting? Pay someone to do your accounting assignment. Hire experts for balance sheets, audits, and financial analysis now!",
    url: "assignment/accounting/",
  },
  assignAnatomy: {
    title: "Hire Experts to Do Your Anatomy Assignment | Affordable Help",
    description:
      "Need anatomy assignment help? Pay experts to take care of your assignments with accurate and timely solutions. Hire professional help today!",
    url: "assignment/anatomy/",
  },
  assignArchitecture: {
    title: "Seeking Professional Architecture Assignment Help | Scholarly Help",
    description:
      "Want someone to get first-class architecture assignment help. Luckily, you landed the right place. Scholarly Help will assist you with exceptional writing services at affordable rates.",
    url: "assignment/architecture/",
  },

  assignBiology: {
    title:
      "Do My Biology Assignment | Biology Assignment Help | Scholarly Help",
    description:
      'Scholarly Help is the ultimate solution to biology assignment help that provides high-quality "do my biology assignment" service and help you with biology',
    url: "assignment/biology/",
  },
  assignChemistry: {
    title:
      "Help Me Do My Chemistry Assignment | Chemistry Assignment Help | Scholarly Help",
    description:
      "Get flawless chemistry assignment help and uplift your grades. All you need to do is to ask Help me do my chemistry assignment.",
    url: "assignment/chemistry/",
  },
  assignComputer: {
    title: "Pay Someone to Do My Computer Science Assignment | Coding Help",
    description:
      "Struggling with coding? Hire experts to do your computer science assignments. Pay for accurate help with Python, Java, and more. Start now!",
    url: "assignment/computer-science/",
  },
  assignEconomics: {
    title: "Help Me Do My Economics Assignment For Me | Scholarly Help",
    description:
      "Do you seek help in your economics assignment? Hire Scholarly Help’s “do my economics assignment” at extremely affordable prices.",
    url: "assignment/economics/",
  },
  assignEngineering: {
    title: "Do My Engineering Homework For Me | Scholarly Help",
    description:
      "Pay someone to do my engineering assignment for me and take your grades to new heights. Let Scholarly Help do it for you to make you sit back and relax.",
    url: "assignment/engineering/",
  },
  assignEnglish: {
    title: "Take My English Assignment | Hire Experts to Do It for You",
    description:
      "Running out of time? Pay someone to take your English assignment. Hire experts for essays, grammar, and literature analysis. Affordable solutions now!",
    url: "assignment/english/",
  },
  assignFinance: {
    title: "Can Someone Do My Finance Assignment For Me? | Scholarly Help",
    description:
      'Scholarly Help is the gateway towards your academic success. Just ask us "do my finance assignment for me" and stand out.',
    url: "assignment/finance/",
  },
  assignHistory: {
    title: "Do My History Assignment | Pay for Professional Help",
    description:
      "Need history assignment help? Pay experts to do your assignments, from research papers to essays. Affordable, confidential, and fast services.",
    url: "assignment/history/",
  },
  assignHumanResourse: {
    title: "Pay Someone to Do My HR Assignment | Hire Professional Help",
    description:
      "Stuck on HR assignments? Pay someone to take your assignment and hire professionals for recruitment plans, strategies, and more. Get help now!",
    url: "assignment/human-resource/",
  },
  assignLaw: {
    title:
      "Help Me Do My Law Assignment | Write My Law Assignment For Me |Scholarly Help",
    description:
      'Can someone make my law assignment for me? Ask Scholarly Help "do my law assignment for me" and get trustworthy services.',
    url: "assignment/law/",
  },
  assignLinguistics: {
    title: "Get High-Quality Linguistics Assignment Help | Scholarly Help",
    description:
      "Help me do my linguistics assignment. At Scholarly Help, we provide the best linguistics assignment help through professional subject experts. We deliver unique content before the deadline.",
    url: "assignment/linguistics/",
  },
  assignMarketing: {
    title: "Hire Experts to Do My Marketing Assignment | Pay for Help",
    description:
      "Struggling with marketing assignments? Pay someone to do your case studies, strategy analysis, and more. Hire affordable experts today!",
    url: "assignment/marketing/",
  },
  assignMath: {
    title: "Take My Math Assignment | Pay Someone to Do It for Me",
    description:
      "Need math help? Hire experts to take your math assignments. Pay for reliable solutions in algebra, calculus, and more. Get help now!",
    url: "assignment/math/",
  },
  assignNursing: {
    title:
      "Write My Nursing Assignment | Do My Nursing Assignment | Scholarly Help",
    description:
      'Seeking someone to write my nursing assignment. Hire Scholarly Help to get "do my nursing assignment and increase your grades."',
    url: "assignment/nursing/",
  },
  assignOperationManagement: {
    title: "Pay Someone to Do My Operation Management Assignment",
    description:
      "Stuck with operation management? Hire experts to do your assignments on logistics, supply chains, and planning. Affordable help is just a click away!",
    url: "assignment/operation-management/",
  },
  assignOrganizationalBehavior: {
    title:
      "Acquire Exceptional Organizational Behavior Assignment Help | Scholarly Help",
    description:
      "Is the deadline for your assignment approaching fast? Let Scholarly Help aid you and provide the best organizational behavior assignment help to boost your performance in the class.",
    url: "assignment/organizational-behavior/",
  },
  assignPharmachology: {
    title:
      "Pharmacology Assignment Help | Do My Pharmacology Assignment | Scholarly Help",
    description:
      "Get next-level pharmacology assignment help to gain higher grades and boost your class performance by Scholarly Help",
    url: "assignment/pharmacology/",
  },
  assignPhilosophy: {
    title: "Hire Experts to Do My Philosophy Assignment | Pay for Help",
    description:
      "Struggling with philosophy assignments? Pay someone to do your essays and critical analysis. Hire professional help for fast, affordable solutions.",
    url: "assignment/philosophy/",
  },
  assignPhysics: {
    title: "Help Me Do My Physics Assignment for Me | Scholarly Help",
    description:
      'Physics is tough, so is its assignment. Ask Scholarly Help "do my physics assignment" and get it done in a flash.',
    url: "assignment/physics/",
  },
  assignPsychology: {
    title: "Pay Someone to Take My Psychology Assignment | Hire Experts",
    description:
      "Need help with psychology? Hire experts to take your assignments, from case studies to research. Affordable and confidential solutions available now.",
    url: "assignment/psychology/",
  },
  assignSociology: {
    title:
      "Do My Sociology Assignment For Me | Sociology Assignment Help | Scholarly Help",
    description:
      "Are you seeking sociology assignment help from a professional? Ask Scholarly Help to deliver top-notch assignment services and take your grades to next level.",
    url: "assignment/sociology/",
  },
  assignStatistics: {
    title: "Do My Statistics Assignment | Hire Stats Assignment Help",
    description:
      "Pay someone to do your statistics assignments. Get expert help with your statistics tasks and ensure accurate, timely solutions.",
    url: "assignment/statistics/",
  },
  // MetaData for Class Help Page
  classHelp: {
    title:
      "Pay Someone To Do My Online Class - Take My Online Class For Me - Scholarly Help",
    description:
      "Need online class help? Willing to hire someone to take my online class? We heard you! Let us help you get the grade you want. Instead, you pay someone, pay us to do your online class.",
    url: "class-help/",
  },
  // MetaData for Class Help Discount Page
  classHelpDiscount: {
    title: "FB Discount Class Help",
    description:
      "Need online class help? Willing to hire someone to take my online class? We heard you! Let us help you get the grade you want. Instead, you pay someone, pay us to do your online class.",
    url: "classhelpdiscount/",
  },
  // MetaData for Contact Us Page
  contactUs: {
    title: "Contact Scholarly Help | We're Here to Assist You",
    description:
      "Need help with assignments, exams, or online classes? Contact Scholarly Help today for prompt, reliable, and professional assistance.",
    url: "contact-us/",
  },
  // MetaData for Contact Us Page
  dissertationWritingServices: {
    title: "FB Online Class Help",
    description:
      "Need online class help? Willing to hire someone to take my online class? We heard you! Let us help you get the grade you want. Instead, you pay someone, pay us to do your online class.",
    url: "dissertation-writing-services/",
  },
  // MetaData for DoMyAleksForMe Page
  doMyAleksForMe: {
    title:
      "Pay Someone To Do My Online Class - Take My Online Class For Me - Scholarly Help",
    description:
      "Need online class help? Willing to hire someone to take my online class? We heard you! Let us help you get the grade you want. Instead, you pay someone, pay us to do your online class.",
    url: "do-my-aleks-for-me/",
  },
  // MetaData for doMyAssignment Page
  doMyAssignment: {
    title: "Help Me Do My Assignment | Online Assignment Help | Scholarly Help",
    description:
      "Need online assignment help? Do you know you can pay someone to do assignment? We are always there to help on your call - do my assignment for me. Contact now!",
    url: "do-my-assignment/",
  },
  // MetaData for doMyClass Page
  doMyClass: {
    title:
      "Pay Someone To Do My Online Class - Take My Online Class For Me - Scholarly Help",
    description:
      "Need online class help? Willing to hire someone to take my online class? We heard you! Let us help you get the grade you want. Instead, you pay someone, pay us to do your online class.",
    url: "do-my-class/",
  },
  // MetaData for doMyClass1 Page
  doMyClass1: {
    title: "(For Tiktok) - Do My Class Online | Scholarly Help",
    description:
      "Need online class help? Willing to hire someone to take my online class? We heard you! Let us help you get the grade you want. Instead, you pay someone, pay us to do your online class.",
    url: "do-my-class-1/",
  },
  // MetaData for doMyClass2 Page
  doMyClass2: {
    title:
      "Pay Someone To Do My Online Class - Take My Online Class For Me - Scholarly Help",
    description:
      "Need online class help? Willing to hire someone to take my online class? We heard you! Let us help you get the grade you want. Instead, you pay someone, pay us to do your online class.",
    url: "do-my-class-2/",
  },
  // MetaData for doMyExam Page
  doMyExam: {
    title: "Do My Exam | Scholarly Help",
    description:
      "Looking to pay someone to do your exam? Need to hire someone to take your online exam? Look no further! We provide expert online exam help to ensure good grades. Contact us now for reliable assistance and achieve your desired results.",
    url: "do-my-exam/",
  },
  // MetaData for essayWriting Page
  essayWriting: {
    title: "Pay Someone to Write Your Essay | Hire Essay Writing Experts",
    description:
      "Need help with essays? Hire professionals to take care of your essay writing. Pay for affordable, plagiarism-free services and get it done today!",
    url: "essay-writing/",
  },
  // MetaData for exams Page
  exams: {
    title: "Take My Exam for Me | Pay Someone to Do My Test Online | Exam Help",
    description:
      "Need help with your exam? Hire trusted experts to take your exam or do your test online—secure, private, and available 24/7 for guaranteed results",
    url: "exams/",
  },
  examAccounting: {
    title: "Take My Accounting Exam | Do My Accounting Test for Me",
    description:
      "Struggling with your accounting exam? Hire an accounting test taker to handle your exam professionally. Pay for reliable assistance today.",
    url: "exams/accounting/",
  },
  examEconomics: {
    title:
      "Take My Online Economics Exam for Me | Economics Quiz Help | Scholarly Help",
    description:
      'Scholarly Help provides "take my online economics exam for me" services to deliver the utmost economics exam help. Get "do my economics exam" help and and take your scores to next level.',
    url: "exams/economics/",
  },
  examEnglish: {
    title: "Take My English Test | English Quiz Help and Exam Services",
    description:
      "Need help with English exams? Let an expert take your English test for you. Pay for reliable quiz and exam solutions.",
    url: "exams/english/",
  },
  examNursing: {
    title:
      "Take My Online Nursing Exam for Me - Nursing Test Helper - Scholarly Help",
    description:
      'Scholarly Help provides "take my online nursing exam" service to deliver the best nursing test helpers. Get the most reliable nursing exam help to produce a unique paper for you.',
    url: "exams/nursing/",
  },
  examOperationManagement: {
    title: "Take My Operations Management Exam | Expert Exam Help",
    description:
      "Pay for professional help with operations management exams. Let experts handle your online tests for accurate and reliable solutions.",
    url: "exams/operation-management/",
  },
  examPsychology: {
    title: "Take My Psychology Exam | Reliable Exam Help",
    description:
      "Hire professionals to take your psychology exam for you. Pay for accurate, confidential psychology test solutions at Scholarly Help.",
    url: "exams/psychology/",
  },
  examStatistics: {
    title: "Take My Statistics Exam | Pay for Reliable Statistics Test Help",
    description:
      "Struggling with your statistics exam or quiz? Let experts handle it. Pay for accurate statistics test solutions today.",
    url: "exams/statistics/",
  },
  // MetaData for HelpMeWithMyExam Page
  helpMeWithMyExam: {
    title:
      "Help Me With My Exam | Pay Someone to Take my Online Exam - Scholarly Help",
    description:
      "Looking to pay someone to do your exam? Need to hire someone to take your online exam? Look no further! We provide expert online exam help to ensure good grades. Contact us now for reliable assistance and achieve your desired results.",
    url: "help-me-with-my-exam/",
  },
  // MetaData for HomeWork Page
  homeWork: {
    title: "Homework Help Online | Pay Someone to Do My Homework for Me",
    description:
      "Need help with homework? Pay someone to do your homework Today! Reliable, affordable, and secure services to make homework stress-free. hire homework helper online!",
    url: "homework/",
  },
  homeAccounting: {
    title: "Do My Accounting Homework | Pay for Professional Homework Help",
    description:
      "Let experts do your accounting homework. Pay for high-quality assistance and get accurate, timely solutions at Scholarly Help.",
    url: "homework/accounting/",
  },
  homeArchitecture: {
    title:
      "Pay Someone To Do My Homework | Online Homework Help | Scholarly Help",
    description:
      "Doing architecture homework could be difficult. That’s where Scholarly Help comes. With “do my architecture homework” services, boost your score effortlessly.",
    url: "homework/architetcure/",
  },
  homeArt: {
    title: "Hire an Expert to Do My Art Homework for Me | Scholarly Help",
    description:
      "Experience high-quality “do my art homework” services with Scholarly Help and elevate your grades. Our professional subject experts complete your homework efficiently.",
    url: "homework/art/",
  },
  homeBiology: {
    title:
      "I Need Help with My Biology Homework | Do My Biology Homework | Scholarly Help",
    description:
      "Have you been assigned homework on an urgent deadline? Hire “do my biology homework” service now and stand out.",
    url: "homework/biology/",
  },
  homeChemistry: {
    title:
      "Pay Someone to Do My Chemistry Homework for Me | Help Me with My Chemistry Homework | Scholarly Help",
    description:
      "Experience high-quality “do my chemistry homework” services to boost your score. Scholarly Help is a renowned platform that delivers top-notch homework services.",
    url: "homework/chemistry/",
  },
  homeComputerScience: {
    title: "Do My Computer Science Homework | Programming Assignment Help",
    description:
      "Pay for expert help with your computer programming homework. Let professionals handle your assignments efficiently.",
    url: "homework/computer-science/",
  },
  homeEconomics: {
    title: "Pay Someone to Do My Economics Homework for Me | Scholarly Help",
    description:
      "Do you seek help in your economics homework? Hire Scholarly Help’s “do my economics homework” at extremely affordable prices.",
    url: "homework/economics/",
  },
  homeEngineering: {
    title:
      "Ask a Professional to Do My Engineering Homework for Me | Scholarly Help",
    description:
      "Pay someone to do my engineering homework and take your grades to new heights. Let Scholarly Help do it for you to make you sit back and relax.",
    url: "homework/engineering/",
  },
  homeEnglish: {
    title: "Do My English Homework | Solve My Homework for Me",
    description:
      "Need help with English homework? Pay someone to do your assignments and get accurate solutions fast with Scholarly Help.",
    url: "homework/english/",
  },
  homeFinance: {
    title:
      "Seeking Help with My Finance Homework | Do My Finance Homework for Me | Scholarly Help",
    description:
      "Ask Scholarly Help to “do my finance homework for me” and get high-quality content. We aid you to complete your work on time and get straight A’s.",
    url: "homework/finance/",
  },
  homeGeography: {
    title: "Need an Expert to Do My Geography Homework for Me | Scholarly Help",
    description:
      "At Scholarly Help, get the most reliable “do my geography homework” at affordable prices without disclosing your identity. It’s time to stand first in class.",
    url: "homework/geography/",
  },
  homeHistory: {
    title: "Do My History Homework | Reliable History Assignment Help",
    description:
      "Pay for expert help with your history homework. Let professionals handle your assignments for timely and accurate solutions.",
    url: "homework/history/",
  },
  homeHumanResources: {
    title: "Human Resources Homework Help | Reliable Assignment Solutions",
    description:
      "Need help with human resources homework? Pay for expert assistance and get accurate solutions for all your HR assignments.",
    url: "homework/human-resources/",
  },
  homeLaw: {
    title:
      "Looking for Law Homework Help | Help Me Do My Law Homework | Scholarly Help",
    description:
      "Take your law grades to new heights by getting “do my law homework” services. At Scholarly Help, we help students worldwide by delivering the most reliable services.",
    url: "homework/law/",
  },
  homeLinguististics: {
    title:
      "Help Me Do My Linguistics Homework | Linguistics Homework Help | Scholarly Help",
    description:
      "Help me do my linguistics homework. At Scholarly Help, we provide best homework services through professional subject experts. We deliver unique content before the deadline.",
    url: "homework/linguististics/",
  },
  homeMarketing: {
    title: "Do My Marketing Homework | Professional Homework Help",
    description:
      "Pay for marketing homework solutions from experts. Get your assignments done accurately and on time at Scholarly Help.",
    url: "homework/marketing/",
  },
  homeMath: {
    title: "Do My Math Homework | Solve My Math Problems Online",
    description:
      "Pay someone to solve your math homework. Get accurate solutions and reliable help with all your math problems at Scholarly Help.",
    url: "homework/math/",
  },
  homeNursing: {
    title: "Choose an Expert to Do My Nursing Homework | Scholarly Help",
    description:
      "Who can do my nursing homework for me? Ask this query to Scholarly Help and get immediate assistance. We help you achieve high grades effortlessly.",
    url: "homework/nursing/",
  },
  homeOperationManagement: {
    title: "Do My Operations Management Homework | Reliable Solutions",
    description:
      "Need help with operations management homework? Pay for professional assistance and get your assignments done on time.",
    url: "homework/operation-management/",
  },
  homePharmacology: {
    title: "Get the Most Reliable Pharmacology Homework Help | Scholarly Help",
    description:
      "Seek pharmacology homework help if you are looking to complete your project on time. Scholarly Help holds a series of subject experts to get you bloated grades.",
    url: "homework/pharmacology/",
  },
  homePhilosophy: {
    title: "Do My Philosophy Homework | Expert Homework Help",
    description:
      "Pay for professional help with philosophy homework. Let experts solve your assignments with accuracy and confidentiality.",
    url: "homework/philosophy/",
  },
  homePhysics: {
    title:
      "Pay Someone to Do My Physics Homework for me | Help Me with My Physics Homework | Scholarly Help",
    description:
      "Get our “do my physics homework” services and get your homework done within no time. We assure guaranteed results.",
    url: "homework/physics/",
  },
  homePsychology: {
    title: "Do My Psychology Homework | Pay for Expert Help",
    description:
      "Get professional help with your psychology homework. Pay for accurate, reliable assistance with all your assignments at Scholarly Help.",
    url: "homework/psychology/",
  },
  homeSociology: {
    title: "I Need Someone to Do My Sociology Homework for Me | Scholarly Help",
    description:
      "Can someone do my sociology homework for me? Absolutely! Hire Scholarly Help and get highly-skilled subject experts to complete your task on time.",
    url: "homework/sociology/",
  },
  homeStatistics: {
    title: "Do My Statistics Homework | Pay for Accurate Solutions",
    description:
      "Need help with statistics homework? Pay someone to do it for you. Get accurate, timely solutions with Scholarly Help.",
    url: "homework/statistics/",
  },
  // MetaData for Online Class Page
  onlineClass: {
    title:
      "Online Classes Help from the Best Class Takers – Let’s Get You an A!",
    description:
      " Get full online class help with Scholarly Help. Pay someone to take your online class, finish assignments, and ace your course with the best class taker online.",
    url: "online-class/",
  },
  onlineAccounting: {
    title: "Take My Online Accounting Class | Reliable Accounting Class Help",
    description:
      "Need someone to handle your online accounting class? Pay for reliable class help and achieve stress-free results.",
    url: "online-class/accounting/",
  },
  onlineBiology: {
    title: "Help Me Take My Online Biology Class for Me - Scholarly Help",
    description:
      "Who can take my online biology class for me? Put your queries in front of Scholarly Help and get the most reliable online class services affordably.",
    url: "online-class/biology/",
  },
  onlineChemistry: {
    title: "Take My Online Chemistry Class for Me - Scholarly Help",
    description:
      'Stop memorizing chemistry complicated formulas and hire "take my online chemistry class" service to get rid of cramming. Scholarly Help is always there to aid you.',
    url: "online-class/chemistry/",
  },
  onlineComputerScience: {
    title: "Take My Online Computer Science Class | Professional Help Online",
    description:
      "Struggling with your online computer science class? Let experts take it for you and ensure timely and accurate solutions.",
    url: "online-class/computer-science/",
  },
  onlineEngineering: {
    title: "Help Me Take My Online Engineering Class - Scholarly Help",
    description:
      'Stop bashing your head against complex engineering problems and ask Scholarly Help "take my online engineering class" to get the most reliable services.',
    url: "online-class/engineering/",
  },
  onlineEnglish: {
    title: "Take My Online English Class | Pay for Expert Assistance",
    description:
      "Need help with your online English class? Hire professionals to handle it for you and ensure top-quality results.",
    url: "online-class/english/",
  },
  onlineFinance: {
    title: "Take My Online Finance Class For Me - Scholarly Help",
    description:
      '"Hire Scholarly Help\'s take my online finance class for me" service and get a gateway towards success.',
    url: "online-class/finance/",
  },
  onlineHistory: {
    title: "Take My Online History Class | Expert Class Solutions",
    description:
      "Let experts take your online history class for you. Pay for accurate and professional class assistance today.",
    url: "online-class/history/",
  },
  onlineMarketing: {
    title: "Take My Online Marketing Class | Stress-Free Class Help",
    description:
      "Need help with your marketing class? Hire professionals to take your online class and deliver quality outcomes on time.",
    url: "online-class/marketing/",
  },
  onlineMath: {
    title: "Take My Online Math Class | Algebra and Calculus Class Help",
    description:
      "Struggling with math? Pay someone to take your online algebra or calculus class and get guaranteed results with Scholarly Help.",
    url: "online-class/math/",
  },
  onlineNursing: {
    title: "Take My Nursing Class For Me - Scholarly Help",
    description:
      'Nursing is as tough as medical. Do not overburden yourself, when Scholarly Help is there to aid you. Get our "take my nursing class for me" and stand out',
    url: "online-class/nursing/",
  },
  onlinePsychology: {
    title: "Take My Online Psychology Class | Reliable Class Help",
    description:
      'Need assistance with your online psychology class? Let experts handle it for you and ensure accurate and stress-free results."',
    url: "online-class/psychology/",
  },
  onlineStatistics: {
    title: "Take My Online Statistics Class | Professional Class Help Online",
    description:
      "Pay someone to take your online statistics class. Get professional help and guaranteed success with your class at Scholarly Help.",
    url: "online-class/statistics/",
  },

  // MetaData for Order Page
  order: {
    title: "About us | Online Help with Money Back Guarantee - Scholarly Help",
    description:
      "Scholarly Help’s academic writing services are both affordable and high-quality. We are reliable online tutors. For higher scores on your tests, homework, and assignments, rely on our subject specialists. We can also assist you with writing an essay.",
    url: "order/",
  },
  // MetaData for Pay For Someone to write my Paper Page
  paySomeoneToWritePaper: {
    title:
      "Pay Someone To Do My Online Class - Take My Online Class For Me - Scholarly Help",
    description:
      "Need online class help? Willing to hire someone to take my online class? We heard you! Let us help you get the grade you want. Instead, you pay someone, pay us to do your online class.",
    url: "pay-for-someone-to-write-my-paper/",
  },
  // MetaData for Pay Someone to do my Assignment Page
  paySomeoneDoAssignment: {
    title: "Do My Exam | Scholarly Help",
    description:
      "Looking to pay someone to do your exam? Need to hire someone to take your online exam? Look no further! We provide expert online exam help to ensure good grades. Contact us now for reliable assistance and achieve your desired results.",
    url: "pay-someone-to-do-my-assignment/",
  },
  // MetaData for Pay Someone to do my Edgenuity Page
  paySomeoneToDoMyEdgenuity: {
    title:
      "Pay Someone To Do My Online Class - Take My Online Class For Me - Scholarly Help",
    description:
      "Need online class help? Willing to hire someone to take my online class? We heard you! Let us help you get the grade you want. Instead, you pay someone, pay us to do your online class.",
    url: "pay-someone-to-do-my-edgenuity/",
  },
  // MetaData for Pay Someone to do my Aleks Page
  paySomeoneDoOnlineExam: {
    title: "Pay Someone To Take My Online Exam | Scholarly Help",
    description:
      "Scholarly Help’s academic writing services are both affordable and high-quality. We are reliable online tutors. For higher scores on your tests, homework, and assignments, rely on our subject specialists. We can also assist you with writing an essay.",
    url: "pay-someone-to-do-my-online-exam/",
  },
  // MetaData for Privacy Page
  privacy: {
    title: "Privacy Policy | Scholarly Help",
    description:
      "Learn how Scholarly Help safeguards your personal data. Read our privacy policy to understand our commitment to data protection, security, and transparency.",
    url: "privacy/",
  },
  // MetaData for Samples Page
  samples: {
    title: "Explore Assignment Samples | High-Quality Work Examples",
    description:
      "Scholarly Help’s academic writing services are both affordable and high-quality. We are reliable online tutors. For higher scores on your tests, homework, and assignments, rely on our subject specialists. We can also assist you with writing an essay.Check out high-quality assignment samples by Scholarly Help. View examples of essays, research, and projects we’ve successfully delivered.",
    url: "samples/",
  },
  // MetaData for Save My Time Page
  savemyTime: {
    title: "Save time",
    description:
      "Need online class help? Willing to hire someone to take my online class? We heard you! Let us help you get the grade you want. Instead, you pay someone, pay us to do your online class.",
    url: "savemytime/",
  },
  // MetaData for Take My Class Page
  takeMyClass: {
    title: "FB Online Class Help",
    description:
      "Need online class help? Willing to hire someone to take my online class? We heard you! Let us help you get the grade you want. Instead, you pay someone, pay us to do your online class.",
    url: "take-my-class/",
  },
  // MetaData for Take My Exam Page
  takeMyExam: {
    title: "Take My Exam",
    description:
      "Looking to pay someone to do your exam? Need to hire someone to take your online exam? Look no further! We provide expert online exam help to ensure good grades. Contact us now for reliable assistance and achieve your desired results.",
    url: "take-my-exam/",
  },
  // MetaData for Take My Proctored Exam Page
  takeMyProctoredExam: {
    title: "Proctored Exam Help - Take My Online Exam - Scholarly Help",
    description:
      "Looking to pay someone to do your exam? Need to hire someone to take your online exam? Look no further! We provide expert online exam help to ensure good grades. Contact us now for reliable assistance and achieve your desired results.",
    url: "take-my-proctored-exam-for-me/",
  },
  // MetaData for Term and Conditions Page
  termsAndConditions: {
    title: "Terms & Conditions | Scholarly Help Policies and Guidelines",
    description:
      "Learn about Scholarly Help's terms and conditions, including service policies, payments, privacy, and usage guidelines. Stay informed today.",
    url: "terms-and-conditions/",
  },
  // MetaData for Tools Page
  tools: {
    title: "Free Academic Tools for Students & Researchers | Scholarly Help",
    description:
      "Access free academic tools for students and researchers! From citation generators to plagiarism checkers, boost your productivity and enhance your research with ease.",
    url: "tools/",
  },
  // MetaData for Write my Paper Page
  writeMyPaper: {
    title:
      "Write My Essay | Essay Writing Services | No Advance Payment - Scholarly Help",
    description:
      "Scholarly Help has got best essay writers. We are a reliable option for you when it comes to urgent, fast and legit essay writing services. Order us to write my essay now!",
    url: "write-my-paper/",
  },
};
// scan
// scan/excercise
// scan/login
// scan/payment-successful
// scan/payment-unsuccessful
// scan/plans
// scan/register
// tools/miles-to-millimeters
// thank-you
// thank-you-2
// thank-you-3
