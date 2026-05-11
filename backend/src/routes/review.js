const express = require("express");
const router = express.Router();

const { parseCode, detectLanguageFromExtension } = require("../services/astParser");
const { fetchGitHubFile } = require("../services/githubFetcher");
const { reviewCode } = require("../services/openaiService");

// ── Shared review pipeline ────────────────────────────────────────────────────
async function runReview(code, language) {
  // 1. Parse / validate — throws if >500 lines
  const ast = parseCode(code, language);

  // 2. Call OpenAI
  const result = await reviewCode(code, language || "unknown", ast.summary);

  return result;
}

// ── POST /api/review/code ─────────────────────────────────────────────────────
router.post("/code", async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return res.status(400).json({ error: "Request body must include a non-empty 'code' string." });
    }

    const lang = (language || "unknown").toLowerCase();
    const result = await runReview(code, lang);

    return res.json(result);
  } catch (err) {
    console.error("[/api/review/code]", err.message);

    // Surface validation errors as 400, everything else as 500
    const isValidation =
      err.message.includes("limit") ||
      err.message.includes("Invalid") ||
      err.message.includes("not set");

    return res.status(isValidation ? 400 : 500).json({ error: err.message });
  }
});

// ── POST /api/review/github ───────────────────────────────────────────────────
router.post("/github", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return res.status(400).json({ error: "Request body must include a non-empty 'url' string." });
    }

    // Fetch file from GitHub
    const { code, language, rawUrl } = await fetchGitHubFile(url);

    const result = await runReview(code, language);

    // Include the resolved raw URL for reference
    return res.json({ ...result, source_url: rawUrl });
  } catch (err) {
    console.error("[/api/review/github]", err.message);

    const isValidation =
      err.message.includes("Invalid") ||
      err.message.includes("not found") ||
      err.message.includes("denied") ||
      err.message.includes("limit");

    return res.status(isValidation ? 400 : 500).json({ error: err.message });
  }
});

module.exports = router;