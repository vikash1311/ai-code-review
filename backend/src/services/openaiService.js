const OpenAI = require("openai");

let _client = null;

function getClient() {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set.");
    }
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return _client;
}

function buildSystemPrompt() {
  return `You are an expert senior code reviewer. Analyze the provided code and return a JSON response ONLY — no markdown fences, no prose outside JSON.

Return EXACTLY this structure:
{
  "overall_score": <integer 0-100>,
  "bugs": [{ "severity": "Critical|Warning|Suggestion", "description": "...", "line": "...", "fix": "..." }],
  "security": [{ "severity": "Critical|Warning|Suggestion", "description": "...", "line": "...", "fix": "..." }],
  "complexity": [{ "severity": "Critical|Warning|Suggestion", "description": "...", "line": "...", "fix": "..." }],
  "style": [{ "severity": "Critical|Warning|Suggestion", "description": "...", "line": "...", "fix": "..." }]
}

Rules:
- overall_score: 0-100 integer.
- Each array may be empty [] if no issues.
- "line" should reference exact line numbers where possible.
- "fix" should be a short actionable code snippet.
- Be language-aware and specific.`;
}

function buildUserPrompt(language, astSummary, code) {
  return `Language: ${language}
AST Summary: ${astSummary}

Code:
\`\`\`${language}
${code}
\`\`\``;
}

function extractJson(raw) {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenceMatch ? fenceMatch[1].trim() : raw.trim();
  try {
    return JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`Failed to parse response as JSON. Raw:\n${raw.slice(0, 300)}`);
  }
}

function normaliseReview(parsed, language) {
  const ensure = (val) => (Array.isArray(val) ? val : []);
  return {
    language,
    overall_score: Number.isInteger(parsed.overall_score)
      ? Math.min(100, Math.max(0, parsed.overall_score))
      : 50,
    bugs: ensure(parsed.bugs),
    security: ensure(parsed.security),
    complexity: ensure(parsed.complexity),
    style: ensure(parsed.style),
  };
}

async function reviewCode(code, language, astSummary) {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    max_tokens: 2048,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user",   content: buildUserPrompt(language, astSummary, code) },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  if (!raw) throw new Error("Groq returned an empty response.");

  const parsed = extractJson(raw);
  return normaliseReview(parsed, language);
}

module.exports = { reviewCode };