import { API_BASE, SITE_URL } from "./config.js";

const CONFIDENCE_TEXT = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence: check this one yourself",
};

const elements = {
  connect: document.getElementById("connect"),
  scan: document.getElementById("scan"),
  clear: document.getElementById("clear"),
  status: document.getElementById("status"),
  upgrade: document.getElementById("upgrade"),
  results: document.getElementById("results"),
  template: document.getElementById("question-template"),
};

let session = null;
let questions = [];

function setStatus(message) {
  elements.status.textContent = message;
}

function questionKey(question) {
  return question.question.toLowerCase().replace(/\s+/g, " ").trim();
}

function renderAccount() {
  elements.connect.hidden = Boolean(session);
  elements.scan.hidden = !session;
}

// Screen content is untrusted, so it only ever reaches the page as textContent.
function renderQuestion(question) {
  const node = elements.template.content.cloneNode(true);
  node.querySelector(".question-text").textContent = question.question;

  const options = node.querySelector(".options");
  for (const option of question.options) {
    const item = document.createElement("li");
    item.textContent = `${option.label}. ${option.text}`;
    if (question.answer_labels.includes(option.label)) {
      item.className = "correct";
    }
    options.append(item);
  }

  node.querySelector(".explanation").textContent = question.explanation;
  const confidence = node.querySelector(".confidence");
  confidence.textContent = CONFIDENCE_TEXT[question.confidence];
  confidence.classList.add(question.confidence);
  return node;
}

function renderQuestions() {
  elements.results.replaceChildren(...questions.map(renderQuestion));
  elements.clear.hidden = questions.length === 0;
}

function addQuestions(found) {
  const known = new Map(questions.map((question) => [questionKey(question), question]));
  const fresh = [];
  for (const question of found) {
    const existing = known.get(questionKey(question));
    if (!existing) {
      fresh.push(question);
    } else if (question.options.length > existing.options.length) {
      // A question cut off by the screen edge can reappear complete after
      // scrolling, so a rescan that shows more options replaces the old answer.
      known.set(questionKey(question), question);
    }
  }
  questions = [...fresh, ...known.values()];
  chrome.storage.session.set({ questions });
  renderQuestions();
  return fresh.length;
}

async function captureScreen() {
  const { id: windowId } = await chrome.windows.getCurrent();
  const dataUrl = await chrome.tabs.captureVisibleTab(windowId, {
    format: "jpeg",
    quality: 80,
  });
  return (await fetch(dataUrl)).blob();
}

async function handleFailure(response) {
  const payload = await response.json().catch(() => ({}));

  if (response.status === 401) {
    await chrome.storage.session.remove("session");
    setStatus("Your login expired. Connect your account again.");
  } else if (
    payload.code === "FREE_RUN_LIMIT_EXCEEDED" ||
    payload.code === "INSUFFICIENT_CREDITS"
  ) {
    elements.upgrade.href = `${SITE_URL}/tools/account/`;
    elements.upgrade.hidden = false;
    setStatus(payload.message || "You've reached your plan's limit.");
  } else {
    setStatus(payload.message || "The scan failed. Please try again.");
  }
}

async function scan() {
  // Must run first, while the click still counts as a user gesture. It only
  // shows a prompt the first time.
  const granted = await chrome.permissions.request({
    origins: ["<all_urls>"],
  });
  if (!granted) {
    setStatus("Chrome needs permission to see your screen before it can scan.");
    return;
  }

  elements.scan.disabled = true;
  elements.upgrade.hidden = true;
  setStatus("Reading your screen...");
  try {
    const formData = new FormData();
    formData.append("image", await captureScreen(), "screen.jpg");
    const response = await fetch(`${API_BASE}/tools/mcq-solver/scan`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.accessToken}` },
      body: formData,
    });
    if (!response.ok) {
      await handleFailure(response);
      return;
    }

    const { data } = await response.json();
    const found = data.questions;
    if (found.length === 0) {
      setStatus("No complete multiple-choice questions found on this screen.");
      return;
    }
    const added = addQuestions(found);
    setStatus(
      added === found.length
        ? `Found ${found.length} question(s).`
        : `Found ${found.length} question(s), ${added} new.`,
    );
  } catch {
    setStatus(
      "Could not scan this screen. Chrome blocks its own pages, so try it on the quiz tab.",
    );
  } finally {
    elements.scan.disabled = false;
  }
}

elements.connect.addEventListener("click", () => {
  chrome.tabs.create({
    url: `${SITE_URL}/tools/mcq-practice/connect/`,
  });
});

elements.scan.addEventListener("click", scan);

elements.clear.addEventListener("click", () => {
  questions = [];
  chrome.storage.session.remove("questions");
  renderQuestions();
  setStatus("");
});

chrome.storage.session.onChanged.addListener((changes) => {
  if (!changes.session) return;
  session = changes.session.newValue ?? null;
  renderAccount();
  if (session) setStatus("Connected. Open your practice quiz and scan.");
});

chrome.storage.session.get(["session", "questions"]).then((stored) => {
  session = stored.session ?? null;
  questions = stored.questions ?? [];
  renderAccount();
  renderQuestions();
});
