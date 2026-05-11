const axios = require("axios");
const { detectLanguageFromExtension } = require("./astParser");

/**
 * Converts a standard GitHub file URL to its raw.githubusercontent.com equivalent.
 *
 * Supported formats:
 *   https://github.com/{owner}/{repo}/blob/{branch}/{path}
 *   https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}  (already raw)
 */
function toRawUrl(githubUrl) {
  // Already a raw URL
  if (githubUrl.includes("raw.githubusercontent.com")) return githubUrl;

  // Match standard GitHub blob URL
  const match = githubUrl.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/
  );

  if (!match) {
    throw new Error(
      "Invalid GitHub URL. Expected format: " +
        "https://github.com/{owner}/{repo}/blob/{branch}/{filepath}"
    );
  }

  const [, owner, repo, branch, filePath] = match;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
}

/**
 * Fetches the source code from a GitHub file URL.
 * Returns { code: string, language: string, rawUrl: string }
 */
async function fetchGitHubFile(githubUrl) {
  const rawUrl = toRawUrl(githubUrl.trim());

  let response;
  try {
    response = await axios.get(rawUrl, {
      timeout: 15_000,
      // Treat as plain text regardless of server Content-Type
      responseType: "text",
      headers: { Accept: "text/plain" },
    });
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(
        "File not found on GitHub (404). Check that the URL, branch, and path are correct."
      );
    }
    if (err.response?.status === 403) {
      throw new Error(
        "Access denied by GitHub (403). The repository may be private."
      );
    }
    throw new Error(`Failed to fetch file from GitHub: ${err.message}`);
  }

  const code = typeof response.data === "string" ? response.data : String(response.data);

  // Infer language from file extension in the URL
  const filename = rawUrl.split("/").pop().split("?")[0];
  const language = detectLanguageFromExtension(filename);

  return { code, language, rawUrl };
}

module.exports = { fetchGitHubFile, toRawUrl };