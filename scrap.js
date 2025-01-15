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
        document.querySelectorAll(".story-element.story-element-text p")
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

const scrap = async (res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
    });

    const page = await browser.newPage();

    await page.goto("https://www.prothomalo.com/", {
      waitUntil: "networkidle2",
    });

    const newsList = await page.evaluate(() => {
      const articles = [];
      document.querySelectorAll("a.title-link").forEach((element) => {
        const title = element
          .querySelector(".tilte-no-link-parent")
          ?.innerText.trim();
        const link = element.href;
        if (title && link) {
          articles.push({ title, link });
        }
      });
      return articles;
    });

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

      const progress = ((i + 1) / totalArticles) * 100;
      console.log(`Progress: ${progress.toFixed(2)}%`);

      // Send progress update
      res.write(`data: ${JSON.stringify({ progress, article })}\n\n`);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Send all collected data after completing the loop
    res.write(
      `data: ${JSON.stringify({ progress: 100, detailedArticles })}\n\n`
    );

    console.log(articles, "articles");

    // End the connection
    res.end();

    await browser.close();
  } catch (e) {
    console.error("Error:", e);
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
    res.end();
  }
};

export default scrap;
