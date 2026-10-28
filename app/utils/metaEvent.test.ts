import { afterEach, describe, expect, it, vi } from "vitest";
import { appendMetaLeadFields, metaEventFields, pushMetaEventId, signupMetaEventId } from "./metaEvent";

afterEach(() => vi.unstubAllGlobals());

describe("metaEventFields", () => {
  it("sends the event id with Meta's browser cookies", () => {
    vi.stubGlobal("document", { cookie: "a=1; _fbp=fb.1.111.222; _fbc=fb.1.333.IwAR%3D9" });

    expect(metaEventFields("e-1")).toEqual({
      meta_event_id: "e-1",
      fbp: "fb.1.111.222",
      fbc: "fb.1.333.IwAR=9",
    });
  });

  it("leaves the cookie fields out when Safari has cleared them", () => {
    vi.stubGlobal("document", { cookie: "x_fbp=nope" });

    expect(metaEventFields("e-1")).toEqual({ meta_event_id: "e-1" });
  });
});

describe("appendMetaLeadFields", () => {
  it("adds a fresh event id per lead", () => {
    vi.stubGlobal("document", { cookie: "_fbp=fb.1.111.222" });
    const fd = new FormData();

    const eventId = appendMetaLeadFields(fd);

    expect(eventId).toMatch(/^[0-9a-f-]{36}$/);
    expect(fd.get("meta_event_id")).toBe(eventId);
    expect(fd.get("fbp")).toBe("fb.1.111.222");
    expect(fd.has("fbc")).toBe(false);
    expect(appendMetaLeadFields(new FormData())).not.toBe(eventId);
  });
});

describe("event ids without crypto.randomUUID (older Safari, plain http)", () => {
  it("still produces distinct ids so the form can submit", () => {
    vi.stubGlobal("crypto", {});
    vi.stubGlobal("document", { cookie: "" });

    const first = appendMetaLeadFields(new FormData());
    const second = appendMetaLeadFields(new FormData());

    expect(first).toMatch(/^[0-9a-z]+-[0-9a-z]+$/);
    expect(first.length).toBeLessThanOrEqual(64);
    expect(second).not.toBe(first);
  });
});

describe("pushMetaEventId", () => {
  it("puts the id in the dataLayer as event_id", () => {
    const win: { dataLayer?: Array<Record<string, unknown>> } = {};
    vi.stubGlobal("window", win);

    pushMetaEventId("lead-1");

    expect(win.dataLayer).toEqual([{ event_id: "lead-1" }]);
  });
});

describe("signupMetaEventId", () => {
  it("keeps one id for the page load", () => {
    expect(signupMetaEventId()).toMatch(/^[0-9a-f-]{36}$/);
    expect(signupMetaEventId()).toBe(signupMetaEventId());
  });
});
