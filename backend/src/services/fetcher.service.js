import axios from "axios";
import { AppError } from "../utils/AppError.js";

class FetcherService {
  /**
   * Fetches content based on the submission format.
   * @param {string} format - "github", "url", or "document"
   * @param {string} content - The actual URL or text content
   * @returns {Promise<string>} - The aggregated text content for AI to read
   */
  async fetchSubmissionContent(format, content) {
    try {
      if (format === "document") {
        return content; // Raw text submitted directly
      }

      if (format === "url") {
        return await this._fetchHtmlContent(content);
      }

      if (format === "github") {
        return await this._fetchGithubRepo(content);
      }

      return content;
    } catch (error) {
      console.error("[FetcherService] Failed to fetch content:", error.message);
      // Return a string indicating fetch failure so the AI knows, but doesn't crash the pipeline
      return `[SYSTEM NOTE: Failed to fetch external content from ${content}. Reason: ${error.message}. Please evaluate based on available metadata or flag for review.]`;
    }
  }

  async _fetchHtmlContent(url) {
    console.log(`[FetcherService] Fetching HTML from ${url}`);
    const response = await axios.get(url, { timeout: 10000 });
    // Naive text extraction (strip scripts and styles)
    let html = response.data.toString();
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
    // Extract body if possible
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const coreContent = bodyMatch ? bodyMatch[1] : html;
    // Strip HTML tags to save tokens, keep it simple
    const textContent = coreContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return `URL Content Preview:\n${textContent.substring(0, 15000)}`; // limit to 15k chars
  }

  async _fetchGithubRepo(repoUrl) {
    console.log(`[FetcherService] Fetching Github Repo from ${repoUrl}`);
    // Extract owner and repo from https://github.com/owner/repo
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error("Invalid GitHub URL format");

    const owner = match[1];
    let repo = match[2];
    repo = repo.replace(".git", "");

    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "LMS-AI-Evaluator"
    };

    // If a token exists, use it to avoid rate limits
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // 1. Fetch repo tree (recursively up to a limit) to find key files
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
    let treeResponse;
    try {
      treeResponse = await axios.get(treeUrl, { headers, timeout: 8000 });
    } catch (err) {
      // Fallback to master if main doesn't exist
      if (err.response && err.response.status === 404) {
        const masterUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`;
        treeResponse = await axios.get(masterUrl, { headers, timeout: 8000 });
      } else {
        throw err;
      }
    }

    const tree = treeResponse.data.tree;
    
    // 2. Filter for interesting files (code, config, readme), exclude node_modules, dist, build, etc.
    const fileExtensions = [".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".json", ".md", ".py"];
    const excludePaths = ["node_modules", "dist", "build", "coverage", ".git", "package-lock.json"];
    
    const interestingFiles = tree.filter(item => {
      if (item.type !== "blob") return false;
      if (excludePaths.some(ex => item.path.includes(ex))) return false;
      if (fileExtensions.some(ext => item.path.endsWith(ext))) return true;
      return false;
    });

    // Prioritize README, package.json, and main src files
    interestingFiles.sort((a, b) => {
      const aScore = a.path.toLowerCase().includes("readme") ? 100 : a.path.includes("src/") ? 50 : 0;
      const bScore = b.path.toLowerCase().includes("readme") ? 100 : b.path.includes("src/") ? 50 : 0;
      return bScore - aScore;
    });

    // Take top 10 files to avoid massive payloads
    const filesToFetch = interestingFiles.slice(0, 10);
    
    let aggregatedContent = `Repository: ${owner}/${repo}\n\n`;

    // 3. Fetch raw content for these files
    await Promise.all(filesToFetch.map(async (file) => {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${file.path}`;
        const rawRes = await axios.get(rawUrl, { timeout: 5000 });
        let content = typeof rawRes.data === 'string' ? rawRes.data : JSON.stringify(rawRes.data, null, 2);
        
        // Truncate huge files
        if (content.length > 10000) {
          content = content.substring(0, 10000) + "\n...[TRUNCATED]...";
        }

        aggregatedContent += `--- FILE: ${file.path} ---\n${content}\n\n`;
      } catch (err) {
        aggregatedContent += `--- FILE: ${file.path} ---\n[Failed to fetch content]\n\n`;
      }
    }));

    return aggregatedContent;
  }
}

export default new FetcherService();
