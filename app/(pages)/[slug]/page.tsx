import MainLayout from "@/app/MainLayout";
import { FC } from "react";

interface PageProps {
	params: {
		slug: string | string[];
	};
}

const Page: FC<PageProps> = () => {
	// Minimal placeholder page to ensure this file is treated as a module.
	// This route may be used as a generic catch-all; implement specific logic later as needed.
	return (
		<MainLayout>
			<div />
		</MainLayout>
	);
};

export default Page;

export function generateStaticParams() {
	// Explicitly list the top-level pages that this catch-all [slug] route should export.
	// Keep this list in sync with folders under `app/(pages)`.
	const slugs = [
		"about-us",
		"assignment",
		"class-help",
		"classhelpdiscount",
		"contact-us",
		"dissertation-writing-services",
		"do-my-aleks-for-me",
		"do-my-assignment",
		"do-my-class",
		"do-my-class-1",
		"do-my-class-2",
		"do-my-exam",
		"essay-writing",
		"exams",
		"help-me-with-my-exam",
		"homework",
		"hooks",
		"online-class",
		"order",
		"pay-for-someone-to-write-my-paper",
		"pay-someone-to-do-my-assignment",
		"pay-someone-to-do-my-edgenuity",
		"pay-someone-to-take-my-online-exam",
		"pricing",
		"privacy",
		"samples",
		"savemytime",
		"scan",
		"service",
		"take-my-class",
		"take-my-exam",
		"take-my-proctored-exam-for-me",
		"terms-and-conditions",
		"thank-you",
		"thank-you-2",
		"thank-you-3",
		"tools",
		"write-my-paper",
	];

	return slugs.map((slug) => ({ slug }));
}
