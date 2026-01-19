import puppeteer from "puppeteer";

const scrapeArticleDetails = async (page, url) => {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extract the article details
    const articleDetails = await page.evaluate(() => {
      const getText = (selector) =>
        document.querySelector(selector)?.innerText.trim() || null;

      const category = getText(".vXi2j");
      const title = getText("h1.IiRps");
      const author = getText(".contributor-name");
      const location = getText(".author-location");
      const publishedTime = getText("time span");
      const content = Array.from(
        document.querySelectorAll(".story-element.story-element-text p"),
      )
        .map((p) => p.innerText.trim())
        .join("\n");

      return { category, title, author, location, publishedTime, content };
    });

    return articleDetails;
  } catch (error) {
    console.error("Error scraping article:", error.message);
    return null;
  }
};

const scrap = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Navigate to the index page
    await page.goto("https://www.prothomalo.com/", {
      waitUntil: "networkidle2",
    });

    // Extract titles and links
    const newsList = await page.evaluate(() => {
      const articles = [];
      const seenLinks = new Set(); // Track links we've already added

      document.querySelectorAll("a.title-link").forEach((element) => {
        const title = element
          .querySelector(".tilte-no-link-parent")
          ?.innerText.trim();
        const link = element.href;

        // Only push if title/link exist AND the link hasn't been seen yet
        if (title && link && !seenLinks.has(link)) {
          articles.push({ title, link });
          seenLinks.add(link); // Mark this link as seen
        }
      });

      return articles;
    });

    console.log("Found articles:", newsList);

    // Loop through each link to get detailed content
    const detailedArticles = [];
    const totalArticles = newsList.length;

    for (let i = 0; i < totalArticles; i++) {
      const article = newsList[i];
      const details = await scrapeArticleDetails(page, article.link);
      if (details) {
        detailedArticles.push({
          ...article,
          details,
        });
      }

      // Update progress
      const progress = ((i + 1) / totalArticles) * 100; // Calculate progress percentage by dividing current index by total articles and multiplying by 100
      console.log(`Progress: ${progress.toFixed(2)}%`);
    }

    await browser.close();
    return detailedArticles;

    // Optionally close the browser
  } catch (e) {
    console.error("Error:", e);
  }
};

export default scrap;
// await scrap();
