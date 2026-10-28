import { afterEach, describe, expect, it, vi } from "vitest";
import { appendMetaLeadFields, pushQuoteLeadEvent } from "./metaLeadEvent";

afterEach(() => vi.unstubAllGlobals());

describe("appendMetaLeadFields", () => {
  it("adds a fresh event id and Meta's browser cookies", () => {
    vi.stubGlobal("document", { cookie: "a=1; _fbp=fb.1.111.222; _fbc=fb.1.333.IwAR%3D9" });
    const fd = new FormData();

    const eventId = appendMetaLeadFields(fd);

    expect(eventId).toMatch(/^[0-9a-f-]{36}$/);
    expect(fd.get("meta_event_id")).toBe(eventId);
    expect(fd.get("fbp")).toBe("fb.1.111.222");
    expect(fd.get("fbc")).toBe("fb.1.333.IwAR=9");
    expect(appendMetaLeadFields(new FormData())).not.toBe(eventId);
  });

  it("leaves the cookie fields out when Safari has cleared them", () => {
    vi.stubGlobal("document", { cookie: "x_fbp=nope" });
    const fd = new FormData();

    appendMetaLeadFields(fd);

    expect(fd.has("fbp")).toBe(false);
    expect(fd.has("fbc")).toBe(false);
  });
});

describe("pushQuoteLeadEvent", () => {
  it("pushes quote_lead with the same event id", () => {
    const win: { dataLayer?: Array<Record<string, unknown>> } = {};
    vi.stubGlobal("window", win);

    pushQuoteLeadEvent("lead-1");

    expect(win.dataLayer).toEqual([{ event: "quote_lead", event_id: "lead-1" }]);
  });
});
