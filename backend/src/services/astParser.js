const acorn = require("acorn");

const MAX_LINES = 500;

// ── Language detection from extension ────────────────────────────────────────
const EXT_TO_LANG = {
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  java: "java",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  c: "c",
  cs: "csharp",
  go: "go",
  rb: "ruby",
  php: "php",
  rs: "rust",
  kt: "kotlin",
  swift: "swift",
  sh: "bash",
  yml: "yaml",
  yaml: "yaml",
  json: "json",
  html: "html",
  css: "css",
};

function detectLanguageFromExtension(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  return EXT_TO_LANG[ext] || "unknown";
}

// ── Line count validation ─────────────────────────────────────────────────────
function validateLineCount(code) {
  const lines = code.split("\n").length;
  if (lines > MAX_LINES) {
    throw new Error(
      `Code exceeds the ${MAX_LINES}-line limit (${lines} lines submitted). ` +
        `Please trim your code or submit a smaller snippet.`
    );
  }
  return lines;
}

// ── JS/TS AST parsing via acorn ───────────────────────────────────────────────
function parseJavaScript(code) {
  try {
    const ast = acorn.parse(code, {
      ecmaVersion: "latest",
      sourceType: "module",
      allowHashBang: true,
      allowAwaitOutsideFunction: true,
    });

    let functionCount = 0;
    let classCount = 0;
    let cyclomaticComplexity = 1; // base = 1

    // Recursive AST walker (no external dep needed for MVP)
    function walk(node) {
      if (!node || typeof node !== "object") return;

      switch (node.type) {
        case "FunctionDeclaration":
        case "FunctionExpression":
        case "ArrowFunctionExpression":
          functionCount++;
          break;
        case "ClassDeclaration":
        case "ClassExpression":
          classCount++;
          break;
        // Each of these adds a branch
        case "IfStatement":
        case "ConditionalExpression":
        case "SwitchCase":
        case "WhileStatement":
        case "DoWhileStatement":
        case "ForStatement":
        case "ForInStatement":
        case "ForOfStatement":
        case "CatchClause":
          cyclomaticComplexity++;
          break;
        case "LogicalExpression":
          // && and || each count as a branch
          if (node.operator === "&&" || node.operator === "||") {
            cyclomaticComplexity++;
          }
          break;
        default:
          break;
      }

      for (const key of Object.keys(node)) {
        if (key === "type") continue;
        const child = node[key];
        if (Array.isArray(child)) child.forEach(walk);
        else if (child && typeof child === "object" && child.type) walk(child);
      }
    }

    walk(ast);

    return { functionCount, classCount, cyclomaticComplexity, parseMethod: "acorn-ast" };
  } catch {
    // Acorn can fail on TS generics / decorators — fall through to regex
    return regexFallback(code);
  }
}

// ── Regex-based fallback for all languages ────────────────────────────────────
function regexFallback(code) {
  const functionPatterns = [
    /\bfunction\s+\w+\s*\(/g,           // JS/TS named function
    /\w+\s*=\s*(async\s+)?\(.*?\)\s*=>/g, // arrow functions
    /\bdef\s+\w+\s*\(/g,               // Python
    /\b(public|private|protected|static).*\w+\s*\([^)]*\)\s*\{/g, // Java/C#
    /\bfunc\s+\w+\s*\(/g,              // Go / Swift
    /\bfn\s+\w+\s*\(/g,               // Rust
    /\bsub\s+\w+/gi,                   // PHP/Ruby
  ];

  const classPatterns = [
    /\bclass\s+\w+/g,
    /\bstruct\s+\w+\s*\{/g,
    /\binterface\s+\w+/g,
    /\benum\s+\w+/g,
  ];

  const branchPatterns = [
    /\bif\b/g,
    /\belse\s+if\b/g,
    /\bcase\b/g,
    /\bwhile\b/g,
    /\bfor\b/g,
    /\bcatch\b/g,
    /&&|\|\|/g,
    /\?\s*[^:]/g, // ternary
  ];

  function countMatches(patterns) {
    return patterns.reduce((sum, p) => {
      const m = code.match(p);
      return sum + (m ? m.length : 0);
    }, 0);
  }

  return {
    functionCount: countMatches(functionPatterns),
    classCount: countMatches(classPatterns),
    cyclomaticComplexity: 1 + countMatches(branchPatterns),
    parseMethod: "regex-fallback",
  };
}

// ── Public API ────────────────────────────────────────────────────────────────
function parseCode(code, language) {
  const lineCount = validateLineCount(code);
  const lang = (language || "unknown").toLowerCase();

  let metrics;
  if (lang === "javascript" || lang === "typescript") {
    metrics = parseJavaScript(code);
  } else {
    metrics = regexFallback(code);
  }

  return {
    lineCount,
    ...metrics,
    summary:
      `${lineCount} lines | ` +
      `${metrics.functionCount} function(s) | ` +
      `${metrics.classCount} class/struct(s) | ` +
      `estimated cyclomatic complexity: ${metrics.cyclomaticComplexity} (${metrics.parseMethod})`,
  };
}

module.exports = { parseCode, detectLanguageFromExtension };