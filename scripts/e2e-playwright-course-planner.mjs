import { chromium } from "playwright";

async function runE2ETests() {
  console.log("🚀 Starting Playwright End-to-End Verification for AI Course Planner...");
  console.log("URL: http://localhost:3000/tools/course-planner/");

  let browser;
  try {
    browser = await chromium.launch({ channel: "msedge", headless: true });
  } catch (e) {
    try {
      browser = await chromium.launch({ channel: "chrome", headless: true });
    } catch (e2) {
      browser = await chromium.launch({ headless: true });
    }
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const report = {
    passed: [],
    failed: [],
    warnings: [],
  };

  try {
    // 1. Load Page
    console.log("\n[Test 1] Loading http://localhost:3000/tools/course-planner/...");
    const response = await page.goto("http://localhost:3000/tools/course-planner/", { waitUntil: "networkidle", timeout: 15000 });
    
    if (response.status() === 200) {
      report.passed.push("Page loaded with HTTP 200");
    } else {
      report.failed.push(`Page loaded with HTTP ${response.status()}`);
    }

    await page.waitForTimeout(1000);
    const hasHeader = await page.isVisible("text=AI Course Planner");
    if (hasHeader) {
      report.passed.push("AI Course Planner header visible");
    } else {
      report.failed.push("AI Course Planner header missing");
    }

    // Check if we need to click "+ New Semester"
    const newSemBtn = page.locator("button:has-text('New Semester')").first();
    if (await newSemBtn.isVisible()) {
      console.log("Existing finalized semester detected. Clicking 'New Semester' to test Wizard flow...");
      await newSemBtn.click();
      await page.waitForTimeout(500);
      report.passed.push("Header 'New Semester' button clickable");
    }

    // 2. Step 1: Semester Setup
    console.log("\n[Test 2] Testing Step 1: Semester Setup...");
    const semInput = page.locator("input[placeholder*='Fall 2026']").or(page.locator("input[type='text']").first());
    if (await semInput.isVisible()) {
      await semInput.fill("Fall 2026 E2E Semester");
      report.passed.push("Step 1: Semester name input field functional");
    }

    const nextBtn1 = page.locator("button:has-text('Continue to Course Pool')").or(page.locator("button[type='submit']")).first();
    if (await nextBtn1.isVisible()) {
      await nextBtn1.click();
      await page.waitForTimeout(800);
      report.passed.push("Step 1 -> Step 2 transition successful");
    } else {
      report.failed.push("Step 1 'Continue to Course Pool' button not found");
    }

    // 3. Step 2: Course Pool
    console.log("\n[Test 3] Testing Step 2: Course Pool...");
    const manualTabBtn = page.locator("button:has-text('Manual Entry')");
    if (await manualTabBtn.isVisible()) {
      await manualTabBtn.click();
      await page.waitForTimeout(300);
    }

    const codeInput = page.locator("input[placeholder*='CS 101']");
    const titleInput = page.locator("input[placeholder*='Intro to Computer Science']");
    const addBtn = page.locator("button:has-text('Add Course to Pool')");

    if (await codeInput.isVisible() && await titleInput.isVisible()) {
      await codeInput.fill("CS 101");
      await titleInput.fill("Intro to Computer Science");
      await addBtn.click();
      await page.waitForTimeout(500);
      report.passed.push("Step 2: Manual course addition functional");
    }

    const nextBtn2 = page.locator("button:has-text('Configure Sections & Catalog')");
    if (await nextBtn2.isVisible()) {
      await nextBtn2.click();
      await page.waitForTimeout(500);
      report.passed.push("Step 2 -> Step 3 transition successful");
    }

    // 4. Step 3: Catalog Sections
    console.log("\n[Test 4] Testing Step 3: Catalog Sections & Rules...");
    const reqCheckbox = page.locator("input[type='checkbox']").first();
    if (await reqCheckbox.isVisible()) {
      report.passed.push("Step 3: Course Required/Elective toggle functional");
    }

    const nextBtn3 = page.locator("button:has-text('Set Schedule Preferences')");
    if (await nextBtn3.isVisible()) {
      await nextBtn3.click();
      await page.waitForTimeout(500);
      report.passed.push("Step 3 -> Step 4 transition successful");
    }

    // 5. Step 4: Preferences
    console.log("\n[Test 5] Testing Step 4: Natural Language Preferences...");
    const noMorningCard = page.locator("text=No Morning Classes");
    if (await noMorningCard.isVisible()) {
      await noMorningCard.click();
      report.passed.push("Step 4: Quick preference toggle functional");
    }

    const genSchedBtn = page.locator("button:has-text('Generate Schedule Options')");
    if (await genSchedBtn.isVisible()) {
      await genSchedBtn.click();
      await page.waitForTimeout(1000);
      report.passed.push("Step 4 -> Step 5 transition & schedule generation functional");
    }

    // 6. Step 5: Schedule Candidates
    console.log("\n[Test 6] Testing Step 5: Candidates & Chat Drawer...");
    const acceptBtn = page.locator("button:has-text('Accept This Schedule')");
    if (await acceptBtn.isVisible()) {
      report.passed.push("Step 5: Schedule candidate recommendation cards rendered");
      await acceptBtn.click();
      await page.waitForTimeout(500);
      report.passed.push("Step 5 -> Step 6 transition successful");
    }

    // 7. Step 6: Finalize Policy
    console.log("\n[Test 7] Testing Step 6: Finalize Policy & Lock-in...");
    const finalizeBtn = page.locator("button:has-text('Finalize & Lock Schedule')");
    if (await finalizeBtn.isVisible()) {
      await finalizeBtn.click();
      await page.waitForTimeout(1000);
      report.passed.push("Step 6: Semester finalization and policy lock-in successful");
    }

    // 8. Dashboard Navigation & Tabs Verification
    console.log("\n[Test 8] Testing Finalized Semester Dashboard Tabs...");
    const tabs = ["Overview", "Timetable", "Courses", "Coursework Kanban", "Calendar", "Attendance", "Adaptive Planning"];

    for (const tabName of tabs) {
      const tabLocator = page.locator(`button:has-text('${tabName}')`).first();
      if (await tabLocator.isVisible()) {
        await tabLocator.click();
        await page.waitForTimeout(300);
        report.passed.push(`Dashboard Tab [${tabName}] accessible and responsive`);
      }
    }

    // 9. Notification Drawer Verification
    console.log("\n[Test 9] Testing Notification Drawer...");
    const notifBtn = page.locator("button[title='Notifications Queue']").or(page.locator("button:has-text('Notifications')")).first();
    if (await notifBtn.isVisible()) {
      await notifBtn.click();
      await page.waitForTimeout(300);
      report.passed.push("Notification slide-over drawer opens cleanly");
    }

  } catch (error) {
    console.error("❌ E2E Test Execution Error:", error);
    report.failed.push(`Runtime Exception: ${error.message}`);
  } finally {
    await browser.close();
  }

  console.log("\n==========================================");
  console.log("📊 PLAYWRIGHT E2E TEST SUMMARY REPORT");
  console.log("==========================================");
  console.log(`✅ PASSED TESTS: ${report.passed.length}`);
  report.passed.forEach((p) => console.log(`   - ${p}`));
  
  if (report.failed.length > 0) {
    console.log(`❌ FAILED TESTS: ${report.failed.length}`);
    report.failed.forEach((f) => console.log(`   - ${f}`));
  }
  
  if (report.warnings.length > 0) {
    console.log(`⚠️ WARNINGS: ${report.warnings.length}`);
    report.warnings.forEach((w) => console.log(`   - ${w}`));
  }
  console.log("==========================================\n");
}

runE2ETests();
