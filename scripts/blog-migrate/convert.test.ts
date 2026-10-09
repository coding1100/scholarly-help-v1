import { describe, expect, it } from "vitest";
import { convertPostPage } from "./convert";

const w = (type: string, inner: string, extra = "") =>
  `<div class="elementor-element elementor-widget elementor-widget-${type}" data-element_type="widget" data-widget_type="${type}.default" ${extra}><div class="elementor-widget-container">${inner}</div></div>`;
const c = (inner: string, cls = "") => `<div class="elementor-element e-con ${cls}" data-element_type="container">${inner}</div>`;
const heading = (tag: string, text: string) => w("heading", `<${tag} class="elementor-heading-title">${text}</${tag}>`);
const button = (label: string, href: string) => w("button", `<a class="elementor-button" href="${href}"><span>${label}</span></a>`);
const iconBox = (title: string, desc: string, icon = true) =>
  w("icon-box", `<div class="elementor-icon-box-wrapper">${icon ? '<span class="elementor-icon"><svg class="e-font-icon-svg e-fas-clock"></svg></span>' : ""}<div class="elementor-icon-box-title"><span>${title}</span></div><p class="elementor-icon-box-description">${desc}</p></div>`);

const page = `<html><body><div data-elementor-type="single-post" data-elementor-id="11">
  ${c(`${w("theme-post-title", '<h1 class="elementor-heading-title">Post</h1>')}
      ${w("video", "", `data-settings='{"video_type":"youtube","youtube_url":"https://www.youtube.com/watch?v=abc123XYZ"}'`)}
      ${c(heading("h2", "Hero CTA") + w("text-editor", "<p>Hero text</p>") + button("Go", "https://scholarlyhelp.com/exams/"))}`)}
  ${c(`
    ${c(`
      ${c(heading("h2", "Hidden") + button("x", "/x/"), "elementor-hidden-desktop elementor-hidden-tablet elementor-hidden-mobile")}
      ${w("text-editor", "<p>Intro paragraph.</p>")}
      ${w("theme-post-featured-image", "<img src='x.jpg'>")}
      ${heading("h2", "Section One")}
      ${w("text-editor", "<p>Section text.</p>")}
      ${c(iconBox("Total Time", "130 minutes") + iconBox("Questions", "60"), "e-grid")}
      ${c(c(heading("h3", "Mid CTA") + w("text-editor", "<p>Mid text</p>")) + c(button("Help", "https://scholarlyhelp.com/homework/")))}
      ${c(iconBox("95%", "Success Rate", false) + iconBox("10K+", "Students", false))}
      ${w("theme-post-content", `<h2>Body Heading</h2><p>Body <a href="/x/">link</a>.</p>
         <div data-elementor-type="container" data-elementor-id="1160">${c(heading("h2", "Inline CTA") + w("icon-list", '<ul><li><span class="elementor-icon-list-text">Point A</span></li><li><span class="elementor-icon-list-text">Point B</span></li></ul>') + button("Essay Help", "https://scholarlyhelp.com/essay-writing/"))}</div>
         <div data-elementor-type="container">${c(w("image-box", '<figure><a href="https://scholarlyhelp.com/exams/statistics/"><img src="https://scholarlyhelp.com/blog/wp-content/uploads/a.webp"></a></figure><h3 class="elementor-image-box-title"><a href="https://scholarlyhelp.com/exams/statistics/">Statistics Exam</a></h3>'))}</div>`)}
      ${heading("h2", "Frequently Asked Questions")}
      ${w("elementskit-accordion", '<div class="elementskit-card"><a class="elementskit-btn-link">Q1?</a><div class="elementskit-card-body">A1.</div></div>')}
      ${c(heading("h2", "Need Professional Help?") + heading("p", "Static") + button("Get Started", "#"))}
    `)}
    ${c(w("html", "Table of Contents") + w("shortcode", "10.5k"))}
  `)}
  ${c(w("author-box", '<div class="elementor-author-box__name">Dr. Jane Doe</div><a class="elementor-author-box__button" href="https://scholarlyhelp.com/blog/author/janedoe123/">View</a>'))}
  ${c(w("posts", "Recent"))}
  ${c(heading("h2", "Final CTA") + w("text-editor", "<p>Final text</p>") + button("Take My Class", "https://scholarlyhelp.com/online-class/"))}
</div></body></html>`;

describe("convertPostPage", () => {
  const r = convertPostPage(page);

  it("extracts header video, CTAs, author and views", () => {
    expect(r.heroVideoUrl).toBe("https://www.youtube.com/watch?v=abc123XYZ");
    expect(r.heroCta).toEqual({ heading: "Hero CTA", text: "Hero text", buttonLabel: "Go", buttonUrl: "https://scholarlyhelp.com/exams/" });
    expect(r.finalCta).toMatchObject({ heading: "Final CTA", buttonUrl: "https://scholarlyhelp.com/online-class/" });
    expect(r.author).toEqual({ name: "Dr. Jane Doe", wpSlug: "janedoe123" });
    expect(r.views).toBe(10500);
  });

  it("converts the article column into ordered blocks", () => {
    expect(r.blocks.map((b) => b.type)).toEqual(["richText", "richText", "featureGrid", "cta", "richText", "cta", "linkCards", "faq"]);
    // The intro is its own block so the template can place the featured image right after it.
    expect(String(r.blocks[0].html)).toContain("Intro paragraph.");
    expect(String(r.blocks[0].html)).not.toContain("Hidden");
    expect(String(r.blocks[1].html)).toContain("<h2>Section One</h2>");
    expect(r.blocks[2]).toMatchObject({ items: [{ icon: "clock", title: "Total Time", text: "130 minutes" }, { title: "Questions" }] });
    expect(r.blocks[3]).toMatchObject({ heading: "Mid CTA", text: "Mid text", buttonUrl: "https://scholarlyhelp.com/homework/" });
    expect(String(r.blocks[4].html)).toContain("<h2>Body Heading</h2>");
    expect(r.blocks[5]).toMatchObject({ heading: "Inline CTA", bullets: ["Point A", "Point B"], buttonLabel: "Essay Help" });
    expect(r.blocks[6]).toMatchObject({ items: [{ title: "Statistics Exam", url: "https://scholarlyhelp.com/exams/statistics/" }] });
    expect(r.blocks[7]).toEqual({ type: "faq", title: "Frequently Asked Questions", items: [{ question: "Q1?", answer: "A1." }] });
  });

  it("skips static template parts and reports them", () => {
    expect(r.warnings.some((w) => w.startsWith("skipped static stats strip"))).toBe(true);
    expect(r.warnings.some((w) => w.includes("Need Professional Help?"))).toBe(true);
    expect(JSON.stringify(r.blocks)).not.toContain("Success Rate");
  });

  it("keeps a header CTA whose button has no link, without the button", () => {
    const noLink = convertPostPage(page.replace('href="https://scholarlyhelp.com/exams/"><span>Go', "><span>Go"));
    expect(noLink.heroCta).toMatchObject({ heading: "Hero CTA", buttonUrl: "" });
    expect(noLink.warnings.some((w) => w.startsWith("header CTA button has no link"))).toBe(true);
  });
});
