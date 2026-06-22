"use client";

import React, { FC, useEffect, useState } from "react";
import {
  FaChevronDown,
  FaRegCopy,
  FaPlus,
  FaTimes,
  FaRegBookmark,
  FaCheck,
  FaBolt,
  FaPen,
  FaRegQuestionCircle,
} from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import DOMPurify from "dompurify";

// Citations only ever contain italic markup for titles. Restrict the allowed
// tags tightly so nothing executable can be injected even if upstream changes.
const sanitizeCitation = (html: string | null | undefined): string => {
  const input = typeof html === "string" ? html : "";
  if (!input) return "";
  if (typeof window === "undefined") {
    return input.replace(/<(?!\/?(i|em|b|strong)\b)[^>]*>/gi, "");
  }
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["i", "em", "b", "strong"],
    ALLOWED_ATTR: [],
  });
};

interface CitationToolProps {
  setFlag: (value: boolean) => void;
}

type CitationStyle = "APA" | "MLA" | "Chicago" | "Harvard";
type SourceType = "book" | "website" | "journal" | "article";

interface CitationResponse {
  status: string;
  citation_style: CitationStyle;
  source_type: SourceType;
  full_citation: string;
  in_text_citation: string | null;
  /** Chicago notes-bibliography only: the footnote (full note) form. */
  footnote?: string | null;
  engine?: string;
  tokens_used?: number;
}

interface AuthorRow {
  last: string;
  first: string;
}

type AutofillType = "doi" | "url" | "pdf" | "search";

interface LookupStatus {
  state: "loading" | "success" | "partial" | "error";
  message: string;
}

/** Mirror of the backend ExtractedCitation shape. */
interface ExtractedCitation {
  source_type?: SourceType;
  authors?: { last?: string; first?: string }[];
  title?: string;
  container_title?: string;
  publication_date?: { year?: number; month?: number; day?: number };
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  doi?: string;
  url?: string;
}

interface SearchResultRow {
  title?: string;
  authors?: string[];
  year?: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  source_type?: string;
  full_citation?: string | null;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Hover/focus tooltip. Render-gated on local state (not CSS group-hover) so
 * only the active tip ever shows and it never reserves layout space.
 */
const Tooltip: FC<{ text: string }> = ({ text }) => {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative ml-1 inline-flex items-center align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={text}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex items-center justify-center text-gray-400 hover:text-[#2b7fff] focus:outline-none dark:text-gray-500"
      >
        <FaRegQuestionCircle className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-56 -translate-x-1/2 rounded-md bg-gray-800 px-3 py-2 text-xs font-normal normal-case leading-relaxed text-white shadow-lg dark:bg-gray-700"
        >
          {text}
        </span>
      )}
    </span>
  );
};

const inputClass =
  "w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300";
const labelClass =
  "flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300";

const CitationTool: FC<CitationToolProps> = ({ setFlag }) => {
  const [token, setToken] = useState<string | null>(null);
  const [citationStyle, setCitationStyle] = useState<CitationStyle>("APA");
  const [sourceType, setSourceType] = useState<SourceType>("book");

  const [authors, setAuthors] = useState<AuthorRow[]>([{ last: "", first: "" }]);
  const [title, setTitle] = useState<string>("");
  const [publisher, setPublisher] = useState<string>("");
  const [publicationName, setPublicationName] = useState<string>("");
  const [journalName, setJournalName] = useState<string>("");
  const [websiteName, setWebsiteName] = useState<string>("");
  const [edition, setEdition] = useState<string>("");
  const [bookVolume, setBookVolume] = useState<string>("");
  const [chicagoVariant, setChicagoVariant] = useState<
    "notes-bibliography" | "author-date"
  >("notes-bibliography");
  const [url, setUrl] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [volume, setVolume] = useState<string>("");
  const [issue, setIssue] = useState<string>("");
  const [pages, setPages] = useState<string>("");
  const [doi, setDoi] = useState<string>("");

  // Split publication date
  const [pubYear, setPubYear] = useState<string>("");
  const [pubMonth, setPubMonth] = useState<string>("");
  const [pubDay, setPubDay] = useState<string>("");

  // Split access date
  const [accessYear, setAccessYear] = useState<string>("");
  const [accessMonth, setAccessMonth] = useState<string>("");
  const [accessDay, setAccessDay] = useState<string>("");

  // Online / e-book toggle (book → e-book; journal/article → accessed online)
  const [isOnline, setIsOnline] = useState<boolean>(false);

  const [includeInText, setIncludeInText] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<CitationResponse | null>(null);
  const [error, setError] = useState<string>("");

  // ── Auto-fill ──
  const [mode, setMode] = useState<"autofill" | "manual">("autofill");
  const [autofillType, setAutofillType] = useState<AutofillType>("doi");
  const [doiInput, setDoiInput] = useState<string>("");
  const [urlInput, setUrlInput] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [lookupStatus, setLookupStatus] = useState<LookupStatus | null>(null);
  const [lookupBusy, setLookupBusy] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResultRow[]>([]);

  // ── Save to Dashboard ──
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedDocId, setSavedDocId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);

  const apiBase = process.env.NEXT_PUBLIC_NGROX_URL;
  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  /** Apply extracted fields to the form. Only sets fields that are present. */
  const populateFromExtracted = (d: ExtractedCitation) => {
    if (d.source_type) setSourceType(d.source_type);
    if (d.authors && d.authors.length) {
      setAuthors(
        d.authors.map((a) => ({ last: a.last || "", first: a.first || "" })),
      );
    }
    if (d.title) setTitle(d.title);
    if (d.container_title) {
      const st = d.source_type || sourceType;
      if (st === "journal") setJournalName(d.container_title);
      else if (st === "website") setWebsiteName(d.container_title);
      else if (st === "article") setPublicationName(d.container_title);
    }
    if (d.publication_date) {
      if (d.publication_date.year !== undefined)
        setPubYear(String(d.publication_date.year));
      if (d.publication_date.month !== undefined)
        setPubMonth(String(d.publication_date.month));
      if (d.publication_date.day !== undefined)
        setPubDay(String(d.publication_date.day));
    }
    if (d.volume) setVolume(d.volume);
    if (d.issue) setIssue(d.issue);
    if (d.pages) setPages(d.pages);
    if (d.publisher) setPublisher(d.publisher);
    if (d.doi || d.url) {
      setIsOnline(true);
      if (d.doi) setDoi(d.doi);
      if (d.url) setUrl(d.url);
    }
  };

  const runLookup = async (
    endpoint: string,
    body: Record<string, unknown> | FormData,
  ) => {
    if (!apiBase) return;
    setLookupBusy(true);
    setLookupStatus({ state: "loading", message: "Looking up…" });
    setError("");
    try {
      const isForm = body instanceof FormData;
      const res = await axios.post(`${apiBase}${endpoint}`, body, {
        headers: {
          ...authHeaders(),
          ...(isForm ? {} : { "Content-Type": "application/json" }),
        },
      });
      // Backend returns { status, message, manual_fallback, fields }, wrapped by
      // the API envelope as res.data.data.
      const result = res.data?.data ?? res.data;
      if (result?.fields) populateFromExtracted(result.fields as ExtractedCitation);
      setLookupStatus({
        state:
          result?.status === "success"
            ? "success"
            : result?.status === "error" || result?.status === "not_found"
              ? "error"
              : "partial",
        message: result?.message || "Done.",
      });
      if (result?.manual_fallback) setMode("manual");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lookup failed. Please fill the fields in manually.";
      setLookupStatus({ state: "error", message: Array.isArray(msg) ? msg.join(", ") : msg });
    } finally {
      setLookupBusy(false);
    }
  };

  const handleLookupDoi = () => {
    if (!doiInput.trim()) {
      setLookupStatus({ state: "error", message: "Please enter a DOI first." });
      return;
    }
    runLookup("/tools/citation/lookup/doi", { doi: doiInput.trim() });
  };

  const handleLookupUrl = () => {
    if (!urlInput.trim()) {
      setLookupStatus({ state: "error", message: "Please enter a URL first." });
      return;
    }
    runLookup("/tools/citation/lookup/url", { url: urlInput.trim() });
  };

  const handleUploadPdf = (file: File | undefined) => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    runLookup("/tools/citation/lookup/pdf", form);
  };

  const handleSearch = async () => {
    if (!searchInput.trim() || !apiBase) {
      setLookupStatus({ state: "error", message: "Please enter a title or keywords." });
      return;
    }
    setLookupBusy(true);
    setSearchResults([]);
    setLookupStatus({ state: "loading", message: "Searching academic databases…" });
    try {
      const res = await axios.get(`${apiBase}/tools/citation-search`, {
        params: { q: searchInput.trim(), type: "title", style: citationStyle },
        headers: authHeaders(),
      });
      const data = res.data?.data ?? res.data;
      const rows: SearchResultRow[] = data?.results || [];
      setSearchResults(rows);
      setLookupStatus(
        rows.length
          ? { state: "success", message: `${rows.length} results — select one to auto-fill.` }
          : { state: "error", message: "No results found. Try different keywords." },
      );
    } catch (err: any) {
      setLookupStatus({
        state: "error",
        message: err?.response?.data?.message || "Search failed. Please try again.",
      });
    } finally {
      setLookupBusy(false);
    }
  };

  const handleSelectSearchResult = (r: SearchResultRow) => {
    populateFromExtracted({
      source_type: (r.source_type as SourceType) || "journal",
      authors: (r.authors || []).map((a) => {
        if (a.includes(",")) {
          const [last, ...rest] = a.split(",");
          return { last: last.trim(), first: rest.join(",").trim() };
        }
        const parts = a.split(/\s+/);
        const last = parts.pop() || "";
        return { last, first: parts.join(" ") };
      }),
      title: r.title,
      container_title: r.journal,
      publication_date: r.year ? { year: r.year } : undefined,
      volume: r.volume,
      issue: r.issue,
      pages: r.pages,
      doi: r.doi,
      url: r.url,
    });
    setLookupStatus({
      state: "success",
      message: "Fields populated. Review and generate, or switch to Manual to edit.",
    });
  };

  // Website always behaves as online (link + access date relevant).
  const showOnlineFields = sourceType === "website" || isOnline;
  // City is required only by Harvard & Chicago books (APA 7 dropped place of publication).
  const showCity =
    sourceType === "book" &&
    (citationStyle === "Harvard" || citationStyle === "Chicago");
  // Access date is meaningful for online sources (websites, online journals/articles).
  const showAccessDate =
    sourceType === "website" ||
    ((sourceType === "journal" || sourceType === "article") && isOnline);

  const hasAuthor = authors.some((a) => a.last.trim() || a.first.trim());

  // Warn when an edition abbreviation ("ed"/"edn") is missing its trailing period.
  const editionNeedsPeriod =
    sourceType === "book" && /\b(ed|edn)$/i.test(edition.trim());

  const updateAuthor = (idx: number, field: keyof AuthorRow, value: string) => {
    setAuthors((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)),
    );
  };
  const addAuthor = () => setAuthors((prev) => [...prev, { last: "", first: "" }]);
  const removeAuthor = (idx: number) =>
    setAuthors((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  const setAccessToday = () => {
    const now = new Date();
    setAccessYear(String(now.getFullYear()));
    setAccessMonth(String(now.getMonth() + 1));
    setAccessDay(String(now.getDate()));
  };

  const handleClear = () => {
    setCitationStyle("APA");
    setSourceType("book");
    setAuthors([{ last: "", first: "" }]);
    setTitle("");
    setPublisher("");
    setPublicationName("");
    setJournalName("");
    setWebsiteName("");
    setEdition("");
    setBookVolume("");
    setChicagoVariant("notes-bibliography");
    setUrl("");
    setCity("");
    setVolume("");
    setIssue("");
    setPages("");
    setDoi("");
    setPubYear("");
    setPubMonth("");
    setPubDay("");
    setAccessYear("");
    setAccessMonth("");
    setAccessDay("");
    setIsOnline(false);
    setIncludeInText(true);
    setResult(null);
    setError("");
    setDoiInput("");
    setUrlInput("");
    setSearchInput("");
    setLookupStatus(null);
    setSearchResults([]);
    setSavedDocId(null);
  };

  const handleGenerate = async () => {
    if (!title.trim() && !hasAuthor) {
      setError("Please enter at least a title or an author name.");
      toast.error("Please enter at least a title or an author name.");
      return;
    }

    trackToolGenerate({ toolName: "Citation Tool" });
    setIsSubmitting(true);
    setError("");
    setResult(null);
    setSavedDocId(null);

    try {
      const cleanAuthors = authors
        .map((a) => ({ last: a.last.trim(), first: a.first.trim() }))
        .filter((a) => a.last || a.first);

      const toNum = (s: string) => {
        const n = parseInt(s.trim(), 10);
        return Number.isFinite(n) && n > 0 ? n : undefined;
      };

      const publication_date: Record<string, number> = {};
      if (toNum(pubYear) !== undefined) publication_date.year = toNum(pubYear)!;
      if (toNum(pubMonth) !== undefined) publication_date.month = toNum(pubMonth)!;
      if (toNum(pubDay) !== undefined) publication_date.day = toNum(pubDay)!;

      const access_date_parts: Record<string, number> = {};
      if (showAccessDate) {
        if (toNum(accessYear) !== undefined) access_date_parts.year = toNum(accessYear)!;
        if (toNum(accessMonth) !== undefined) access_date_parts.month = toNum(accessMonth)!;
        if (toNum(accessDay) !== undefined) access_date_parts.day = toNum(accessDay)!;
      }

      const payload: Record<string, unknown> = {
        citation_style: citationStyle,
        source_type: sourceType,
        include_in_text: includeInText,
      };

      if (cleanAuthors.length) payload.authors = cleanAuthors;
      if (title.trim()) payload.title = title.trim();
      if (sourceType === "book" && publisher.trim()) payload.publisher = publisher.trim();
      if (sourceType === "article" && publicationName.trim())
        payload.publication_name = publicationName.trim();
      if (sourceType === "journal" && journalName.trim())
        payload.journal_name = journalName.trim();
      if (sourceType === "website" && websiteName.trim())
        payload.website_name = websiteName.trim();
      if (sourceType === "book" && edition.trim()) payload.edition = edition.trim();
      if (sourceType === "book" && bookVolume.trim())
        payload.book_volume = bookVolume.trim();
      if (showCity && city.trim()) payload.city = city.trim();
      // `volume` is the journal volume; books use `book_volume`.
      if (sourceType === "journal" && volume.trim()) payload.volume = volume.trim();
      if (sourceType === "journal" && issue.trim()) payload.issue = issue.trim();
      if (citationStyle === "Chicago") payload.chicago_variant = chicagoVariant;
      if (pages.trim()) payload.pages = pages.trim();
      // DOI/URL only when relevant: websites always, others when online.
      if (showOnlineFields && doi.trim()) payload.doi = doi.trim();
      if (showOnlineFields && url.trim()) payload.url = url.trim();
      if (Object.keys(publication_date).length) payload.publication_date = publication_date;
      if (Object.keys(access_date_parts).length)
        payload.access_date_parts = access_date_parts;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/citation-generator`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Backend wraps responses as { success, message, data }
      const responsePayload = response.data?.data ?? response.data;

      if (responsePayload.status === "success") {
        setResult(responsePayload);
        setFlag(true);
        toast.success("Citation generated successfully!");
      } else {
        setError("Failed to generate citation. Please try again.");
        toast.error("Failed to generate citation.");
      }
    } catch (err: any) {
      console.error("Error generating citation:", err);
      const errorMessage =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.message)
          ? err.response.data.message.join(", ")
          : err?.message) ||
        "Something went wrong. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // The engine wraps italic titles in <i></i>; strip tags for the plain-text fallback.
  const stripHtml = (s: string) => s.replace(/<\/?i>/g, "");

  /**
   * Copy preserving italics: write both text/html (so rich editors keep the
   * italic title) and text/plain (fallback). Falls back to plain text on
   * browsers without the async ClipboardItem API.
   */
  const handleCopy = async (html: string) => {
    const plain = stripHtml(html);
    try {
      if (
        typeof ClipboardItem !== "undefined" &&
        navigator.clipboard &&
        "write" in navigator.clipboard
      ) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([plain], { type: "text/plain" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plain);
      }
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      // Last resort: plain text.
      try {
        await navigator.clipboard.writeText(plain);
        toast.success("Copied to clipboard!");
      } catch {
        toast.error("Failed to copy.");
      }
    }
  };

  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const handleSaveToDashboard = async () => {
    if (!result || !apiBase) return;
    if (savedDocId) {
      toast.success("Already saved to your dashboard.");
      return;
    }
    setIsSaving(true);
    try {
      const docTitle = `Citation — ${result.citation_style} (${result.source_type})`;
      // full_citation/footnote contain only trusted <i> markup from the engine.
      const contentHtml =
        `<p>${result.full_citation}</p>` +
        (result.footnote
          ? `<p><strong>Footnote:</strong> ${result.footnote}</p>`
          : "") +
        (result.in_text_citation
          ? `<p><strong>In-text:</strong> ${escapeHtml(result.in_text_citation)}</p>`
          : "");
      const response = await axios.post(
        `${apiBase}/documents`,
        {
          title: docTitle,
          content: contentHtml,
          source_tool: "citation-generator",
        },
        { headers: authHeaders() },
      );
      const id = response.data?.data?._id;
      if (!id) throw new Error("Could not save the citation.");
      setSavedDocId(id);
      toast.success("Saved to your dashboard.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to save.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setIsSaving(false);
    }
  };

  const onlineToggleLabel =
    sourceType === "book"
      ? "This is an e-book or online version"
      : "Accessed online";

  return (
    <div className="container relative overflow-y-auto h-[calc(100vh-8vh)] mx-auto max-w-[840px] px-4 md:px-8 md:pt-8 2xl:max-w-6xl">
      <ToolsApiLoader show={isSubmitting} />
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 overflow-hidden transition-colors duration-300">
        {/* Main Overview Section */}
        <div className="pt-6 ">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 transition-colors duration-300 text-center">
            Citation Generator Tool
          </h2>
        </div>

        {/* Input Section */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="space-y-4">
            {/* Style and Source Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Citation Style */}
              <div>
                <label htmlFor="citation_style" className={labelClass}>
                  Citation Style: <span className="text-[#fb2c36]">*</span>
                </label>
                <div className="relative">
                  <select
                    id="citation_style"
                    value={citationStyle}
                    onChange={(e) => setCitationStyle(e.target.value as CitationStyle)}
                    className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] dark:focus:ring-[#51a2ff] hover:cursor-pointer transition-colors duration-300 appearance-none"
                  >
                    <option value="APA">APA 7</option>
                    <option value="MLA">MLA 9</option>
                    <option value="Chicago">Chicago 17th</option>
                    <option value="Harvard">Harvard</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-300">
                    <FaChevronDown className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Source Type */}
              <div>
                <label htmlFor="source_type" className={labelClass}>
                  Source Type: <span className="text-[#fb2c36]">*</span>
                </label>
                <div className="relative">
                  <select
                    id="source_type"
                    value={sourceType}
                    onChange={(e) => {
                      setSourceType(e.target.value as SourceType);
                      setIsOnline(false);
                    }}
                    className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] dark:focus:ring-[#51a2ff] hover:cursor-pointer transition-colors duration-300 appearance-none"
                  >
                    <option value="book">Book</option>
                    <option value="website">Website</option>
                    <option value="journal">Journal Article</option>
                    <option value="article">News / Magazine</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-300">
                    <FaChevronDown className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Chicago system selector */}
            {citationStyle === "Chicago" && (
              <div>
                <label className={labelClass}>Chicago system</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(
                    [
                      {
                        key: "notes-bibliography",
                        label: "Notes & Bibliography",
                        sub: "Bibliography entry + footnote",
                      },
                      {
                        key: "author-date",
                        label: "Author-Date",
                        sub: "Reference list + (Author Year)",
                      },
                    ] as {
                      key: "notes-bibliography" | "author-date";
                      label: string;
                      sub: string;
                    }[]
                  ).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setChicagoVariant(opt.key)}
                      className={`rounded-md border p-3 text-left transition-colors ${
                        chicagoVariant === opt.key
                          ? "border-[#565add] bg-[#565add]/5 dark:bg-[#565add]/10"
                          : "border-gray-300 dark:border-gray-600 hover:border-[#2b7fff]"
                      }`}
                    >
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-gray-400">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode toggle: Auto-fill vs Manual */}
            <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-900">
              {(["autofill", "manual"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded transition-colors duration-200 ${
                    mode === m
                      ? "bg-[#565add] text-white"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {m === "autofill" ? (
                    <>
                      <FaBolt className="h-3 w-3" /> Auto-fill
                    </>
                  ) : (
                    <>
                      <FaPen className="h-3 w-3" /> Manual
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Auto-fill panel */}
            {mode === "autofill" && (
              <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 space-y-4">
                {/* Method selector */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(
                    [
                      { key: "doi", label: "DOI", sub: "Journals & papers" },
                      { key: "url", label: "URL", sub: "Websites & articles" },
                      { key: "pdf", label: "PDF", sub: "Extract from file" },
                      { key: "search", label: "Search", sub: "Find papers" },
                    ] as { key: AutofillType; label: string; sub: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setAutofillType(opt.key);
                        setLookupStatus(null);
                        setSearchResults([]);
                      }}
                      className={`rounded-md border p-2 text-left transition-colors duration-200 ${
                        autofillType === opt.key
                          ? "border-[#565add] bg-white dark:bg-gray-800"
                          : "border-gray-200 dark:border-gray-700 hover:border-[#2b7fff]"
                      }`}
                    >
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-gray-400">{opt.sub}</div>
                    </button>
                  ))}
                </div>

                {/* DOI */}
                {autofillType === "doi" && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={doiInput}
                      onChange={(e) => setDoiInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLookupDoi()}
                      placeholder="e.g. 10.1037/a0040251 or https://doi.org/…"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={handleLookupDoi}
                      disabled={lookupBusy}
                      className="px-5 rounded-md font-medium text-white bg-[#565add] hover:bg-[#656aff] disabled:opacity-60 whitespace-nowrap"
                    >
                      Look up
                    </button>
                  </div>
                )}

                {/* URL */}
                {autofillType === "url" && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLookupUrl()}
                      placeholder="https://www.example.com/article-title"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={handleLookupUrl}
                      disabled={lookupBusy}
                      className="px-5 rounded-md font-medium text-white bg-[#565add] hover:bg-[#656aff] disabled:opacity-60 whitespace-nowrap"
                    >
                      Extract
                    </button>
                  </div>
                )}

                {/* PDF */}
                {autofillType === "pdf" && (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 text-center hover:border-[#2b7fff] transition-colors">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => handleUploadPdf(e.target.files?.[0])}
                    />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Click to upload a PDF
                    </span>
                    <span className="text-[11px] text-gray-400 mt-1">
                      We extract title, authors, and date from the file metadata
                    </span>
                  </label>
                )}

                {/* Search by title */}
                {autofillType === "search" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="e.g. impact of social media on adolescents"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={handleSearch}
                        disabled={lookupBusy}
                        className="px-5 rounded-md font-medium text-white bg-[#565add] hover:bg-[#656aff] disabled:opacity-60 whitespace-nowrap"
                      >
                        Search
                      </button>
                    </div>
                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {searchResults.map((r, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSelectSearchResult(r)}
                            className="w-full text-left rounded-md border border-gray-200 dark:border-gray-700 p-3 hover:border-[#2b7fff] bg-white dark:bg-gray-800 transition-colors"
                          >
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                              {r.title || "Untitled"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {(r.authors || []).slice(0, 3).join("; ")}
                              {r.authors && r.authors.length > 3 ? " et al." : ""}
                              {r.year ? ` · ${r.year}` : ""}
                              {r.journal ? ` · ${r.journal}` : ""}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Lookup status */}
                {lookupStatus && (
                  <div
                    className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
                      lookupStatus.state === "success"
                        ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : lookupStatus.state === "loading"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                          : lookupStatus.state === "partial"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                            : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {lookupStatus.message}
                  </div>
                )}

                <p className="text-[11px] text-gray-400">
                  Auto-fill populates the form below — review every field before
                  generating. Switch to Manual any time.
                </p>
              </div>
            )}

            {/* Authors */}
            <div>
              <label className={labelClass}>
                Authors{" "}
                <span className="ml-1 text-xs font-normal text-gray-400">
                  (optional)
                </span>
              </label>
              <div className="space-y-2">
                {authors.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={a.last}
                      onChange={(e) => updateAuthor(idx, "last", e.target.value)}
                      placeholder="Last name"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={a.first}
                      onChange={(e) => updateAuthor(idx, "first", e.target.value)}
                      placeholder="First name"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => removeAuthor(idx)}
                      disabled={authors.length === 1}
                      title="Remove author"
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-30 dark:border-gray-600 dark:text-gray-400"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addAuthor}
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#2b7fff] hover:underline"
              >
                <FaPlus className="h-3 w-3" /> Add another author
              </button>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Leave blank if there is no author.
              </p>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className={labelClass}>
                {sourceType === "book"
                  ? "Book Title"
                  : sourceType === "website"
                    ? "Page Title"
                    : "Article Title"}{" "}
                <span className="text-[#fb2c36]">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                className={inputClass}
              />
            </div>

            {/* Note */}
            <p className="text-sm text-gray-500 dark:text-gray-400 italic transition-colors duration-300">
              Note: At least a title or an author is required.
            </p>

            {/* Container title per source type */}
            {sourceType === "journal" && (
              <div>
                <label htmlFor="journal_name" className={labelClass}>
                  Journal Name
                </label>
                <input
                  id="journal_name"
                  type="text"
                  value={journalName}
                  onChange={(e) => setJournalName(e.target.value)}
                  placeholder="e.g., Journal of Digital Psychology"
                  className={inputClass}
                />
              </div>
            )}
            {sourceType === "website" && (
              <div>
                <label htmlFor="website_name" className={labelClass}>
                  Website Name
                </label>
                <input
                  id="website_name"
                  type="text"
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  placeholder="e.g., NIH Health Information"
                  className={inputClass}
                />
              </div>
            )}
            {sourceType === "article" && (
              <div>
                <label htmlFor="publication_name" className={labelClass}>
                  Publication / Magazine Name
                </label>
                <input
                  id="publication_name"
                  type="text"
                  value={publicationName}
                  onChange={(e) => setPublicationName(e.target.value)}
                  placeholder="e.g., Environmental Science Today"
                  className={inputClass}
                />
              </div>
            )}

            {/* Book-specific fields */}
            {sourceType === "book" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edition" className={labelClass}>
                      Edition{" "}
                      <span className="ml-1 text-xs font-normal text-gray-400">
                        (optional)
                      </span>
                      <Tooltip text='Only if not the first edition, e.g. "3rd ed."' />
                    </label>
                    <input
                      id="edition"
                      type="text"
                      value={edition}
                      onChange={(e) => setEdition(e.target.value)}
                      placeholder="e.g., 3rd ed."
                      className={`${inputClass} ${
                        editionNeedsPeriod
                          ? "border-red-400 focus:ring-red-400 dark:border-red-500"
                          : ""
                      }`}
                    />
                    {editionNeedsPeriod && (
                      <p className="mt-1 text-xs text-red-500">
                        Add a period after the abbreviation — e.g. “2nd ed.” not “2nd ed”.
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="publisher" className={labelClass}>
                      Publisher
                    </label>
                    <input
                      id="publisher"
                      type="text"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="e.g., Academic Press"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="book_volume" className={labelClass}>
                    Volume{" "}
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      (optional)
                    </span>
                    <Tooltip text="Add only if the book is part of a multi-volume set, e.g. “1” for Vol. 1. Leave blank otherwise." />
                  </label>
                  <input
                    id="book_volume"
                    type="text"
                    value={bookVolume}
                    onChange={(e) => setBookVolume(e.target.value)}
                    placeholder="e.g., 1"
                    className={inputClass}
                  />
                </div>

                {showCity && (
                  <div>
                    <label htmlFor="city" className={labelClass}>
                      City of Publication
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., New York"
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      Required for Harvard &amp; Chicago.
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="pages_book" className={labelClass}>
                    Pages{" "}
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      (optional)
                    </span>
                    <Tooltip text="Only include page numbers if you are citing a specific chapter, section, or quote within the book. For a whole-book citation, leave this blank." />
                  </label>
                  <input
                    id="pages_book"
                    type="text"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    placeholder="e.g., 45-67"
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {/* Journal-specific fields */}
            {sourceType === "journal" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="volume" className={labelClass}>
                    Volume
                  </label>
                  <input
                    id="volume"
                    type="text"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    placeholder="e.g., 15"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="issue" className={labelClass}>
                    Issue
                  </label>
                  <input
                    id="issue"
                    type="text"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="e.g., 3"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="pages_journal" className={labelClass}>
                    Pages
                  </label>
                  <input
                    id="pages_journal"
                    type="text"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    placeholder="e.g., 123-145"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* Article pages */}
            {sourceType === "article" && (
              <div>
                <label htmlFor="pages_article" className={labelClass}>
                  Pages{" "}
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (optional)
                  </span>
                </label>
                <input
                  id="pages_article"
                  type="text"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="e.g., 12-14"
                  className={inputClass}
                />
              </div>
            )}

            {/* Publication date — split year / month / day */}
            <div>
              <label className={labelClass}>
                Publication Date
                <Tooltip text="Year at minimum. Add the full month and day when it is shown on the page (especially for websites and news)." />
              </label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  value={pubYear}
                  onChange={(e) => setPubYear(e.target.value)}
                  placeholder="Year"
                  min="1000"
                  max="9999"
                  className={inputClass}
                />
                <div className="relative">
                  <select
                    value={pubMonth}
                    onChange={(e) => setPubMonth(e.target.value)}
                    className="w-full p-3 pr-8 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] hover:cursor-pointer transition-colors duration-300 appearance-none"
                  >
                    <option value="">Month (optional)</option>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-300">
                    <FaChevronDown className="w-3 h-3" />
                  </span>
                </div>
                <input
                  type="number"
                  value={pubDay}
                  onChange={(e) => setPubDay(e.target.value)}
                  placeholder="Day"
                  min="1"
                  max="31"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Online / e-book toggle (hidden for websites — always online) */}
            {sourceType !== "website" && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOnline}
                  onChange={(e) => setIsOnline(e.target.checked)}
                  className="w-4 h-4 text-[#155dfc] border-gray-300 rounded focus:ring-[#2b7fff] dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {onlineToggleLabel}
                </span>
              </label>
            )}

            {/* Online fields: DOI, URL, access date */}
            {showOnlineFields && (
              <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sourceType !== "website" && (
                    <div>
                      <label htmlFor="doi" className={labelClass}>
                        DOI{" "}
                        <span className="ml-1 text-xs font-normal text-gray-400">
                          (preferred)
                        </span>
                        <Tooltip text="Looks like: 10.1037/a0040251 — use it instead of a URL when available. Required for e-books and online journals per APA." />
                      </label>
                      <input
                        id="doi"
                        type="text"
                        value={doi}
                        onChange={(e) => setDoi(e.target.value)}
                        placeholder="e.g., 10.1037/a0040251"
                        className={inputClass}
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="url" className={labelClass}>
                      URL{" "}
                      <span className="ml-1 text-xs font-normal text-gray-400">
                        {sourceType === "website" ? "" : "(if no DOI)"}
                      </span>
                    </label>
                    <input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/article"
                      className={inputClass}
                    />
                  </div>
                </div>

                {showAccessDate && (
                  <div>
                    <label className={labelClass}>
                      Access Date
                      <Tooltip text="Only add an access date for frequently-changing content (e.g. wikis, social media). For stable sources like journals or news articles, leave this blank." />
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="number"
                        value={accessYear}
                        onChange={(e) => setAccessYear(e.target.value)}
                        placeholder="Year"
                        min="1000"
                        max="9999"
                        className={inputClass}
                      />
                      <div className="relative">
                        <select
                          value={accessMonth}
                          onChange={(e) => setAccessMonth(e.target.value)}
                          className="w-full p-3 pr-8 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] hover:cursor-pointer transition-colors duration-300 appearance-none"
                        >
                          <option value="">Month</option>
                          {MONTHS.map((m, i) => (
                            <option key={m} value={i + 1}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-300">
                          <FaChevronDown className="w-3 h-3" />
                        </span>
                      </div>
                      <input
                        type="number"
                        value={accessDay}
                        onChange={(e) => setAccessDay(e.target.value)}
                        placeholder="Day"
                        min="1"
                        max="31"
                        className={inputClass}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={setAccessToday}
                      className="mt-2 text-xs font-medium text-[#2b7fff] hover:underline"
                    >
                      Set to today
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Include In-Text Citation */}
            <div className="flex items-center gap-2">
              <input
                id="include_in_text"
                type="checkbox"
                checked={includeInText}
                onChange={(e) => setIncludeInText(e.target.checked)}
                className="w-4 h-4 text-[#155dfc] border-gray-300 rounded focus:ring-[#2b7fff] dark:focus:ring-[#155dfc] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="include_in_text"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
              >
                Include in-text citation
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleGenerate}
                disabled={isSubmitting || (!title.trim() && !hasAuthor)}
                className={`px-6 py-2.5 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b7fff] transition-colors duration-300 ${
                  isSubmitting || (!title.trim() && !hasAuthor)
                    ? "bg-[#565add] dark:bg-[#565add] cursor-not-allowed"
                    : "bg-[#565add] hover:bg-[#656aff] dark:bg-[#565add] dark:hover:bg-[#565add]"
                }`}
              >
                {isSubmitting ? "Generating..." : "Generate Citation"}
              </button>

              <button
                onClick={handleClear}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-md font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b7fff] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="p-6 space-y-4">
            {/* Full Citation */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                  {result.citation_style === "Chicago" && result.footnote
                    ? "Bibliography Entry"
                    : result.citation_style === "Chicago"
                      ? "Reference List Entry"
                      : "Full Citation"}{" "}
                  ({result.citation_style} - {result.source_type}):
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToDashboard}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300 disabled:opacity-60 ${
                      savedDocId
                        ? "border border-green-300 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-900/20"
                        : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    title="Save to your dashboard"
                  >
                    {savedDocId ? <FaCheck /> : <FaRegBookmark />}
                    {isSaving ? "Saving..." : savedDocId ? "Saved" : "Save to Dashboard"}
                  </button>
                  <button
                    onClick={() => handleCopy(result.full_citation)}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                    title="Copy citation"
                  >
                    <FaRegCopy />
                    Copy
                  </button>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <p
                  className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap transition-colors duration-300 [&_i]:italic"
                  // Engine output contains only <i></i> markup for italic titles.
                  dangerouslySetInnerHTML={{
                    __html: sanitizeCitation(result.full_citation),
                  }}
                />
              </div>
              {savedDocId && (
                <p className="mt-2 text-xs text-green-700 dark:text-green-400">
                  Saved to your{" "}
                  <a
                    href="/tools/dashboard"
                    className="font-medium underline hover:text-green-800"
                  >
                    dashboard library
                  </a>
                  . Find it under your saved documents.
                </p>
              )}
            </div>

            {/* Chicago footnote (notes-bibliography only) */}
            {result.footnote && (
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Footnote (Full Note):
                  </h3>
                  <button
                    onClick={() => handleCopy(result.footnote!)}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                    title="Copy footnote"
                  >
                    <FaRegCopy />
                    Copy
                  </button>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                  <p
                    className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap transition-colors duration-300 [&_i]:italic"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeCitation(result.footnote),
                    }}
                  />
                </div>
              </div>
            )}

            {/* In-Text Citation */}
            {result.in_text_citation && (
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                    In-Text Citation:
                  </h3>
                  <button
                    onClick={() => handleCopy(result.in_text_citation!)}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                    title="Copy in-text citation"
                  >
                    <FaRegCopy />
                    Copy
                  </button>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                  <p className="text-gray-800 dark:text-gray-100 transition-colors duration-300">
                    {result.in_text_citation}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Quote */}
      <div className="text-sm font-serif text-center pt-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
        <q>
          Create perfect academic citations effortlessly with ScholarlyHelp&apos;s
          Citation Generator. Generate properly formatted citations in APA, MLA,
          Chicago, or Harvard style for books, websites, journals, and
          articles—all with in-text citation support.
        </q>
      </div>
    </div>
  );
};

export default CitationTool;
