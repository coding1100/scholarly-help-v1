"use client";

import { FC } from "react";
import React from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Icons & Images
import Trustpilot from "@/app/assets/Images/Trustpilot.webp";
import StarGroup from "@/app/assets/Images/starGroup.png";

import Verifiend from "@/app/assets/Images/reviews/verified.png";

// Desktop Reviews
// import Review1 from "@/app/assets/Images/reviews/1.png";
// import Review2 from "@/app/assets/Images/reviews/2.png";
// import Review3 from "@/app/assets/Images/reviews/3.png";
// import Review4 from "@/app/assets/Images/reviews/4.png";
// import Review5 from "@/app/assets/Images/reviews/5.png";
// import Review6 from "@/app/assets/Images/reviews/6.png";
// import Review7 from "@/app/assets/Images/reviews/7.png";
// import Review8 from "@/app/assets/Images/reviews/8.png";
// import Review9 from "@/app/assets/Images/reviews/9.png";
// import Review10 from "@/app/assets/Images/reviews/10.png";

// // Mobile Reviews
// import mobileReview1 from "@/app/assets/Images/mobileReviews/1.png";
// import mobileReview2 from "@/app/assets/Images/mobileReviews/2.png";
// import mobileReview3 from "@/app/assets/Images/mobileReviews/3.png";
// import mobileReview4 from "@/app/assets/Images/mobileReviews/4.png";
// import mobileReview5 from "@/app/assets/Images/mobileReviews/5.png";
// import mobileReview6 from "@/app/assets/Images/mobileReviews/6.png";
// import mobileReview7 from "@/app/assets/Images/mobileReviews/7.png";
// import mobileReview8 from "@/app/assets/Images/mobileReviews/8.png";
// import mobileReview9 from "@/app/assets/Images/mobileReviews/9.png";
// import mobileReview10 from "@/app/assets/Images/mobileReviews/10.png";
// import mobileReview11 from "@/app/assets/Images/mobileReviews/11.png";
// import mobileReview12 from "@/app/assets/Images/mobileReviews/12.png";
// import mobileReview13 from "@/app/assets/Images/mobileReviews/13.png";
// import mobileReview14 from "@/app/assets/Images/mobileReviews/14.png";
// import mobileReview15 from "@/app/assets/Images/mobileReviews/15.png";
// import mobileReview16 from "@/app/assets/Images/mobileReviews/16.png";
// import mobileReview17 from "@/app/assets/Images/mobileReviews/17.png";
// import mobileReview19 from "@/app/assets/Images/mobileReviews/19.png";
// import mobileReview20 from "@/app/assets/Images/mobileReviews/20.png";
// import mobileReview21 from "@/app/assets/Images/mobileReviews/21.png";
// import mobileReview22 from "@/app/assets/Images/mobileReviews/22.png";
// import mobileReview23 from "@/app/assets/Images/mobileReviews/23.png";
// import mobileReview24 from "@/app/assets/Images/mobileReviews/24.png";
// import mobileReview25 from "@/app/assets/Images/mobileReviews/25.png";
// import mobileReview26 from "@/app/assets/Images/mobileReviews/26.png";
// import mobileReview27 from "@/app/assets/Images/mobileReviews/27.png";
// import mobileReview28 from "@/app/assets/Images/mobileReviews/28.png";
// import mobileReview29 from "@/app/assets/Images/mobileReviews/29.png";
// import mobileReview30 from "@/app/assets/Images/mobileReviews/30.png";
// import mobileReview32 from "@/app/assets/Images/mobileReviews/32.png";
// import mobileReview33 from "@/app/assets/Images/mobileReviews/33.png";
// import mobileReview35 from "@/app/assets/Images/mobileReviews/34.png";
// import mobileReview36 from "@/app/assets/Images/mobileReviews/35.png";
// import mobileReview37 from "@/app/assets/Images/mobileReviews/36.png";
// import mobileReview38 from "@/app/assets/Images/mobileReviews/37.png";
// import mobileReview39 from "@/app/assets/Images/mobileReviews/38.png";
// import mobileReview40 from "@/app/assets/Images/mobileReviews/39.png";
// import mobileReview42 from "@/app/assets/Images/mobileReviews/41.png";
// import mobileReview43 from "@/app/assets/Images/mobileReviews/42.png";
// import mobileReview44 from "@/app/assets/Images/mobileReviews/43.png";
// import mobileReview45 from "@/app/assets/Images/mobileReviews/44.png";
// import mobileReview46 from "@/app/assets/Images/mobileReviews/45.png";
// import mobileReview47 from "@/app/assets/Images/mobileReviews/46.png";
// import mobileReview50 from "@/app/assets/Images/mobileReviews/49.png";
// import mobileReview51 from "@/app/assets/Images/mobileReviews/50.png";
// import mobileReview52 from "@/app/assets/Images/mobileReviews/51.png";
// import mobileReview53 from "@/app/assets/Images/mobileReviews/52.png";
// import mobileReview54 from "@/app/assets/Images/mobileReviews/53.png";
// import mobileReview55 from "@/app/assets/Images/mobileReviews/54.png";
// import mobileReview56 from "@/app/assets/Images/mobileReviews/55.png";
// import mobileReview57 from "@/app/assets/Images/mobileReviews/56.png";
// import mobileReview58 from "@/app/assets/Images/mobileReviews/57.png";
// import mobileReview59 from "@/app/assets/Images/mobileReviews/58.png";
// import mobileReview60 from "@/app/assets/Images/mobileReviews/59.png";
// import mobileReview61 from "@/app/assets/Images/mobileReviews/60.png";
// import mobileReview62 from "@/app/assets/Images/mobileReviews/61.png";
// import mobileReview63 from "@/app/assets/Images/mobileReviews/62.png";
// import mobileReview64 from "@/app/assets/Images/mobileReviews/64.png";
// import mobileReview65 from "@/app/assets/Images/mobileReviews/65.png";
// import mobileReview66 from "@/app/assets/Images/mobileReviews/66.png";
// import mobileReview67 from "@/app/assets/Images/mobileReviews/67.png";
// import mobileReview68 from "@/app/assets/Images/mobileReviews/68.png";
// import mobileReview69 from "@/app/assets/Images/mobileReviews/69.png";
// import mobileReview70 from "@/app/assets/Images/mobileReviews/70.png";

// Content Arrays
// const desktopReviews = [
//   Review1,
//   Review2,
//   Review3,
//   Review4,
//   Review5,
//   Review6,
//   Review7,
//   Review8,
//   Review9,
//   Review10,
// ];

// const mobileReviews = [
//   mobileReview1,
//   mobileReview2,
//   mobileReview3,
//   mobileReview4,
//   mobileReview5,
//   mobileReview6,
//   mobileReview7,
//   mobileReview8,
//   mobileReview9,
//   mobileReview10,
//   mobileReview11,
//   mobileReview12,
//   mobileReview13,
//   mobileReview14,
//   mobileReview15,
//   mobileReview16,
//   mobileReview17,
//   mobileReview19,
//   mobileReview20,
//   mobileReview21,
//   mobileReview22,
//   mobileReview23,
//   mobileReview24,
//   mobileReview25,
//   mobileReview26,
//   mobileReview27,
//   mobileReview28,
//   mobileReview29,
//   mobileReview30,
//   mobileReview32,
//   mobileReview33,
//   mobileReview35,
//   mobileReview36,
//   mobileReview37,
//   mobileReview38,
//   mobileReview39,
//   mobileReview40,
//   mobileReview42,
//   mobileReview43,
//   mobileReview44,
//   mobileReview45,
//   mobileReview46,
//   mobileReview47,
//   mobileReview50,
//   mobileReview51,
//   mobileReview52,
//   mobileReview53,
//   mobileReview54,
//   mobileReview55,
//   mobileReview56,
//   mobileReview57,
//   mobileReview58,
//   mobileReview59,
//   mobileReview60,
//   mobileReview61,
//   mobileReview62,
//   mobileReview63,
//   mobileReview64,
//   mobileReview65,
//   mobileReview66,
//   mobileReview67,
//   mobileReview68,
//   mobileReview69,
//   mobileReview70,
// ];

const reviews = [
  {
    title: "My experience has been nothing short of great",
    description:
      "My experience has been nothing short of great. When I need assistance and support with different subjects. Scholar Help...",
  },
  {
    title: "Best service ever, trust me 🙏",
    description:
      "I had a great team walk me through the process of how everything was going to work. They were fast at communicating and one of the best parts is that I got...",
  },
  {
    title: "I received excellent assistance with my economics exam",
    description:
      "I received excellent assistance with my economics exam through this platform. The expert was extremely helpful, going...",
  },
  {
    title: "I cannot express my gratitude to these tutors",
    description:
      "I cannot express my gratitude to these tutors and their expertise. If you have any doubts as I did, I contest they were...",
  },
  {
    title: "Exceptional Academic Support That Exceeds Expectations!",
    description:
      "I recently had the opportunity to use scholarly help.com for assistance with my Accounting class, and I was thoroughly...",
  },
  {
    title: "Incredible and Reliable",
    description:
      "Scholarly Help has been an incredible resource that greatly contributed to my success in passing my class. Their team is outstanding, always providing timely...",
  },
  {
    title: "Very great service and reliable",
    description: "Very great service and reliable",
  },
  {
    title: "I don't even know where to start",
    description:
      "I don't even know where to start. I don't even know the words to use for this people because they are the best and amazing .They came to my rescue for my classes...",
  },
  {
    title: "Excellent service/communication",
    description:
      "Definitely one of the best services I ever received pertaining school work. Was in a rush & needed to pass & they helped me! Not only did I pass my exam with...",
  },
  {
    title: "This service has been great helped me",
    description:
      "This service has been great helped me through my math class with ease thank you guys for your hard work.",
  },
  {
    title: "was a great help and communicated",
    description: "was a great help and communicated throughout the process.",
  },
  {
    title: "Great advising and service.",
    description:
      "Great advising and service. completed my assignments essays homework's effectively.",
  },
  {
    title: "They have been great and very helpful",
    description:
      "They have been great and very helpful deserving more of 5 stars.",
  },
  {
    title: "Great work am very happy they do a",
    description: "Great work am very happy they do a great job.",
  },
  {
    title: "This is 100% real",
    description:
      "This is 100% real. They saved me just in time! 10/10 recommend.",
  },
  {
    title: "Let me first start off by saying I AM A",
    description:
      "Let me first start off by saying I AM A REAL CUSTOMER !!! Nothing promoted this way or no funny business here! SCHOLARLY is the...",
  },
  {
    title: "They are always there for me",
    description:
      "They are always there for me, very reliable, and they are very smart.",
  },
  {
    title: "Thank You!",
    description:
      "I thought it was a scam tbh, but these guys helped me pass my exam! 🙏",
  },
  {
    title: "Amazing Work",
    description:
      "Was having a panic attack but they help me pass with flying colors i appreciate you guys so much an thank you for all of your help even with short notice they got...",
  },
  {
    title: "They are a lifesaver no joke",
    description:
      "They are a lifesaver no joke, they communicate everything before the and after the day of the exam. The day of the exam everything went so smoothly...",
  },
  {
    title: "Life Saver",
    description:
      "They are a life saver. Everything they do is legitimate. The prices are great, and affordable. I would recommend this to anyone struggling in a class...",
  },
  {
    title: "They were fantastic",
    description:
      "They were fantastic! They were able to get me the results I wanted in a timely manner. They were with me every step of the way and were in reach whenever I needed...",
  },
  {
    title: "Highly recommended",
    description:
      "Highly recommended! I was skeptical at first but someone always communicated with me about everything. A's on all assignments/essay with no plagiarism...",
  },
  {
    title: "Highly recommend!",
    description:
      "Highly recommend!! I was nervous using one of these services but I am so grateful that I can fully trust them. I was talked to and kept in the loop the whole time...",
  },
  {
    title: "Very reliable and trustworthy",
    description:
      "Very reliable and trustworthy! Great communication and helped me with my assignments! Looking forward on booking for future assignments",
  },
  {
    title: "I could not be happier with my results",
    description:
      "I could not be happier with my results 'Quick service & very trustworthy'",
  },
  {
    title: "Great job",
    description:
      "They were very professional and responsive. Got every task done in a timely and accurate manner",
  },
  {
    title: "I had a great experience",
    description:
      "I had a great experience! Scholarly help landed me a 97% in my statistics class. I am forever grateful and will be using their services again very soon.",
  },
  {
    title: "Very fast and quick help on an exam",
    description:
      "Very fast and quick help on an exam. Great communication and tutor knew the content helping me get a high B...",
  },
  {
    title: "These guys are legit..they delivered as",
    description:
      "These guys are legit.. they delivered as promised based on the agreed upon timelines. Excellent work and will use....",
  },
  {
    title: "So my experience with Scholary was",
    description:
      "So my experience with Scholary was amazing. The responses was really quick and the work was done quickly! 100/100",
  },
  {
    title: "They saved me from failing",
    description:
      "They completed all my assignments on time with precision I will definitely be using them again",
  },
  {
    title: "Let Scholarly Help.. Help You!!!",
    description:
      "First let me just start off by saying Thank You! Scholarly Help has really helped me on this journey to get my degree. I've used them sooooo many times...",
  },
  {
    title: "I will be totally honest I was very",
    description:
      "I will be totally honest I was very skeptical about finding services to help with school work, but I must say Scholarly...",
  },
  {
    title: "If it was possible to give 6 stars I",
    description:
      "If it was possible to give 6 stars I would! The tutors help and expertise were evident from the start and they helped me handle all complicated coursework...",
  },
  {
    title: "Great Help!",
    description:
      "I am very glad I came across this company. They helped tremendously with my class due to I had two other strenuous classes I was taking at the same time...",
  },
  {
    title: "Business Statistics Online Exam: Earned an A on exam!!!",
    description:
      "I had a great experience in which Scholarly Help assisted me with a score of 126/140 (90%) on my final exam. Very professional...",
  },
  {
    title: "Not a scam!!",
    description:
      "Let me start off by saying they are 100% real and not a scam like we all think at first. Best choice I've ever made took so much stress off of me and they are fast...",
  },
  {
    title: "Excellent team, great support Fast responses",
    description:
      "Oh wow they jumped in, helped me clear an exam I was dredding and woop got a 96% on it. Totally nice folks, really easy...",
  },
  {
    title: "If I could rate higher I would",
    description:
      "If I could rate higher I would! They are so effective and so amazing truly their team is the best if you need any courses done. I work two jobs and work more than 90+...",
  },
  {
    title: "Score for Scholarly Help",
    description:
      "Hi, to whom it may regard. Scholarly Help is available for responding quickly and punctually. I love how they do what's best on my end but confirm before they do it...",
  },
  {
    title: "100 percent legit",
    description:
      "100 percent legit. I was really nervous because I didn't want so be scammed but, they were nice enough to help ease my mind. They were patient and...",
  },
  {
    title: "Genuine & Affordable!",
    description:
      "I have tried their exam services for the second time. I have to say that they are genuine. My friend, who orders them frequently, told me about their services...",
  },
  {
    title: "I try so many education helper",
    description:
      "I try so many education helper. Most of them are scam. This one is not. They are very professional and helpful to get job done by due. If you are someone...",
  },
  {
    title: "Great experience and service!",
    description:
      "I was unsure about this service but decided to use anyways and had an amazing experience! Experts were available, reliable, and super helpful. I'm super grateful! Thank you!!!",
  },
  {
    title: "Paid only 150$ for my exam and they got",
    description:
      "Paid only 150$ for my exam and they got me a B+ after only 2 days notice. Can't complain. Very easy to deal with as they answer quick and they do take paypal.",
  },
  {
    title: "They helped with two math assignments I",
    description:
      "They helped with two math assignments I have and received 100 on both. Thanks for the help Awesome service.",
  },
  {
    title: "my favs",
    description:
      "Very nice and reliable and quick responses, gets the job done. Grateful for everything they do. I recommend to anyone needing some work done.",
  },
  {
    title: "Great experience",
    description:
      "Got 100% on an assignment that worth 10% of my grade in such a short notice, very flexible, kept me updated. Will definitely not be my last thing with them",
  },
  {
    title: "Very Responsive",
    description:
      "Scholarly is very responsive, helpful, reliable and professional. I recommend them for the services they provide. They give you that peace of mind 👋👋👋👋",
  },
  {
    title: "They do a great job",
    description:
      "They do a great job! Assignments are done correctly and on time. 10/10 would recommend.",
  },
  {
    title: "Top-tier service",
    description:
      "Top-tier service. I highly recommend. Very professional as well. Thank you so much. I will be using this service very frequently.",
  },
  {
    title: "This service is amazing",
    description:
      "This service is amazing! They were friendly and very helpful! Helped me pass my math! Thank you so much 🤍",
  },
  {
    title: "last moment savers",
    description:
      "they saved me on last moment. i was stuck in exam, failed it twice, their experts got B+ in first attempt.",
  },
  {
    title: "Very easy company to work with",
    description:
      "Very easy company to work with, replied promptly and finished task before due date. Would work with them again.",
  },
  {
    title: "Very helpful and very quick with any",
    description:
      "Very helpful and very quick with any questions I had I will be looking to use in the future.",
  },
  {
    title: "I messaged them the last minute and",
    description:
      "I messaged them the last minute and they completed everything on time and they were very helpful! I highly recommend",
  },
  {
    title: "Life savers!",
    description:
      "They have helped me multiple times! They are quick to respond and are the best! I will definitely be using them for any additional help.",
  },
  {
    title: "Reliable and always do a great job",
    description:
      "Reliable and always do a great job. I really appreciate their responsiveness and professionalism.",
  },
  {
    title: "Amazing Customer Service",
    description:
      "Amazing customer support everything was fast and accurate. I am so impressed and wish that I could give 10 stars.",
  },
  {
    title: "Hard workers",
    description:
      "They took on my class and did a great Job. Everything was done on time and good to go thank you for the hard work.",
  },
  {
    title: "Very helpful and trustworthy",
    description:
      "Very helpful and trustworthy. I would definitely recommend their service.",
  },
  {
    title: "The best company to work with",
    description: "The best company to work with. Will use it again.",
  },
  {
    title: "Dear ScholarlyHelp Team,",
    description:
      "I am writing to express my profound gratitude for the outstanding assistance you provided with my college coursework during a particularly demanding period...",
  },
  {
    title: "I Got 'A' Grade in my online course",
    description:
      "I Got 'A' Grade in my online course. Thank you Scholarly Help for your valuable services. I highly Recommend them.",
  },
  {
    title: "Awesome they helped me so much and",
    description:
      "Awesome they helped me so much and finished within my deadline",
  },
  {
    title: "I love this experience at first I was",
    description:
      "I love this experience at first I was skeptical now that they did my work. I feel stress-free and I'm happy that I joined.",
  },
  {
    title: "helped pass my exam to get in my dream",
    description:
      "helped pass my exam to get in my dream course. Got my certification. everything worked out.",
  },
  {
    title: "5 Star Experience",
    description:
      "Scholarly help is not a scam. They have helped me complete several assignments and completed both with excellent grades. Would recommend to anyone!",
  },
  {
    title: "I wasn't confident about the exam",
    description:
      "I wasn't confident about the exam, but thanks to the tutor's help, I was able to achieve good results. I highly recommend using this company.",
  },
  {
    title: "Legit service with quality work",
    description:
      "Legit service with quality work. Life was getting hard to balance but Scholarly helped take a good chunk of that stress away, I am forever thankful. Thank you so much.",
  },
  {
    title: "Amazing tutor",
    description:
      "Amazing tutor! Helped me ace my CS course with patience & expert guidance. Grateful for the knowledge and confidence gained. Highly recommend!",
  },
  {
    title: "scholarlyhelp.com has the best experts",
    description:
      "scholarlyhelp.com has the best experts to help with anyone's assignments. They are complete geniuses, and I would definitely use them again.",
  },
  {
    title: "The people and tutors related to",
    description:
      "The people and tutors related to scholarly are excellent. I would refer them to anyone needing class and studying help",
  },
  {
    title: "Was skeptical at first but I am so glad",
    description:
      "Was skeptical at first but I am so glad I trusted this company I received a 88 score on my exam will use again :)",
  },
  {
    title: "This is such a great service",
    description:
      "This is such a great service. Very helpful, very quick to respond and provide quality original work.",
  },
  {
    title: "Highly recommended",
    description:
      "Highly recommended, they have the best experts who can help out with exams, assignments and essays. They are always on time and I got very good grades...",
  },
  {
    title: "Wasn't sure how legit this was but they",
    description:
      "Wasn't sure how legit this was but they know what they're doing! You get a guaranteed B or higher...",
  },
  {
    title: "Scholarly help is the real deal",
    description:
      "Scholarly help is the real deal. They provided me with an excellent professional service. Trust me these folks will guarantee have you pass any quiz...",
  },
  {
    title: "EXCEPTIONAL SERVICE DELIVERED",
    description:
      "I am so grateful that I came across this service! Their communication and service is EXCEPTIONAL! Initially, I did not know what to expect, but they delivered and I got A+...",
  },
  {
    title: "Had a very positive experience with",
    description:
      "Had a very positive experience with them. Dedicated work professional staff. With their help I could improve my grade",
  },
  {
    title: "They Actually Delivered...",
    description:
      "At first I was sketchy about this service, but I can never be more wrong. They deliver exemplary results as promised on their website and communicated effectively...",
  },
  {
    title: "Excellent Service",
    description:
      "Exceptional service! I achieved high-quality grades in my Chemistry course, scoring an A on my finals. Whenever I needed assistance, I could turn here for guidance...",
  },
  {
    title: "When I say they not only communicated",
    description:
      "When I say they not only communicated fast and often they would get me high remarks on my grades from my professor...",
  },
  {
    title: "Great Communication.",
    description:
      "I was skeptical at first because it was my first time using this service and they were very helpful and communicative. They handled everything very professionally...",
  },
  {
    title: "I highly recommend their services",
    description:
      "I highly recommend their services, they deliver 100% and always available to answer any questions. They have the best team for every field of study. I really do recommend..",
  },
  {
    title: "Employment Assessment",
    description:
      "I needed assistance with an assessment for a promotion. I have not received the results yet, but I feel confident that I will be placed in a high band and considered...",
  },
  {
    title: "They helped me so much I was able to",
    description:
      "They helped me so much I was able to graduate. Amazing people great communication and would recommend to anyone that needs help with there classes...",
  },
  {
    title: "They will work on your assignments with",
    description:
      "They will work on your assignments with swiftness and accuracy. I was skeptical at first but the team really treated my work as their own and put the petal to the metal..",
  },
  {
    title: "It's legit",
    description:
      "Yall! They're the truth I was sooo worried they were not going to come through but they did! Trust the process! I would definitely highly recommend...",
  },
];

interface CustomerReviewsProps {
  btnText?: string;
}

const CustomerReviews: FC<CustomerReviewsProps> = ({
  btnText = "Place an Order Now",
}) => {
  // Filter out negative reviews and remove duplicates
  const getUniqueReviews = () => {
    const negativeKeywords = [
      "scammer",
      "scam",
      "fraud",
      "don't fall",
      "do not fall",
    ];

    // Filter out negative reviews
    const positiveReviews = reviews.filter((review) => {
      const titleLower = review.title.toLowerCase();
      const descLower = review.description.toLowerCase();
      return !negativeKeywords.some(
        (keyword) => titleLower.includes(keyword) || descLower.includes(keyword)
      );
    });

    // Remove duplicates based on title
    const seen = new Set<string>();
    const uniqueReviews = positiveReviews.filter((review) => {
      const normalizedTitle = review.title.toLowerCase().trim();
      if (seen.has(normalizedTitle)) {
        return false;
      }
      seen.add(normalizedTitle);
      return true;
    });

    // Return all unique reviews (no limit, let slider handle display)
    return uniqueReviews;
  };

  const displayedReviews = getUniqueReviews();

  // Group reviews into chunks of 6 (3 columns x 2 rows per slide)
  const groupedReviews = [];
  for (let i = 0; i < displayedReviews.length; i += 6) {
    groupedReviews.push(displayedReviews.slice(i, i + 6));
  }

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 5000,
    cssEase: "linear",
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          arrows: false,
          dots: false,
        },
      },
    ],
  };

  return (
    <div className="bg-white text-[#171717] w-full">
      <div className="max-w-7xl mx-auto pt-2 pb-3  max-[1320px]:px-8">
        {/* Header */}
        <h2 className="font-bold text-[#000] text-center text-[42px]  mb-3">
          How Students Rate Us!
        </h2>
        {/* <p className="md:text-5xl text-2xl text-[#00B67A] text-center mt-2">
          Excellent
        </p> */}

        {/* Trustpilot Rating */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <div className="flex items-end gap-1">
            <Image src={Trustpilot} alt="Trustpilot" className="md:w-10 w-8" />
            <p className="md:text-3xl text-xl font-bold">Trustpilot</p>
          </div>
          <Image src={StarGroup} alt="5 Stars" className="max-w-32" />
        </div>
        <p className="text-[#7d7d7d] text-center mt-2">
          Rated 4.6/5 Based on 1000+ Reviews
        </p>

        {/* Desktop Slider - 3 cards per row, 2 rows per slide */}
        <div className="my-8 md:block hidden">
          <Slider {...settings}>
            {groupedReviews.map((group, groupIndex) => (
              <div key={groupIndex}>
                <div className="grid grid-cols-3 gap-6">
                  {group.map((review, index) => (
                    <div key={index}>
                      <div className="border border-[#DCDCDC] rounded-md py-[30px] px-[24px] h-full">
                        <Image src={Verifiend} alt="Review" />
                        <p className="text-xl font-bold text-black my-[10px]">
                          {review.title}
                        </p>
                        <p className="text-black">{review.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Mobile Slider - 1 card per slide */}
        <div className="mt-8 md:hidden block">
          <Slider {...settings}>
            {displayedReviews.map((review, index) => (
              <div key={index} className="px-2">
                <div className="border border-[#DCDCDC] rounded-md py-[30px] px-[24px] h-full">
                  <Image src={Verifiend} alt="Review" />
                  <p className="text-xl font-bold text-black mb-[10px]">
                    {review.title}
                  </p>
                  <p className="text-black">{review.description}</p>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Optional CTA Button */}
        {/* {btnText && (
          <div className="flex justify-center mt-10">
            <a href="javascript:void(Tawk_API?.toggle())">
              <button className="md:w-64 w-48 py-3 px-6 bg-secondary-500 text-white font-semibold rounded-lg hover:bg-secondary-600 hover:text-white transition-all duration-200 border border-secondary-500">
                {btnText}
              </button>
            </a>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default CustomerReviews;
