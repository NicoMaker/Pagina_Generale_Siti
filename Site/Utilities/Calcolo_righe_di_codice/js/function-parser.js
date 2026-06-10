// ══════════════════════════════════════════════════════════════════
// FUNCTION PARSER  –  { lines } v4
// Detects named functions/methods/lambdas in 40+ languages.
// Returns: [{ name, startLine, endLine, lines, kind }]
// ══════════════════════════════════════════════════════════════════

/**
 * Entry point.  Dispatches to the right parser by file extension.
 * @param {string} content   Raw file text
 * @param {string} filename  e.g. "app.ts"
 * @returns {{ name:string, startLine:number, endLine:number, lines:number, kind:string }[]}
 */
function parseFunctions(content, filename) {
  const ext = filename.split(".").pop().toLowerCase();
  const rawLines = content.split("\n");

  // ── dispatch table ──────────────────────────────────────────────
  const JS_LIKE = [
    "js",
    "jsx",
    "mjs",
    "cjs",
    "es",
    "es6",
    "jsm",
    "ts",
    "tsx",
    "mts",
    "cts",
  ];
  const PY_LIKE = ["py", "pyw", "pyi", "pyx", "rpy", "py3", "pyde"];
  const RUBY_LIKE = [
    "rb",
    "rbw",
    "rake",
    "gemspec",
    "ru",
    "rbx",
    "rhtml",
    "rjs",
  ];
  const PHP_LIKE = [
    "php",
    "php3",
    "php4",
    "php5",
    "php7",
    "php8",
    "phtml",
    "phps",
  ];
  const JAVA_LIKE = ["java", "jav"];
  const KT_LIKE = ["kt", "kts"];
  const SCALA_LIKE = ["scala", "sc", "sbt"];
  const GROOVY_L = ["groovy", "gvy", "gy", "gsh"];
  const C_LIKE = [
    "c",
    "h",
    "cc",
    "cpp",
    "cxx",
    "c++",
    "hh",
    "hpp",
    "hxx",
    "h++",
    "cu",
    "cuh",
    "ino",
    "pde",
  ];
  const CS_LIKE = ["cs", "csx", "cshtml"];
  const GO_LIKE = ["go"];
  const RUST_LIKE = ["rs"];
  const SWIFT_LIKE = ["swift"];
  const DART_LIKE = ["dart"];
  const LUA_LIKE = ["lua", "luac", "luau"];
  const R_LIKE = ["r", "R", "rmd", "Rmd"];
  const JULIA_L = ["jl"];
  const ELIXIR_L = ["ex", "exs"];
  const ERLANG_L = ["erl", "hrl"];
  const HASKELL_L = ["hs", "lhs", "hsc"];
  const PERL_L = ["pl", "pm", "t", "cgi"];
  const SH_LIKE = ["sh", "bash", "zsh", "fish", "ksh", "csh"];
  const PS1_LIKE = ["ps1", "psm1", "psd1"];
  const VUE_LIKE = ["vue", "svelte"];

  if (JS_LIKE.includes(ext)) return parseJSTS(rawLines);
  if (PY_LIKE.includes(ext)) return parsePython(rawLines);
  if (RUBY_LIKE.includes(ext)) return parseRuby(rawLines);
  if (PHP_LIKE.includes(ext)) return parsePHP(rawLines);
  if (JAVA_LIKE.includes(ext)) return parseJavaLike(rawLines, "java");
  if (KT_LIKE.includes(ext)) return parseKotlin(rawLines);
  if (SCALA_LIKE.includes(ext)) return parseScala(rawLines);
  if (GROOVY_L.includes(ext)) return parseJavaLike(rawLines, "groovy");
  if (C_LIKE.includes(ext)) return parseCFamily(rawLines);
  if (CS_LIKE.includes(ext)) return parseCSharp(rawLines);
  if (GO_LIKE.includes(ext)) return parseGo(rawLines);
  if (RUST_LIKE.includes(ext)) return parseRust(rawLines);
  if (SWIFT_LIKE.includes(ext)) return parseSwift(rawLines);
  if (DART_LIKE.includes(ext)) return parseDart(rawLines);
  if (LUA_LIKE.includes(ext)) return parseLua(rawLines);
  if (R_LIKE.includes(ext)) return parseR(rawLines);
  if (JULIA_L.includes(ext)) return parseJulia(rawLines);
  if (ELIXIR_L.includes(ext)) return parseElixir(rawLines);
  if (ERLANG_L.includes(ext)) return parseErlang(rawLines);
  if (HASKELL_L.includes(ext)) return parseHaskell(rawLines);
  if (PERL_L.includes(ext)) return parsePerl(rawLines);
  if (SH_LIKE.includes(ext)) return parseShell(rawLines);
  if (PS1_LIKE.includes(ext)) return parsePowerShell(rawLines);
  if (VUE_LIKE.includes(ext)) return parseVueSvelte(rawLines, content);

  return []; // unknown
}

// ── UTILITIES ───────────────────────────────────────────────────────

/**
 * Scan for matching closing brace, handling nested braces/strings/comments.
 * Returns the 0-based line index of the closing brace, or -1.
 */
function findClosingBrace(lines, startIdx) {
  let depth = 0;
  let inStr = null;
  let inLineComment = false;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    inLineComment = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      const next = line[c + 1];

      if (inStr) {
        if (ch === "\\" && inStr !== "`") {
          c++;
          continue;
        }
        if (ch === inStr) inStr = null;
        continue;
      }
      if (inLineComment) break;

      if (ch === "/" && next === "/") {
        inLineComment = true;
        break;
      }
      if (ch === "/" && next === "*") {
        /* skip block */ c++;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        inStr = ch;
        continue;
      }
      if (ch === "{") depth++;
      if (ch === "}") {
        depth--;
        if (depth === 0) return i;
      }
    }
  }
  return -1;
}

/** Count non-empty, non-comment lines in a slice. */
function countSliceLines(lines, from, to) {
  let n = 0;
  for (let i = from; i <= to && i < lines.length; i++) {
    const t = lines[i].trim();
    if (
      t &&
      !t.startsWith("//") &&
      !t.startsWith("#") &&
      !t.startsWith("*") &&
      !t.startsWith("/*")
    )
      n++;
  }
  return n;
}

/** Build result entry. */
function entry(name, kind, startLine, endLine, lines) {
  return { name, kind, startLine, endLine, lines };
}

// ── JAVASCRIPT / TYPESCRIPT ─────────────────────────────────────────
// Handles: function declarations, function expressions, arrow functions,
// class methods, async/generator variants, object shorthand methods,
// export default function, TypeScript generics, etc.

function parseJSTS(lines) {
  const results = [];

  // Patterns ordered from most specific to least
  const PATTERNS = [
    // export default function name(...
    {
      re: /^\s*(?:export\s+default\s+)?(?:export\s+)?(?:async\s+)?function\s*\*?\s+(\w+)\s*[(<]/,
      kind: "function",
    },
    // const/let/var name = async? function(...
    {
      re: /^\s*(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function\s*\*?\s*[(<]/,
      kind: "function",
    },
    // const/let/var name = async? (...) =>
    {
      re: /^\s*(?:export\s+)?(?:const|let|var)\s+(\w+)\s*(?::\s*[\w<>\[\]|&, ]+)?\s*=\s*(?:async\s+)?(?:\([^)]*\)|[\w]+)\s*=>/,
      kind: "arrow",
    },
    // class method:  methodName(...) {   or   async methodName   or   static async   or   get/set name
    {
      re: /^\s*(?:(?:public|private|protected|static|async|override|readonly|abstract|get|set)\s+)*(\w+)\s*(?:<[^>]*>)?\s*\([^)]*\)\s*(?::\s*[\w<>\[\]|&, ]+\s*)?[{]/,
      kind: "method",
    },
    // export const name = (...) =>  (multi-line arrow start)
    {
      re: /^\s*(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(/,
      kind: "arrow",
    },
    // object method shorthand: name(...) {
    { re: /^\s*(\w+)\s*\([^)]*\)\s*\{/, kind: "method" },
  ];

  // Track class context for better naming
  let classStack = [];
  const classRe = /^\s*(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/;
  const classEndRe = /^\s*\}/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track classes (simple depth tracking)
    const cm = line.match(classRe);
    if (cm) classStack.push(cm[1]);

    let matched = false;
    for (const { re, kind } of PATTERNS) {
      const m = line.match(re);
      if (!m) continue;

      const name = m[1];
      if (
        !name ||
        /^(if|else|for|while|switch|catch|return|import|export|new|typeof|instanceof|void|delete|throw|case|do|in|of)$/.test(
          name,
        )
      )
        continue;

      // Find the opening brace (may be on same line or next few)
      let braceStart = i;
      let braceIdx = line.indexOf("{");
      if (braceIdx === -1) {
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          if (lines[j].includes("{")) {
            braceStart = j;
            break;
          }
          // arrow without braces (single expression) — estimate end as same line
          if (lines[j].trim() && !lines[j].includes("{")) {
            results.push(entry(name, kind, i + 1, i + 1, 1));
            matched = true;
            break;
          }
        }
        if (matched) break;
        if (braceStart === i) continue; // no brace found
      }

      const endIdx = findClosingBrace(lines, braceStart);
      if (endIdx === -1) continue;

      const lcount = countSliceLines(lines, i, endIdx);
      results.push(entry(name, kind, i + 1, endIdx + 1, lcount));
      matched = true;
      break;
    }
  }

  return results;
}

// ── PYTHON ──────────────────────────────────────────────────────────
function parsePython(lines) {
  const results = [];
  // def name( ...   or   async def name(
  const defRe = /^(\s*)(?:async\s+)?def\s+(\w+)\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(defRe);
    if (!m) continue;

    const indent = m[1].length;
    const name = m[2];
    const kind = indent === 0 ? "function" : "method";

    // Find end: next line with same-or-less indent that is not blank/comment
    let endIdx = i;
    for (let j = i + 1; j < lines.length; j++) {
      const t = lines[j];
      if (t.trim() === "" || t.trim().startsWith("#")) continue;
      const lineIndent = t.match(/^(\s*)/)[1].length;
      if (lineIndent <= indent) {
        endIdx = j - 1;
        break;
      }
      endIdx = j;
    }
    if (endIdx === i) endIdx = i; // single-line

    const lcount = countSliceLines(lines, i, endIdx);
    results.push(entry(name, kind, i + 1, endIdx + 1, lcount));
  }
  return results;
}

// ── RUBY ────────────────────────────────────────────────────────────
function parseRuby(lines) {
  const results = [];
  const defRe = /^\s*def\s+(self\.)?(\w+[\?!]?)/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(defRe);
    if (!m) continue;
    const name = (m[1] ? "self." : "") + m[2];
    const kind = m[1] ? "class_method" : "method";

    let depth = 1;
    let j = i + 1;
    for (; j < lines.length; j++) {
      const t = lines[j].trim();
      if (
        /^(def|class|module|do|begin|if|unless|while|until|for|case)\b/.test(t)
      )
        depth++;
      if (t === "end" || t.startsWith("end ") || t.startsWith("end#")) {
        depth--;
        if (depth === 0) break;
      }
    }
    const lcount = countSliceLines(lines, i, j);
    results.push(entry(name, kind, i + 1, j + 1, lcount));
  }
  return results;
}

// ── PHP ─────────────────────────────────────────────────────────────
function parsePHP(lines) {
  const results = [];
  const fnRe =
    /^\s*(?:(?:public|private|protected|static|abstract|final)\s+)*(?:async\s+)?function\s+(\w+)\s*\(/;
  const arrowRe =
    /^\s*(?:(?:const|public|private|protected|static)\s+)?(\w+)\s*=\s*(?:static\s+)?fn\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    let m = lines[i].match(fnRe) || lines[i].match(arrowRe);
    if (!m) continue;
    const name = m[1];
    const kind =
      lines[i].includes("fn ") && !lines[i].includes("function")
        ? "arrow"
        : "function";

    const endIdx = findClosingBrace(lines, i);
    if (endIdx === -1) continue;
    const lcount = countSliceLines(lines, i, endIdx);
    results.push(entry(name, kind, i + 1, endIdx + 1, lcount));
  }
  return results;
}

// ── JAVA / GROOVY ───────────────────────────────────────────────────
function parseJavaLike(lines, _lang) {
  const results = [];
  // method: modifiers returnType name(
  const re =
    /^\s*(?:(?:public|private|protected|static|final|abstract|synchronized|native|default|override|@\w+)\s+)*(?:<[\w,\s?]+>\s+)?(?:[\w<>\[\]]+\s+)+(\w+)\s*\([^)]*\)\s*(?:throws\s+[\w,\s]+)?\s*\{/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (!m) continue;
    const name = m[1];
    if (/^(if|for|while|switch|catch|try|do)$/.test(name)) continue;

    const endIdx = findClosingBrace(lines, i);
    if (endIdx === -1) continue;
    const lcount = countSliceLines(lines, i, endIdx);
    results.push(entry(name, "method", i + 1, endIdx + 1, lcount));
  }
  return results;
}

// ── KOTLIN ──────────────────────────────────────────────────────────
function parseKotlin(lines) {
  const results = [];
  const re =
    /^\s*(?:(?:override|suspend|private|public|protected|internal|open|abstract|tailrec|inline|operator|infix|external|actual|expect)\s+)*fun\s+(?:<[^>]*>\s*)?(\w+)\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (!m) continue;
    const name = m[1];

    let endIdx = findClosingBrace(lines, i);
    // single-expression fun = ...
    if (endIdx === -1) {
      endIdx = i;
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].trim().endsWith("=") || lines[j].includes("=")) {
          endIdx = j;
          break;
        }
      }
    }
    const lcount = countSliceLines(lines, i, endIdx);
    results.push(entry(name, "fun", i + 1, endIdx + 1, lcount));
  }
  return results;
}

// ── SCALA ───────────────────────────────────────────────────────────
function parseScala(lines) {
  const results = [];
  const re =
    /^\s*(?:(?:override|private|protected|implicit|abstract|final|lazy|sealed)\s+)*def\s+(\w+)\s*[([{]/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (!m) continue;
    const name = m[1];

    const endIdx = findClosingBrace(lines, i);
    if (endIdx === -1) {
      results.push(entry(name, "def", i + 1, i + 1, 1));
      continue;
    }
    const lcount = countSliceLines(lines, i, endIdx);
    results.push(entry(name, "def", i + 1, endIdx + 1, lcount));
  }
  return results;
}

// ── C / C++ ─────────────────────────────────────────────────────────
function parseCFamily(lines) {
  const results = [];
  // returnType name(...) {  — basic heuristic
  const re =
    /^(?![\s#\/\*])[\w:*&<>\[\]]+\s+[\w:~*&]+\s*\([^;]*\)\s*(?:const\s*)?(?:noexcept\s*)?(?:override\s*)?(?:final\s*)?\{?$/;
  const nameRe = /\b(\w+)\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!re.test(line)) continue;

    // Check next line is { if not already
    let braceLine = i;
    if (!line.includes("{")) {
      if (i + 1 < lines.length && lines[i + 1].trim() === "{")
        braceLine = i + 1;
      else continue;
    }

    const nm = line.match(nameRe);
    if (!nm) continue;
    const name = nm[1];
    if (/^(if|for|while|switch|catch|return|sizeof|typeof)$/.test(name))
      continue;

    const endIdx = findClosingBrace(lines, braceLine);
    if (endIdx === -1) continue;
    const lcount = countSliceLines(lines, i, endIdx);
    results.push(entry(name, "function", i + 1, endIdx + 1, lcount));
  }
  return results;
}

// ── C# ──────────────────────────────────────────────────────────────
function parseCSharp(lines) {
  const results = [];
  const re =
    /^\s*(?:(?:public|private|protected|internal|static|virtual|override|abstract|async|sealed|extern|partial|new|unsafe|readonly)\s+)*(?:[\w<>\[\],\s]+\s+)?(\w+)\s*(?:<[^>]*>)?\s*\([^)]*\)\s*(?:where\s+\w+[^{]*)?\{/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (!m) continue;
    const name = m[1];
    if (
      /^(if|for|while|switch|catch|try|do|using|namespace|class|struct|interface|enum)$/.test(
        name,
      )
    )
      continue;

    const endIdx = findClosingBrace(lines, i);
    if (endIdx === -1) continue;
    const lcount = countSliceLines(lines, i, endIdx);
    results.push(entry(name, "method", i + 1, endIdx + 1, lcount));
  }
  return results;
}

// ── GO ───────────────────────────────────────────────────────────────
function parseGo(lines) {
  const results = [];
  const re = /^\s*func\s+(?:\([^)]+\)\s*)?(\w+)\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (!m) continue;
    const name = m[1];

    let braceIdx = i;
    if (!lines[i].includes("{")) {
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].includes("{")) {
          braceIdx = j;
          break;
        }
      }
    }
    const endIdx = findClosingBrace(lines, braceIdx);
    if (endIdx === -1) continue;
    const lcount = countSliceLines(lines, i, endIdx);
    results.push(entry(name, "func", i + 1, endIdx + 1, lcount));
  }
  return results;
}

// ── RUST ─────────────────────────────────────────────────────────────
function parseRust(lines) {
  const results = [];
  const re =
    /^\s*(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?(?:unsafe\s+)?(?:extern\s+[^\s]+\s+)?fn\s+(\w+)\s*(?:<[^>]*>)?\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (!m) continue;
    const name = m[1];

    let braceIdx = i;
    if (!lines[i].includes("{")) {
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].includes("{")) {
          braceIdx = j;
          break;
        }
      }
    }
    const endIdx = findClosingBrace(lines, braceIdx);
    if (endIdx === -1) continue;
    const lcount = countSliceLines(lines, i, endIdx);
    results.push(entry(name, "fn", i + 1, endIdx + 1, lcount));
  }
  return results;
}

// ── SWIFT ────────────────────────────────────────────────────────────
function parseSwift(lines) {
  const results = [];
  const re =
    /^\s*(?:(?:public|private|internal|fileprivate|open|final|override|static|class|mutating|nonmutating|dynamic|required|convenience|lazy|weak|unowned|@\w+)\s+)*func\s+(\w+)\s*(?:<[^>]*>)?\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (!m) continue;
    const name = m[1];

    let braceIdx = i;
    if (!lines[i].includes("{")) {
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        if (lines[j].includes("{")) {
          braceIdx = j;
          break;
        }
      }
    }
    const endIdx = findClosingBrace(lines, braceIdx);
    if (endIdx === -1) continue;
    const lcount = countSliceLines(lines, i, endIdx);
    results.push(entry(name, "func", i + 1, endIdx + 1, lcount));
  }
  return results;
}

// ── DART ─────────────────────────────────────────────────────────────
function parseDart(lines) {
  const results = [];
  const re =
    /^\s*(?:(?:static|async|external|factory|get|set|abstract|const|final|late|required|covariant|@\w+)\s+)*(?:[\w<>\[\]?]+\s+)?(\w+)\s*(?:<[^>]*>)?\s*\([^)]*\)\s*(?:async\s*)?(?:sync\*\s*)?\{/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (!m) continue;
    const name = m[1];
    if (/^(if|for|while|switch|catch|try|do|class|abstract)$/.test(name))
      continue;

    const endIdx = findClosingBrace(lines, i);
    if (endIdx === -1) continue;
    const lcount = countSliceLines(lines, i, endIdx);
    results.push(entry(name, "method", i + 1, endIdx + 1, lcount));
  }
  return results;
}

// ── LUA ──────────────────────────────────────────────────────────────
function parseLua(lines) {
  const results = [];
  const re1 = /^\s*(?:local\s+)?function\s+([\w.:]+)\s*\(/;
  const re2 = /^\s*(?:local\s+)?([\w.]+)\s*=\s*function\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re1) || lines[i].match(re2);
    if (!m) continue;
    const name = m[1];

    let depth = 1;
    let j = i + 1;
    for (; j < lines.length; j++) {
      const t = lines[j].trim();
      if (/^(?:function|if|for|while|repeat|do)\b/.test(t)) depth++;
      if (/^end\b/.test(t)) {
        depth--;
        if (depth === 0) break;
      }
    }
    const lcount = countSliceLines(lines, i, j);
    results.push(entry(name, "function", i + 1, j + 1, lcount));
  }
  return results;
}

// ── R ────────────────────────────────────────────────────────────────
function parseR(lines) {
  const results = [];
  const re = /^\s*(\w+)\s*(?:<-|=)\s*function\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (!m) continue;
    const name = m[1];

    const endIdx = findClosingBrace(lines, i);
    if (endIdx === -1) continue;
    const lcount = countSliceLines(lines, i, endIdx);
    results.push(entry(name, "function", i + 1, endIdx + 1, lcount));
  }
  return results;
}

// ── JULIA ────────────────────────────────────────────────────────────
function parseJulia(lines) {
  const results = [];
  const re1 = /^\s*(?:function)\s+(\w+)\s*[({(]/;
  const re2 = /^\s*(\w+)\s*\(.*\)\s*=/; // short-form

  for (let i = 0; i < lines.length; i++) {
    let m = lines[i].match(re1);
    const isShort = !m && (m = lines[i].match(re2));
    if (!m) continue;
    const name = m[1];

    if (isShort) {
      results.push(entry(name, "function", i + 1, i + 1, 1));
      continue;
    }

    let depth = 1;
    let j = i + 1;
    for (; j < lines.length; j++) {
      const t = lines[j].trim();
      if (/^(function|if|for|while|try|let|begin|do)\b/.test(t)) depth++;
      if (/^end\b/.test(t)) {
        depth--;
        if (depth === 0) break;
      }
    }
    const lcount = countSliceLines(lines, i, j);
    results.push(entry(name, "function", i + 1, j + 1, lcount));
  }
  return results;
}

// ── ELIXIR ───────────────────────────────────────────────────────────
function parseElixir(lines) {
  const results = [];
  const re =
    /^\s*(?:def|defp|defmacro|defmacrop)\s+(\w+[\?!]?)\s*(?:\([^)]*\))?\s*do/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (!m) continue;
    const name = m[1];
    const kind = lines[i].includes("defp") ? "defp" : "def";

    let depth = 1;
    let j = i + 1;
    for (; j < lines.length; j++) {
      const t = lines[j].trim();
      if (/\bdo\b/.test(t) && !/\bdo:/.test(t)) depth++;
      if (/^end\b/.test(t)) {
        depth--;
        if (depth === 0) break;
      }
    }
    const lcount = countSliceLines(lines, i, j);
    results.push(entry(name, kind, i + 1, j + 1, lcount));
  }
  return results;
}

// ── ERLANG ───────────────────────────────────────────────────────────
function parseErlang(lines) {
  const results = [];
  const re = /^(\w+)\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("%") || lines[i].startsWith("-")) continue;
    const m = lines[i].match(re);
    if (!m) continue;
    const name = m[1];

    // Find next function or end of file
    let j = i + 1;
    for (; j < lines.length; j++) {
      const t = lines[j].trim();
      if (t.match(/^\w+\s*\(/) && !t.startsWith("%")) break;
    }
    const lcount = countSliceLines(lines, i, j - 1);
    results.push(entry(name, "function", i + 1, j, lcount));
  }
  return results;
}

// ── HASKELL ──────────────────────────────────────────────────────────
function parseHaskell(lines) {
  const results = [];
  // type signature: name :: ...
  // definition:     name args = ...
  const sigRe = /^(\w+)\s*::/;
  const defRe = /^(\w+)\s+[^=]*=/;
  const seen = new Set();

  for (let i = 0; i < lines.length; i++) {
    const sig = lines[i].match(sigRe);
    if (sig) {
      const name = sig[1];
      if (seen.has(name)) continue;
      seen.add(name);
      // find all clauses
      let last = i;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].match(new RegExp(`^${name}\\s`))) last = j;
        else if (
          lines[j].match(/^\w+\s/) &&
          !lines[j].match(new RegExp(`^${name}\\s`)) &&
          last > i
        )
          break;
      }
      const lcount = countSliceLines(lines, i, last);
      results.push(entry(name, "function", i + 1, last + 1, lcount));
    }
  }
  return results;
}

// ── PERL ─────────────────────────────────────────────────────────────
function parsePerl(lines) {
  const results = [];
  const re = /^\s*sub\s+(\w+)\s*\{?/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (!m) continue;
    const name = m[1];

    const endIdx = findClosingBrace(lines, i);
    if (endIdx === -1) continue;
    const lcount = countSliceLines(lines, i, endIdx);
    results.push(entry(name, "sub", i + 1, endIdx + 1, lcount));
  }
  return results;
}

// ── SHELL ────────────────────────────────────────────────────────────
function parseShell(lines) {
  const results = [];
  // POSIX: name() {  or  function name {  or  function name() {
  const re1 = /^\s*(\w+)\s*\(\s*\)\s*\{?/;
  const re2 = /^\s*function\s+(\w+)\s*(?:\(\s*\))?\s*\{?/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re2) || lines[i].match(re1);
    if (!m) continue;
    const name = m[1];
    if (/^(if|for|while|case|select|until)$/.test(name)) continue;

    let endIdx = i;
    let depth = 0;
    for (let j = i; j < lines.length; j++) {
      const t = lines[j].trim();
      for (const ch of t) {
        if (ch === "{") depth++;
        if (ch === "}") {
          depth--;
          if (depth === 0) {
            endIdx = j;
            break;
          }
        }
      }
      if (endIdx > i) break;
    }
    const lcount = countSliceLines(lines, i, endIdx);
    results.push(entry(name, "function", i + 1, endIdx + 1, lcount));
  }
  return results;
}

// ── POWERSHELL ───────────────────────────────────────────────────────
function parsePowerShell(lines) {
  const results = [];
  const re = /^\s*function\s+([\w-]+)\s*(?:\([^)]*\))?\s*\{?/i;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (!m) continue;
    const name = m[1];

    const endIdx = findClosingBrace(lines, i);
    if (endIdx === -1) continue;
    const lcount = countSliceLines(lines, i, endIdx);
    results.push(entry(name, "function", i + 1, endIdx + 1, lcount));
  }
  return results;
}

// ── VUE / SVELTE ─────────────────────────────────────────────────────
// Extract the <script> block then run JS/TS parser on it
function parseVueSvelte(lines, _content) {
  const scriptStart = lines.findIndex((l) => /<script/i.test(l));
  const scriptEnd = lines.findIndex((l) => /<\/script>/i.test(l));
  if (scriptStart === -1 || scriptEnd === -1) return [];

  const scriptLines = lines.slice(scriptStart + 1, scriptEnd);
  const results = parseJSTS(scriptLines);
  // Adjust line numbers back to file-level
  results.forEach((r) => {
    r.startLine += scriptStart + 1;
    r.endLine += scriptStart + 1;
  });
  return results;
}
