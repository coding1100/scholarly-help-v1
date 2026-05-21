"use client";

import { useAdminConfirm } from "@/app/components/Admin/AdminConfirmProvider";
import { useAdminSuccess } from "@/app/components/Admin/AdminSuccessProvider";
import { useState, useEffect } from "react";
import AdminPageHeader from "@/app/components/Admin/AdminPageHeader";
import { AdminDuplicateProvider } from "@/app/components/Admin/AdminDuplicateContext";
import { homeworkSubjects } from "@/app/(pages)/homework/subjectContent";
import AdminButton from "@/app/components/Admin/AdminButton";

export default function HomeworkAdmin() {
  const { confirmDelete } = useAdminConfirm();
  const { showSuccess } = useAdminSuccess();

  const [availablePages, setAvailablePages] = useState<Array<{ id: string; slug?: string; title?: string }>>([]);
  const [selectedPage, setSelectedPage] = useState<string>('homework_page');
  const [pageData, setPageData] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(false);

  // Fetch all available pages
  useEffect(() => {
    const fetchAvailablePages = async () => {
      try {
        const res = await fetch('/api/admin/homework?list=all');
        if (!res.ok) {
          console.error('Failed to fetch pages:', res.status, res.statusText);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.error) {
          console.error('API error:', data.error);
          throw new Error(data.error);
        }
        if (data.pages && Array.isArray(data.pages)) {
          // Use a Map to deduplicate by normalized ID
          const pagesMap = new Map<string, { id: string; slug: string; title: string }>();

          data.pages.forEach((page: any) => {
            let pageId = page.id || page.slug || '';
            let slug = page.slug || page.id || '';

            // 1. Normalize to lowercase
            pageId = pageId.toLowerCase();

            // 2. Normalize "main" to "homework_page"
            if (pageId === 'main') {
              pageId = 'homework_page';
            }

            // 3. Ensure "homework_" prefix for subject pages
            if (pageId && pageId !== 'homework_page' && !pageId.startsWith('homework_')) {
              pageId = `homework_${pageId}`;
            }

            // 4. Normalize subject part (replace underscores with hyphens in the suffix only)
            if (pageId.startsWith('homework_') && pageId !== 'homework_page') {
              // Split prefix and suffix to avoid replacing the underscore in 'homework_'
              const suffix = pageId.slice('homework_'.length).replace(/_/g, '-');
              pageId = `homework_${suffix}`;

              // Update slug based on normalized ID
              slug = suffix;
            }

            // Format title
            let title = '';
            if (pageId === 'homework_page') {
              title = 'Homework';
            } else if (pageId.startsWith('homework_')) {
              const subjectName = pageId.replace('homework_', '').replace(/-/g, ' ');
              title = `Homework ${subjectName.charAt(0).toUpperCase() + subjectName.slice(1)}`;
            } else {
              title = page.title || page.meta?.title || pageId.replace(/-/g, ' ');
            }

            // Only add if ID is valid and not already in map
            if (pageId && !pagesMap.has(pageId)) {
              pagesMap.set(pageId, {
                id: pageId,
                slug: slug,
                title: title
              });
            }
          });

          // Add any missing subjects from homeworkSubjects
          homeworkSubjects.forEach(subject => {
            const id = `homework_${subject}`;
            if (!pagesMap.has(id)) {
              // Format title
              const title = `Homework ${subject.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
              pagesMap.set(id, {
                id: id,
                slug: subject,
                title: title
              });
            }
          });

          // Convert map to array
          const pages = Array.from(pagesMap.values());

          // Ensure homework_page is in the list
          const hashomeworkPage = pages.some((p: any) => p.id === 'homework_page');
          if (!hashomeworkPage) {
            pages.unshift({ id: 'homework_page', slug: 'homework_page', title: 'homework' });
          }

          // Sort: homework_page first, then alphabetically
          pages.sort((a: any, b: any) => {
            if (a.id === 'homework_page') return -1;
            if (b.id === 'homework_page') return 1;
            return a.title.localeCompare(b.title);
          });

          setAvailablePages(pages);
        } else {
          // Default pages if none found
          setAvailablePages([
            { id: 'homework_page', slug: 'homework_page', title: 'homework' },
            { id: 'homework_english', slug: 'english', title: 'homework English' },
            { id: 'homework_math', slug: 'math', title: 'homework Math' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching available pages:', error);
        alert(`Error loading pages: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your DATABASE_URL environment variable in Vercel.`);
        // Default pages on error
        setAvailablePages([
          { id: 'homework_page', slug: 'homework_page', title: 'homework' },
          { id: 'homework_english', slug: 'english', title: 'homework English' },
          { id: 'homework_math', slug: 'math', title: 'homework Math' }
        ]);
      }
    };
    fetchAvailablePages();
  }, []);

  // Auto-select homework_page when pages are loaded
  useEffect(() => {
    if (availablePages.length > 0 && selectedPage === 'homework_page' && !pageData && !pageLoading) {
      const loadHomeworkPage = async () => {
        setPageLoading(true);
        try {
          const res = await fetch(`/api/admin/homework?slug=homework_page`);
          if (!res.ok) {
            console.error('Failed to fetch homework page:', res.status, res.statusText);
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          if (data.error) {
            console.error('API error:', data.error);
            throw new Error(data.error);
          }

          setPageData(data && Object.keys(data).length > 0 ? {
            ...data,
            pageType: data.id || data.pageType || 'homework_page'
          } : {
            id: 'homework_page',
            pageType: 'homework_page',
            meta: { title: '', description: '' },
            heroSection: { mainHeading: '', subHeading: '', description: '', btn1: '', btn2: '', btn1Url: '', btn2Url: '' },
            whySlider: {
              mainHeading: 'Why choose Scholarly',
              description: 'Scholarly Help offers plenty of services through skilled online class helpers and various subject experts.',
              ctaButton: { text: 'Take my online class' },
              sliderItems: []
            },
            cardCarousel: { mainHeading: '', description: '', ctaButton: { text: '' }, cards: [] },
            description: { mainHeading: '', description: '', services: [], badges: [], ctaButton: { text: '' } },
            guaranteedBlock: { mainHeading: '', description: '', ctaButton: { text: '' } },
            processSection: {
              mainHeading: 'State-of-the-Art Process We Follow',
              description: "Beyond the subjects listed below, we excel at handling diverse topics effectively. Our expertise knows no bounds, ensuring we're ready for any challenge that comes our way.",
              steps: [
                { stepNumber: 1, title: 'Place Your<br/>Order', description: 'Use our online form, WhatsApp, Live chat, or email to submit order' },
                { stepNumber: 2, title: 'Confirm<br/>Payment', description: 'Secure your order with an advance payment to initiate the process.' },
                { stepNumber: 3, title: 'Expert Work<br/>in Progress', description: 'Our skilled tutors start working on your order promptly.' },
                { stepNumber: 4, title: 'Get Your<br/>Solution', description: 'Receive your completed work on time, ready for submission.' }
              ]
            },
            success: { mainHeading: '', description: '', course: '', beforeAfter: '', total: '', ctaButton: { text: '' } },
            academicPartners: { mainHeading: '', description: '', cards: [], performances: [], ctaButton: { text: '' } },
            subjects: { mainHeading: '', description: '', ctaText: '', subjectsContent: [] },
            customerReviews: { mainHeading: '', trustpilotRating: '', reviews: [] },
            getQuote: { mainHeading: '', description: '', ctaButton: { text: '' } },
            faq: { mainHeading: '', faqs: [] }
          });
        } catch (error) {
          console.error('Error fetching homework page:', error);
          setPageData({
            id: 'homework_page',
            pageType: 'homework_page',
            meta: { title: '', description: '' },
            heroSection: { mainHeading: '', subHeading: '', description: '', btn1: '', btn2: '', btn1Url: '', btn2Url: '' },
            whySlider: {
              mainHeading: 'Why choose Scholarly',
              description: 'Scholarly Help offers plenty of services through skilled online class helpers and various subject experts.',
              ctaButton: { text: 'Take my online class' },
              sliderItems: []
            },
            cardCarousel: { mainHeading: '', description: '', ctaButton: { text: '' }, cards: [] },
            description: { mainHeading: '', description: '', services: [], badges: [], ctaButton: { text: '' } },
            guaranteedBlock: { mainHeading: '', description: '', ctaButton: { text: '' } },
            processSection: {
              mainHeading: 'State-of-the-Art Process We Follow',
              description: "Beyond the subjects listed below, we excel at handling diverse topics effectively. Our expertise knows no bounds, ensuring we're ready for any challenge that comes our way.",
              steps: [
                { stepNumber: 1, title: 'Place Your<br/>Order', description: 'Use our online form, WhatsApp, Live chat, or email to submit order' },
                { stepNumber: 2, title: 'Confirm<br/>Payment', description: 'Secure your order with an advance payment to initiate the process.' },
                { stepNumber: 3, title: 'Expert Work<br/>in Progress', description: 'Our skilled tutors start working on your order promptly.' },
                { stepNumber: 4, title: 'Get Your<br/>Solution', description: 'Receive your completed work on time, ready for submission.' }
              ]
            },
            success: { mainHeading: '', description: '', course: '', beforeAfter: '', total: '', ctaButton: { text: '' } },
            academicPartners: { mainHeading: '', description: '', cards: [], performances: [], ctaButton: { text: '' } },
            subjects: { mainHeading: '', description: '', ctaText: '', subjectsContent: [] },
            customerReviews: { mainHeading: '', trustpilotRating: '', reviews: [] },
            getQuote: { mainHeading: '', description: '', ctaButton: { text: '' } },
            faq: { mainHeading: '', faqs: [] }
          });
        } finally {
          setPageLoading(false);
        }
      };
      loadHomeworkPage();
    }
  }, [availablePages]);

  // Fetch page data when page is selected
  const handlePageChange = async (pageId: string) => {
    setSelectedPage(pageId);
    if (pageId) {
      setPageLoading(true);
      try {
        const page = availablePages.find(p => p.id === pageId);
        // Use the pageId directly as slug for API call (handles both homework_english and english formats)
        const slug = pageId.startsWith('homework_') ? pageId : (page?.slug || pageId);
        const res = await fetch(`/api/admin/homework?slug=${slug}`);
        if (!res.ok) {
          console.error('Failed to fetch page:', res.status, res.statusText);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.error) {
          console.error('API error:', data.error);
          throw new Error(data.error);
        }

        if (pageId === 'homework_page') {
          // homework page structure
          setPageData(data && Object.keys(data).length > 0 ? {
            ...data,
            pageType: data.id || data.pageType || 'homework_page'
          } : {
            id: 'homework_page',
            pageType: 'homework_page',
            meta: { title: '', description: '' },
            heroSection: { mainHeading: '', subHeading: '', description: '', btn1: '', btn2: '', btn1Url: '', btn2Url: '' },
            whySlider: {
              mainHeading: 'Why choose Scholarly',
              description: 'Scholarly Help offers plenty of services through skilled online class helpers and various subject experts.',
              ctaButton: { text: 'Take my online class' },
              sliderItems: []
            },
            cardCarousel: { mainHeading: '', description: '', ctaButton: { text: '' }, cards: [] },
            description: { mainHeading: '', description: '', services: [], badges: [], ctaButton: { text: '' } },
            guaranteedBlock: { mainHeading: '', description: '', ctaButton: { text: '' } },
            processSection: {
              mainHeading: 'State-of-the-Art Process We Follow',
              description: "Beyond the subjects listed below, we excel at handling diverse topics effectively. Our expertise knows no bounds, ensuring we're ready for any challenge that comes our way.",
              steps: [
                { stepNumber: 1, title: 'Place Your<br/>Order', description: 'Use our online form, WhatsApp, Live chat, or email to submit order' },
                { stepNumber: 2, title: 'Confirm<br/>Payment', description: 'Secure your order with an advance payment to initiate the process.' },
                { stepNumber: 3, title: 'Expert Work<br/>in Progress', description: 'Our skilled tutors start working on your order promptly.' },
                { stepNumber: 4, title: 'Get Your<br/>Solution', description: 'Receive your completed work on time, ready for submission.' }
              ]
            },
            success: { mainHeading: '', description: '', course: '', beforeAfter: '', total: '', ctaButton: { text: '' } },
            academicPartners: { mainHeading: '', description: '', cards: [], performances: [], ctaButton: { text: '' } },
            subjects: { mainHeading: '', description: '', ctaText: '', subjectsContent: [] },
            customerReviews: { mainHeading: '', trustpilotRating: '', reviews: [] },
            getQuote: { mainHeading: '', description: '', ctaButton: { text: '' } },
            faq: { mainHeading: '', faqs: [] }
          });
        } else {
          // Subject page structure (same as homework_english)
          // Extract slug from pageId (homework_english -> english)
          const extractedSlug = pageId.startsWith('homework_')
            ? pageId.replace('homework_', '')
            : (page?.slug || pageId);

          setPageData(data && Object.keys(data).length > 0 ? {
            ...data,
            slug: data.slug || extractedSlug,
            id: data.id || pageId,
            pageType: data.id || pageId
          } : {
            id: pageId,
            slug: extractedSlug,
            pageType: pageId,
            meta: { title: '', description: '' },
            heroSection: { mainHeading: '', subHeading: '', description: '', btn1: '', btn2: '', btn1Url: '', btn2Url: '' },
            whySlider: {
              mainHeading: 'Why choose Scholarly',
              description: 'Scholarly Help offers plenty of services through skilled online class helpers and various subject experts.',
              ctaButton: { text: 'Take my online class' },
              sliderItems: []
            },
            cardCarousel: { mainHeading: '', description: '', ctaButton: { text: '' }, cards: [] },
            description: { mainHeading: '', description: '', services: [], badges: [], ctaButton: { text: '' } },
            guaranteedBlock: { mainHeading: '', description: '', ctaButton: { text: '' } },
            processSection: {
              mainHeading: 'State-of-the-Art Process We Follow',
              description: "Beyond the subjects listed below, we excel at handling diverse topics effectively. Our expertise knows no bounds, ensuring we're ready for any challenge that comes our way.",
              steps: [
                { stepNumber: 1, title: 'Place Your<br/>Order', description: 'Use our online form, WhatsApp, Live chat, or email to submit order' },
                { stepNumber: 2, title: 'Confirm<br/>Payment', description: 'Secure your order with an advance payment to initiate the process.' },
                { stepNumber: 3, title: 'Expert Work<br/>in Progress', description: 'Our skilled tutors start working on your order promptly.' },
                { stepNumber: 4, title: 'Get Your<br/>Solution', description: 'Receive your completed work on time, ready for submission.' }
              ]
            },
            success: { mainHeading: '', description: '', course: '', beforeAfter: '', total: '', ctaButton: { text: '' } },
            academicPartners: { mainHeading: '', description: '', cards: [], performances: [], ctaButton: { text: '' } },
            subjects: { mainHeading: '', description: '', ctaText: '', subjectsContent: [] },
            customerReviews: { mainHeading: '', trustpilotRating: '', reviews: [] },
            getQuote: { mainHeading: '', description: '', ctaButton: { text: '' } },
            faq: { mainHeading: '', faqs: [] }
          });
        }
      } catch (error) {
        console.error('Error fetching page:', error);
        if (pageId === 'homework_page') {
          setPageData({
            id: 'homework_page',
            pageType: 'homework_page',
            meta: { title: '', description: '' },
            heroSection: { mainHeading: '', subHeading: '', description: '', btn1: '', btn2: '', btn1Url: '', btn2Url: '' },
            whySlider: {
              mainHeading: 'Why choose Scholarly',
              description: 'Scholarly Help offers plenty of services through skilled online class helpers and various subject experts.',
              ctaButton: { text: 'Take my online class' },
              sliderItems: []
            },
            cardCarousel: { mainHeading: '', description: '', ctaButton: { text: '' }, cards: [] },
            description: { mainHeading: '', description: '', services: [], badges: [], ctaButton: { text: '' } },
            guaranteedBlock: { mainHeading: '', description: '', ctaButton: { text: '' } },
            processSection: {
              mainHeading: 'State-of-the-Art Process We Follow',
              description: "Beyond the subjects listed below, we excel at handling diverse topics effectively. Our expertise knows no bounds, ensuring we're ready for any challenge that comes our way.",
              steps: [
                { stepNumber: 1, title: 'Place Your<br/>Order', description: 'Use our online form, WhatsApp, Live chat, or email to submit order' },
                { stepNumber: 2, title: 'Confirm<br/>Payment', description: 'Secure your order with an advance payment to initiate the process.' },
                { stepNumber: 3, title: 'Expert Work<br/>in Progress', description: 'Our skilled tutors start working on your order promptly.' },
                { stepNumber: 4, title: 'Get Your<br/>Solution', description: 'Receive your completed work on time, ready for submission.' }
              ]
            },
            success: { mainHeading: '', description: '', course: '', beforeAfter: '', total: '', ctaButton: { text: '' } },
            academicPartners: { mainHeading: '', description: '', cards: [], performances: [], ctaButton: { text: '' } },
            subjects: { mainHeading: '', description: '', ctaText: '', subjectsContent: [] },
            customerReviews: { mainHeading: '', trustpilotRating: '', reviews: [] },
            getQuote: { mainHeading: '', description: '', ctaButton: { text: '' } },
            faq: { mainHeading: '', faqs: [] }
          });
        } else {
          // Extract slug from pageId (homework_english -> english)
          const extractedSlug = pageId.startsWith('homework_')
            ? pageId.replace('homework_', '')
            : (availablePages.find(p => p.id === pageId)?.slug || pageId);
          setPageData({
            id: pageId,
            slug: extractedSlug,
            pageType: pageId,
            meta: { title: '', description: '' },
            heroSection: { mainHeading: '', subHeading: '', description: '', btn1: '', btn2: '', btn1Url: '', btn2Url: '' },
            whySlider: {
              mainHeading: 'Why choose Scholarly',
              description: 'Scholarly Help offers plenty of services through skilled online class helpers and various subject experts.',
              ctaButton: { text: 'Take my online class' },
              sliderItems: []
            },
            cardCarousel: { mainHeading: '', description: '', ctaButton: { text: '' }, cards: [] },
            description: { mainHeading: '', description: '', services: [], badges: [], ctaButton: { text: '' } },
            guaranteedBlock: { mainHeading: '', description: '', ctaButton: { text: '' } },
            processSection: {
              mainHeading: 'State-of-the-Art Process We Follow',
              description: "Beyond the subjects listed below, we excel at handling diverse topics effectively. Our expertise knows no bounds, ensuring we're ready for any challenge that comes our way.",
              steps: [
                { stepNumber: 1, title: 'Place Your<br/>Order', description: 'Use our online form, WhatsApp, Live chat, or email to submit order' },
                { stepNumber: 2, title: 'Confirm<br/>Payment', description: 'Secure your order with an advance payment to initiate the process.' },
                { stepNumber: 3, title: 'Expert Work<br/>in Progress', description: 'Our skilled tutors start working on your order promptly.' },
                { stepNumber: 4, title: 'Get Your<br/>Solution', description: 'Receive your completed work on time, ready for submission.' }
              ]
            },
            success: { mainHeading: '', description: '', course: '', beforeAfter: '', total: '', ctaButton: { text: '' } },
            academicPartners: { mainHeading: '', description: '', cards: [], performances: [], ctaButton: { text: '' } },
            subjects: { mainHeading: '', description: '', ctaText: '', subjectsContent: [] },
            customerReviews: { mainHeading: '', trustpilotRating: '', reviews: [] },
            getQuote: { mainHeading: '', description: '', ctaButton: { text: '' } },
            faq: { mainHeading: '', faqs: [] }
          });
        }
      } finally {
        setPageLoading(false);
      }
    } else {
      setPageData(null);
    }
  };

  const handlePageSave = async () => {
    if (!pageData) return;
    setPageLoading(true);
    try {
      const response = await fetch('/api/admin/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      });
      const result = await response.json();
      if (result.success) {
        showSuccess();
        // Refresh available pages list
        const res = await fetch('/api/admin/homework?list=all');
        const data = await res.json();
        if (data.pages && Array.isArray(data.pages)) {
          // Use a Map to deduplicate by normalized ID
          const pagesMap = new Map<string, { id: string; slug: string; title: string }>();

          data.pages.forEach((page: any) => {
            let pageId = page.id || page.slug || '';
            let slug = page.slug || page.id || '';

            // Normalize "main" to "homework_page"
            if (pageId === 'main') {
              pageId = 'homework_page';
            }

            // Normalize IDs: if it's a subject page without homework_ prefix, add it
            if (pageId && pageId !== 'homework_page' && !pageId.startsWith('homework_')) {
              pageId = `homework_${pageId}`;
            }

            // Extract slug from homework_ prefixed IDs
            if (pageId.startsWith('homework_') && pageId !== 'homework_page') {
              slug = pageId.replace('homework_', '');
            }

            // Format title
            let title = '';
            if (pageId === 'homework_page') {
              title = 'Homework';
            } else if (pageId.startsWith('homework_')) {
              const subjectName = pageId.replace('homework_', '').replace(/-/g, ' ');
              title = `Homework ${subjectName.charAt(0).toUpperCase() + subjectName.slice(1)}`;
            } else {
              title = page.title || page.meta?.title || pageId.replace(/-/g, ' ');
            }

            // Only add if ID is valid and not already in map
            if (pageId && !pagesMap.has(pageId)) {
              pagesMap.set(pageId, {
                id: pageId,
                slug: slug,
                title: title
              });
            }
          });

          // Convert map to array
          const pages = Array.from(pagesMap.values());

          const hashomeworkPage = pages.some((p: any) => p.id === 'homework_page');
          if (!hashomeworkPage) {
            pages.unshift({ id: 'homework_page', slug: 'homework_page', title: 'homework' });
          }

          // Sort: homework_page first, then alphabetically
          pages.sort((a: any, b: any) => {
            if (a.id === 'homework_page') return -1;
            if (b.id === 'homework_page') return 1;
            return a.title.localeCompare(b.title);
          });

          setAvailablePages(pages);
        }
      } else {
        alert('Error saving page');
      }
    } catch (error) {
      alert('Error saving page');
    } finally {
      setPageLoading(false);
    }
  };

  const handlePageDelete = async () => {
    if (!pageData?.id || pageData.id === 'homework_page') {
      alert('Cannot delete the main homework page');
      return;
    }

    if (!(await confirmDelete({ variant: "delete", message: `Are you sure you want to delete "${pageData.id}"? This action cannot be undone.` }))) return;

    setPageLoading(true);
    try {
      const page = availablePages.find(p => p.id === pageData.id);
      const slug = page?.slug || pageData.slug || pageData.id;
      const response = await fetch(`/api/admin/homework?slug=${slug}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        alert('Page deleted successfully!');
        setSelectedPage('');
        setPageData(null);
        // Refresh available pages list
        const res = await fetch('/api/admin/homework?list=all');
        const data = await res.json();
        if (data.pages && Array.isArray(data.pages)) {
          // Use a Map to deduplicate by normalized ID
          const pagesMap = new Map<string, { id: string; slug: string; title: string }>();

          data.pages.forEach((page: any) => {
            let pageId = page.id || page.slug || '';
            let slug = page.slug || page.id || '';

            // Normalize "main" to "homework_page"
            if (pageId === 'main') {
              pageId = 'homework_page';
            }

            // Normalize IDs: if it's a subject page without homework_ prefix, add it
            if (pageId && pageId !== 'homework_page' && !pageId.startsWith('homework_')) {
              pageId = `homework_${pageId}`;
            }

            // Extract slug from homework_ prefixed IDs
            if (pageId.startsWith('homework_') && pageId !== 'homework_page') {
              slug = pageId.replace('homework_', '');
            }

            // Format title
            let title = '';
            if (pageId === 'homework_page') {
              title = 'Homework';
            } else if (pageId.startsWith('homework_')) {
              const subjectName = pageId.replace('homework_', '').replace(/-/g, ' ');
              title = `Homework ${subjectName.charAt(0).toUpperCase() + subjectName.slice(1)}`;
            } else {
              title = page.title || page.meta?.title || pageId.replace(/-/g, ' ');
            }

            // Only add if ID is valid and not already in map
            if (pageId && !pagesMap.has(pageId)) {
              pagesMap.set(pageId, {
                id: pageId,
                slug: slug,
                title: title
              });
            }
          });

          // Convert map to array
          const pages = Array.from(pagesMap.values());

          const hashomeworkPage = pages.some((p: any) => p.id === 'homework_page');
          if (!hashomeworkPage) {
            pages.unshift({ id: 'homework_page', slug: 'homework_page', title: 'homework' });
          }

          // Sort: homework_page first, then alphabetically
          pages.sort((a: any, b: any) => {
            if (a.id === 'homework_page') return -1;
            if (b.id === 'homework_page') return 1;
            return a.title.localeCompare(b.title);
          });

          setAvailablePages(pages);
        }
      } else {
        alert('Error deleting page');
      }
    } catch (error) {
      alert('Error deleting page');
    } finally {
      setPageLoading(false);
    }
  };

  const updatePageData = (path: string, value: any) => {
    const keys = path.split('.');
    setPageData((prev: any) => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev)); // Deep clone to avoid reference issues
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const updateArrayItem = (path: string, index: number, field: string, value: any) => {
    const keys = path.split('.');
    setPageData((prev: any) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length; i++) {
        if (!current[keys[i]]) current[keys[i]] = [];
        current = current[keys[i]];
      }
      if (!current[index]) current[index] = {};
      current[index][field] = value;
      return newData;
    });
  };

  const addArrayItem = (path: string, defaultItem: any) => {
    const keys = path.split('.');
    setPageData((prev: any) => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev)); // Deep clone to avoid reference issues
      let current = newData;
      for (let i = 0; i < keys.length; i++) {
        if (!current[keys[i]]) current[keys[i]] = [];
        current = current[keys[i]];
      }
      current.push(defaultItem);
      return newData;
    });
  };

  const removeArrayItem = async (path: string, index: number) => {
    if (
      !(await confirmDelete({
        variant: "remove",
        message: "Are you sure you want to remove this item?",
      }))
    )
      return;

    const keys = path.split('.');
    setPageData((prev: any) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length; i++) {
        current = current[keys[i]];
      }
      current.splice(index, 1);
      return newData;
    });
  };

  const renderPageForm = () => {
    if (!pageData) return null;

    return (
      <form onSubmit={(e) => { e.preventDefault(); handlePageSave(); }} className="space-y-8">
        {/* Meta Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">SEO & Meta</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
              <input
                type="text"
                value={pageData.meta?.title || ''}
                onChange={(e) => updatePageData('meta.title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
              <textarea
                rows={3}
                value={pageData.meta?.description || ''}
                onChange={(e) => updatePageData('meta.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Hero Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <textarea
                rows={3}
                value={pageData.heroSection?.mainHeading || ''}
                onChange={(e) => updatePageData('heroSection.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Use &lt;br/&gt; for line breaks"
              />
            </div>
            <div className="hidden">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sub Heading</label>
              <input
                type="text"
                value={pageData.heroSection?.subHeading || ''}
                onChange={(e) => updatePageData('heroSection.subHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                value={pageData.heroSection?.description || ''}
                onChange={(e) => updatePageData('heroSection.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button 1 Text</label>
                <input
                  type="text"
                  value={pageData.heroSection?.btn1 || ''}
                  onChange={(e) => updatePageData('heroSection.btn1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Default: Take My Full Class"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button 2 Text</label>
                <input
                  type="text"
                  value={pageData.heroSection?.btn2 || ''}
                  onChange={(e) => updatePageData('heroSection.btn2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Default: Pass My Exam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button 1 URL</label>
                <input
                  type="text"
                  value={pageData.heroSection?.btn1Url || ''}
                  onChange={(e) => updatePageData('heroSection.btn1Url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., /contact-us or https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button 2 URL</label>
                <input
                  type="text"
                  value={pageData.heroSection?.btn2Url || ''}
                  onChange={(e) => updatePageData('heroSection.btn2Url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., /contact-us or https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Why Slider Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Why Slider Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.whySlider?.mainHeading || ''}
                onChange={(e) => updatePageData('whySlider.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.whySlider?.description || ''}
                onChange={(e) => updatePageData('whySlider.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.whySlider?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('whySlider.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Slider Items (cards in the scrolling rows)</label>
              {(pageData.whySlider?.sliderItems || []).map((item: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Item {index + 1}</span>
                    <AdminButton type="button" variant="remove" onClick={() => removeArrayItem('whySlider.sliderItems', index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={item.text || ''}
                      onChange={(e) => updateArrayItem('whySlider.sliderItems', index, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Card text (e.g. Highly-Skilled Subject Experts)"
                    />
                    <input
                      type="text"
                      value={item.alt || ''}
                      onChange={(e) => updateArrayItem('whySlider.sliderItems', index, 'alt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Alt text for icon (optional)"
                    />
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() => addArrayItem('whySlider.sliderItems', { text: '', alt: '' })}>Add Slider Item</AdminButton>
            </div>
          </div>
        </div>

        {/* Card Carousel Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Card Carousel Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.cardCarousel?.mainHeading || ''}
                onChange={(e) => updatePageData('cardCarousel.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.cardCarousel?.description || ''}
                onChange={(e) => updatePageData('cardCarousel.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.cardCarousel?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('cardCarousel.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Carousel Cards (slides)</label>
              {(pageData.cardCarousel?.cards || []).map((card: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Card {index + 1}</span>
                    <AdminButton type="button" variant="remove" onClick={() => removeArrayItem('cardCarousel.cards', index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={card.title || ''}
                      onChange={(e) => updateArrayItem('cardCarousel.cards', index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Card title"
                    />
                    <textarea
                      rows={2}
                      value={card.description || ''}
                      onChange={(e) => updateArrayItem('cardCarousel.cards', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Card description"
                    />
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() => addArrayItem('cardCarousel.cards', { id: Date.now(), title: '', description: '' })}>Add Carousel Card</AdminButton>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Description Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.description?.mainHeading || ''}
                onChange={(e) => updatePageData('description.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                value={pageData.description?.description || ''}
                onChange={(e) => updatePageData('description.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Use &lt;br/&gt; for line breaks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.description?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('description.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Badges (comma-separated)</label>
              <input
                type="text"
                value={(pageData.description?.badges || []).join(', ')}
                onChange={(e) => updatePageData('description.badges', e.target.value.split(',').map((b: string) => b.trim()).filter(Boolean))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Online Class Help, homework Help, Online homework Help"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Services</label>
              {(pageData.description?.services || []).map((service: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Service {index + 1}</span>
                    <AdminButton type="button" variant="remove" onClick={() => removeArrayItem('description.services', index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={service.title || ''}
                      onChange={(e) => updateArrayItem('description.services', index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Service Title"
                    />
                    <textarea
                      rows={2}
                      value={service.description || ''}
                      onChange={(e) => updateArrayItem('description.services', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Service Description"
                    />
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() => addArrayItem('description.services', { title: '', description: '' })}>Add Service</AdminButton>
            </div>
          </div>
        </div>

        {/* Online Platforms Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Online Platforms Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.onlinePlatform?.mainHeading || ''}
                onChange={(e) => updatePageData('onlinePlatform.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sub Heading / Description</label>
              <textarea
                rows={4}
                value={pageData.onlinePlatform?.subHeading || ''}
                onChange={(e) => updatePageData('onlinePlatform.subHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Platform Cards</label>
              {(pageData.onlinePlatform?.platforms || []).map((platform: { key?: string; name?: string; description?: string; logoUrl?: string }, index: number) => (
                <div key={platform.key || index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Card {index + 1}</span>
                    <AdminButton type="button" variant="remove" onClick={() => removeArrayItem('onlinePlatform.platforms', index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={platform.name || ''}
                      onChange={(e) => updateArrayItem('onlinePlatform.platforms', index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Platform name"
                    />
                    <input
                      type="url"
                      value={platform.logoUrl || ''}
                      onChange={(e) => updateArrayItem('onlinePlatform.platforms', index, 'logoUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Logo URL"
                    />
                    <textarea
                      rows={2}
                      value={platform.description || ''}
                      onChange={(e) => updateArrayItem('onlinePlatform.platforms', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Card description"
                    />
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() =>
                  updatePageData('onlinePlatform.platforms', [
                    ...(pageData.onlinePlatform?.platforms || []),
                    { key: `platform_${Date.now()}`, name: '', description: '', logoUrl: '' },
                  ])}>Add Platform Card</AdminButton>
            </div>
          </div>
        </div>

        {/* SubSubjects Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">SubSubjects Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.SubSubjects?.mainHeading || ""}
                onChange={(e) => updatePageData("SubSubjects.mainHeading", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.SubSubjects?.description || ""}
                onChange={(e) => updatePageData("SubSubjects.description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.SubSubjects?.ctaText || ""}
                onChange={(e) => updatePageData("SubSubjects.ctaText", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">SubSubject Cards</label>
              {(pageData.SubSubjects?.SubSubjectsContent || []).map((subject: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">SubSubject {index + 1}</span>
                    <AdminButton type="button" variant="remove" onClick={() => removeArrayItem("SubSubjects.SubSubjectsContent", index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={subject.title || ""}
                      onChange={(e) =>
                        updateArrayItem("SubSubjects.SubSubjectsContent", index, "title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={subject.url || ""}
                      onChange={(e) =>
                        updateArrayItem("SubSubjects.SubSubjectsContent", index, "url", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="URL"
                    />
                    <input
                      type="text"
                      value={subject.icon || ""}
                      onChange={(e) =>
                        updateArrayItem("SubSubjects.SubSubjectsContent", index, "icon", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm md:col-span-2"
                      placeholder="Icon path"
                    />
                    <textarea
                      rows={2}
                      value={subject.description || ""}
                      onChange={(e) =>
                        updateArrayItem(
                          "SubSubjects.SubSubjectsContent",
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm md:col-span-2"
                      placeholder="Description"
                    />
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() =>
                  addArrayItem("SubSubjects.SubSubjectsContent", {
                    title: "",
                    icon: "",
                    url: "",
                    description: "",
                  })}>Add SubSubject Card</AdminButton>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Price Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading Line 1</label>
              <input
                type="text"
                value={pageData.priceSection?.mainHeadingLine1 || ''}
                onChange={(e) => updatePageData('priceSection.mainHeadingLine1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading Line 2</label>
              <input
                type="text"
                value={pageData.priceSection?.mainHeadingLine2 || ''}
                onChange={(e) => updatePageData('priceSection.mainHeadingLine2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (first paragraph)</label>
              <textarea
                rows={3}
                value={pageData.priceSection?.description1 || ''}
                onChange={(e) => updatePageData('priceSection.description1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (second paragraph)</label>
              <textarea
                rows={3}
                value={pageData.priceSection?.description2 || ''}
                onChange={(e) => updatePageData('priceSection.description2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Heading</label>
              <input
                type="text"
                value={pageData.priceSection?.cardHeading || ''}
                onChange={(e) => updatePageData('priceSection.cardHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <input
                type="text"
                value={pageData.priceSection?.buttonText || ''}
                onChange={(e) => updatePageData('priceSection.buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Benefits</label>
              {(pageData.priceSection?.benefits || []).map((benefit: string, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md flex gap-2 items-center">
                  <input
                    type="text"
                    value={benefit || ''}
                    onChange={(e) => {
                      const next = [...(pageData.priceSection?.benefits || [])];
                      next[index] = e.target.value;
                      updatePageData('priceSection.benefits', next);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                  <AdminButton type="button" variant="remove" className="whitespace-nowrap" onClick={() => {
                      const next = (pageData.priceSection?.benefits || []).filter((_: string, i: number) => i !== index);
                      updatePageData('priceSection.benefits', next);
                    }}>Remove</AdminButton>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() =>
                  updatePageData('priceSection.benefits', [
                    ...(pageData.priceSection?.benefits || []),
                    '',
                  ])
                }>Add Benefit
              </AdminButton>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Price Items</label>
              {(pageData.priceSection?.priceItems || []).map((item: { service?: string; price?: string; unit?: string }, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Item {index + 1}</span>
                    <AdminButton type="button" variant="remove" onClick={() => removeArrayItem('priceSection.priceItems', index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={item.service || ''}
                      onChange={(e) => updateArrayItem('priceSection.priceItems', index, 'service', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Service"
                    />
                    <input
                      type="text"
                      value={item.price || ''}
                      onChange={(e) => updateArrayItem('priceSection.priceItems', index, 'price', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Price"
                    />
                    <input
                      type="text"
                      value={item.unit || ''}
                      onChange={(e) => updateArrayItem('priceSection.priceItems', index, 'unit', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Unit"
                    />
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() =>
                  updatePageData('priceSection.priceItems', [
                    ...(pageData.priceSection?.priceItems || []),
                    { service: '', price: '', unit: '' },
                  ])}>Add Price Item</AdminButton>
            </div>
          </div>
        </div>

        {/* Guaranteed Block Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Guaranteed Block Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.guaranteedBlock?.mainHeading || ''}
                onChange={(e) => updatePageData('guaranteedBlock.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.guaranteedBlock?.description || ''}
                onChange={(e) => updatePageData('guaranteedBlock.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.guaranteedBlock?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('guaranteedBlock.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Process Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Process Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.processSection?.mainHeading || ''}
                onChange={(e) => updatePageData('processSection.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.processSection?.description || ''}
                onChange={(e) => updatePageData('processSection.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Process Steps</label>
              {(pageData.processSection?.steps || []).map((step: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Step {step.stepNumber || index + 1}</span>
                    <AdminButton type="button" variant="remove" onClick={() => removeArrayItem('processSection.steps', index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="number"
                      value={step.stepNumber || index + 1}
                      onChange={(e) => updateArrayItem('processSection.steps', index, 'stepNumber', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Step Number"
                    />
                    <textarea
                      rows={2}
                      value={step.title || ''}
                      onChange={(e) => updateArrayItem('processSection.steps', index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Step Title (use &lt;br/&gt; for line breaks)"
                    />
                    <textarea
                      rows={2}
                      value={step.description || ''}
                      onChange={(e) => updateArrayItem('processSection.steps', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Step Description"
                    />
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() => addArrayItem('processSection.steps', { stepNumber: (pageData.processSection?.steps?.length || 0) + 1, title: '', description: '' })}>Add Step</AdminButton>
            </div>
          </div>
        </div>

        {/* Success Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Success Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.success?.mainHeading || ''}
                onChange={(e) => updatePageData('success.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.success?.description || ''}
                onChange={(e) => updatePageData('success.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name (bottom stats bar)
                </label>
                <input
                  type="text"
                  value={pageData.success?.course || ''}
                  onChange={(e) => updatePageData('success.course', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Chemistry 101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Before → After (bottom stats bar)
                </label>
                <input
                  type="text"
                  value={pageData.success?.beforeAfter || ''}
                  onChange={(e) => updatePageData('success.beforeAfter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. B → A+ or A+ Grades"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total (bottom stats bar)
                </label>
                <input
                  type="text"
                  value={pageData.success?.total || ''}
                  onChange={(e) => updatePageData('success.total', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 96.66%"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.success?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('success.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Success Slides</label>
              {(pageData.success?.slides || []).map((slide: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Slide {index + 1}</span>
                    <AdminButton type="button" variant="remove" onClick={() => removeArrayItem('success.slides', index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={slide.image || ''}
                      onChange={(e) => updateArrayItem('success.slides', index, 'image', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Image Path (e.g., /images/proof-1.webp)"
                    />
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() => addArrayItem('success.slides', { id: Date.now(), image: '' })}>Add Slide</AdminButton>
            </div>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Subjects & Majors We Cover Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.subjects?.mainHeading || ''}
                onChange={(e) => updatePageData('subjects.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.subjects?.description || ''}
                onChange={(e) => updatePageData('subjects.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.subjects?.ctaText || ''}
                onChange={(e) => updatePageData('subjects.ctaText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Default: Take my online class"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Subject Cards</label>
              {(pageData.subjects?.subjectsContent || []).map((subject: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Subject {index + 1}</span>
                    <AdminButton type="button" variant="remove" onClick={() => removeArrayItem('subjects.subjectsContent', index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Title</label>
                      <input
                        type="text"
                        value={subject.title || ''}
                        onChange={(e) => updateArrayItem('subjects.subjectsContent', index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder="e.g., English"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">URL (relative path)</label>
                      <input
                        type="text"
                        value={subject.url || ''}
                        onChange={(e) => updateArrayItem('subjects.subjectsContent', index, 'url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder="e.g., /english"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Icon Path</label>
                      <input
                        type="text"
                        value={subject.icon || ''}
                        onChange={(e) => updateArrayItem('subjects.subjectsContent', index, 'icon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder="e.g., /assets/Icon/english.png"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Description (optional)</label>
                      <textarea
                        rows={2}
                        value={subject.description || ''}
                        onChange={(e) =>
                          updateArrayItem(
                            'subjects.subjectsContent',
                            index,
                            'description',
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder="Short description shown under the subject name"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() =>
                  addArrayItem('subjects.subjectsContent', {
                    title: '',
                    icon: '',
                    url: '',
                    description: '',
                  })}>Add Subject Card</AdminButton>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Final CTA Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading (before highlight)</label>
                <input
                  type="text"
                  value={pageData.finalCta?.textBefore || ''}
                  onChange={(e) => updatePageData('finalCta.textBefore', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Highlighted Text</label>
                <input
                  type="text"
                  value={pageData.finalCta?.highlightedText || ''}
                  onChange={(e) => updatePageData('finalCta.highlightedText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading (after highlight)</label>
                <input
                  type="text"
                  value={pageData.finalCta?.textAfter || ''}
                  onChange={(e) => updatePageData('finalCta.textAfter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.finalCta?.description || ''}
                onChange={(e) => updatePageData('finalCta.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <input
                type="text"
                value={pageData.finalCta?.buttonText || ''}
                onChange={(e) => updatePageData('finalCta.buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Academic Partners Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Academic Partners Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.academicPartners?.mainHeading || ''}
                onChange={(e) => updatePageData('academicPartners.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.academicPartners?.description || ''}
                onChange={(e) => updatePageData('academicPartners.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.academicPartners?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('academicPartners.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Partner Cards</label>
              {(pageData.academicPartners?.cards || []).map((card: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Card {index + 1}</span>
                    <AdminButton type="button" variant="remove" onClick={() => removeArrayItem('academicPartners.cards', index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={card.title || ''}
                      onChange={(e) => updateArrayItem('academicPartners.cards', index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Card Title"
                    />
                    <textarea
                      rows={2}
                      value={card.description || ''}
                      onChange={(e) => updateArrayItem('academicPartners.cards', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Card Description"
                    />
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() => addArrayItem('academicPartners.cards', { id: Date.now(), title: '', description: '' })}>Add Card</AdminButton>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Performances / Stats (number, title, subtitle)</label>
              {(pageData.academicPartners?.performances || []).map(
                (
                  perf: { number?: string; title?: string; subtitle?: string },
                  index: number,
                ) => (
                  <div
                    key={index}
                    className="mb-4 p-4 border border-gray-200 rounded-md"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Stat {index + 1}</span>
                      <AdminButton type="button" variant="remove" onClick={() =>
                          removeArrayItem("academicPartners.performances", index)
                        }>Remove</AdminButton>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <input
                        type="text"
                        value={perf.number || ""}
                        onChange={(e) =>
                          updateArrayItem(
                            "academicPartners.performances",
                            index,
                            "number",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder="Number (e.g. 15K+, 24/7)"
                      />
                      <input
                        type="text"
                        value={perf.title || ""}
                        onChange={(e) =>
                          updateArrayItem(
                            "academicPartners.performances",
                            index,
                            "title",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder="Title (e.g. Happy)"
                      />
                      <input
                        type="text"
                        value={perf.subtitle || ""}
                        onChange={(e) =>
                          updateArrayItem(
                            "academicPartners.performances",
                            index,
                            "subtitle",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder="Subtitle (e.g. Students)"
                      />
                    </div>
                  </div>
                ),
              )}
              <AdminButton type="button" variant="add" onClick={() =>
                  addArrayItem("academicPartners.performances", {
                    number: "",
                    title: "",
                    subtitle: "",
                  })}>Add Performance</AdminButton>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Reviews Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.customerReviews?.mainHeading || ''}
                onChange={(e) => updatePageData('customerReviews.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="How Students Rate Us!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trustpilot Rating Text</label>
              <input
                type="text"
                value={pageData.customerReviews?.trustpilotRating || ''}
                onChange={(e) => updatePageData('customerReviews.trustpilotRating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Rated 4.6/5 Based on 1000+ Reviews"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Review Cards (card heading + description; leave empty to use default list)</label>
              {(pageData.customerReviews?.reviews || []).map((review: { title?: string; description?: string; image?: string }, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Review {index + 1}</span>
                    <AdminButton type="button" variant="remove" onClick={() => removeArrayItem('customerReviews.reviews', index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={review.title || ''}
                      onChange={(e) => updateArrayItem('customerReviews.reviews', index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Card heading / title"
                    />
                    <textarea
                      rows={3}
                      value={review.description || ''}
                      onChange={(e) => updateArrayItem('customerReviews.reviews', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Card description"
                    />
                    <input
                      type="text"
                      value={review.image || ''}
                      onChange={(e) => updateArrayItem('customerReviews.reviews', index, 'image', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Star image path (e.g. /images/fivestar.svg, optional)"
                    />
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() => addArrayItem('customerReviews.reviews', { title: '', description: '', image: '/images/fivestar.svg' })}>Add Review Card</AdminButton>
            </div>
          </div>
        </div>

        {/* Get Quote Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Get Quote Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.getQuote?.mainHeading || ''}
                onChange={(e) => updatePageData('getQuote.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.getQuote?.description || ''}
                onChange={(e) => updatePageData('getQuote.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.getQuote?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('getQuote.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">FAQ Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.faq?.mainHeading || ''}
                onChange={(e) => updatePageData('faq.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">FAQ Items</label>
              {(pageData.faq?.faqs || []).map((faq: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">FAQ {index + 1}</span>
                    <AdminButton type="button" variant="remove" onClick={() => removeArrayItem('faq.faqs', index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={faq.question || ''}
                      onChange={(e) => updateArrayItem('faq.faqs', index, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Question"
                    />
                    <textarea
                      rows={3}
                      value={faq.answer || ''}
                      onChange={(e) => updateArrayItem('faq.faqs', index, 'answer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Answer"
                    />
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() => addArrayItem('faq.faqs', { id: Date.now(), question: '', answer: '' })}>Add FAQ</AdminButton>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          {selectedPage && selectedPage !== 'homework_page' && (
            <AdminButton type="button" variant="dangerLg" onClick={handlePageDelete} disabled={pageLoading}>Delete</AdminButton>
          )}
          <AdminButton type="submit" variant="primaryLg" disabled={pageLoading} loading={pageLoading}>{pageLoading ? "Saving..." : "Save Changes"}</AdminButton>
        </div>
      </form>
    );
  };

  return (
    <AdminDuplicateProvider sourcePageId={selectedPage}>
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminPageHeader title="Manage Homework Content" subtitle="Select a page to edit its content" />

      {/* Page Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Page</label>
        <select
          value={selectedPage}
          onChange={(e) => handlePageChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a page...</option>
          {availablePages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.title || page.id}
            </option>
          ))}
        </select>
      </div>

      {pageLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!pageLoading && selectedPage && (
        <div className="mb-4 p-4 bg-[#eef0f8] border border-[#c5cce8] rounded-md">
          <p className="text-sm text-[#283c88]">
            <strong>Editing:</strong> {availablePages.find(p => p.id === selectedPage)?.title || selectedPage}
          </p>
        </div>
      )}

      {pageData && !pageLoading && renderPageForm()}
    </div>
    </AdminDuplicateProvider>
  );
}


