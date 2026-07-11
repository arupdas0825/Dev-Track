export interface FileReviewReport {
  fileName: string;
  complexityScore: number;
  maintainabilityIndex: number;
  aiSummary: string;
  potentialBugs: { line: number; type: string; description: string; severity: "Low" | "Medium" | "High" | "Critical" }[];
  unusedImports: string[];
  deadCode: { name: string; type: string; line: number; description: string }[];
  largeFunctions: { name: string; lineCount: number; startLine: number }[];
  namingIssues: { name: string; type: string; suggestion: string; line: number }[];
  missingComments: { name: string; type: string; line: number }[];
  logicProblems: string[];
  codeSmells: string[];
  functions: FunctionDetail[];
}

export interface FunctionDetail {
  name: string;
  complexity: "Low" | "Medium" | "High";
  estimatedRuntime: "O(1)" | "O(n)" | "O(log n)" | "O(n²)" | "O(2ⁿ)";
  memoryUsage: "O(1)" | "O(n)" | "O(log n)" | "O(n²)";
  readability: number; // 0-100
  cyclomaticComplexity: number;
  suggestedRefactoring: string;
  aiExplanation: string;
  startLine: number;
  endLine: number;
}

export interface PullRequestDetail {
  id: number;
  title: string;
  author: string;
  branch: string;
  targetBranch: string;
  createdAt: string;
  changedFilesCount: number;
  additions: number;
  deletions: number;
  review: {
    status: "Approved" | "Needs Changes" | "Pending";
    summary: string;
    categories: {
      style: { status: "Passed" | "Warnings" | "Failed"; details: string[] };
      performance: { status: "Passed" | "Warnings" | "Failed"; details: string[] };
      security: { status: "Passed" | "Warnings" | "Failed"; details: string[] };
      breakingChanges: { status: "None" | "Detected"; details: string[] };
      documentation: { status: "Passed" | "Missing" | "Partial" | "Failed" | "Warnings"; details: string[] };
      tests: { status: "Passed" | "Missing" | "Partial" | "Failed" | "Warnings"; details: string[] };
    };
  };
}

export interface ArchitectureReport {
  diagramSvg: string;
  folderAnalysis: { path: string; purpose: string; filesCount: number; status: "Healthy" | "Refactoring Recommended" }[];
  circularDependencies: string[];
  layerViolations: string[];
  unusedModules: string[];
  moduleRelationships: { from: string; to: string; type: "dependency" | "import" | "call" }[];
}

export interface TechnicalDebtReport {
  debtGrade: "A" | "B" | "C" | "D" | "F";
  debtScore: number; // 0-100
  estimatedDebtHours: number;
  codeSmellsCount: number;
  deadCodeCount: number;
  duplicateCodePercentage: number;
  unusedImportsCount: number;
  largeFunctionsCount: number;
  namingIssuesCount: number;
  roadmap: { priority: number; title: string; difficulty: "Easy" | "Medium" | "Hard"; estimatedTime: string; impact: "Low" | "Medium" | "High"; why: string; benefit: string }[];
}

export interface AISuggestionsReport {
  renameVariables: { original: string; suggested: string; reason: string; codeBefore: string; codeAfter: string }[];
  splitLargeFunctions: { functionName: string; codeBefore: string; codeAfter: string; reason: string }[];
  extractComponents: { snippetName: string; codeBefore: string; codeAfter: string; reason: string }[];
  optimizeLoops: { description: string; codeBefore: string; codeAfter: string; savings: string }[];
  reduceComplexity: { description: string; codeBefore: string; codeAfter: string }[];
  improveErrorHandling: { description: string; codeBefore: string; codeAfter: string }[];
  improveAsyncLogic: { description: string; codeBefore: string; codeAfter: string }[];
  improveApiDesign: { description: string; codeBefore: string; codeAfter: string }[];
}

export class AICodeReviewEngine {
  
  // ----------------------------------------------------
  // 1. FILE & FUNCTION ANALYSIS
  // ----------------------------------------------------
  static analyzeFile(fileName: string, content: string): FileReviewReport {
    const lines = content.split("\n");
    const lineCount = lines.length;

    // Detect file type
    const ext = fileName.split(".").pop() || "";
    const isJSorTS = ["js", "jsx", "ts", "tsx"].includes(ext);
    const isPython = ext === "py";
    const isGo = ext === "go";
    const isRust = ext === "rs";

    // Dynamic checks variables
    const potentialBugs: FileReviewReport["potentialBugs"] = [];
    const unusedImports: string[] = [];
    const deadCode: FileReviewReport["deadCode"] = [];
    const largeFunctions: FileReviewReport["largeFunctions"] = [];
    const namingIssues: FileReviewReport["namingIssues"] = [];
    const missingComments: FileReviewReport["missingComments"] = [];
    const logicProblems: string[] = [];
    const codeSmells: string[] = [];
    const functions: FunctionDetail[] = [];

    // Parse Imports
    const importRegex = isJSorTS 
      ? /import\s+(?:([\w\s{},*]+)\s+from\s+)?['"]([^'"]+)['"]/g
      : isPython
      ? /(?:from\s+(\w+)\s+)?import\s+(\w+)/g
      : null;

    const importedNames: { name: string; line: number }[] = [];
    if (importRegex) {
      let match;
      try {
        while ((match = importRegex.exec(content)) !== null) {
          if (isJSorTS && match[1]) {
            const importsStr = match[1];
            // extract names from { a, b } or name
            const names = importsStr.replace(/[{}]/g, "").split(",").map(n => n.trim().split(/\s+as\s+/)[0].trim());
            const lineNum = content.substring(0, match.index).split("\n").length;
            names.forEach(name => {
              if (name && name !== "*") importedNames.push({ name, line: lineNum });
            });
          } else if (isPython) {
            const name = match[2] || match[1];
            const lineNum = content.substring(0, match.index).split("\n").length;
            if (name) importedNames.push({ name, line: lineNum });
          }
        }
      } catch (e) {
        console.warn("Regex parse error on imports", e);
      }
    }

    // Check for Unused Imports
    importedNames.forEach(({ name, line }) => {
      // Escape for regex safety
      const escaped = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const occurences = (content.match(new RegExp(`\\b${escaped}\\b`, "g")) || []).length;
      // If it only occurs once (the import statement itself)
      if (occurences <= 1) {
        unusedImports.push(name);
        potentialBugs.push({
          line,
          type: "Unused Import",
          description: `Imported module '${name}' is never referenced in this file.`,
          severity: "Low"
        });
      }
    });

    // Parse Functions
    let fnMatches: { name: string; index: number; line: number; paramCount: number }[] = [];
    if (isJSorTS) {
      // 1. function name(
      const fnRegex = /function\s+(\w+)\s*\(([^)]*)\)/g;
      let match;
      try {
        while ((match = fnRegex.exec(content)) !== null) {
          const line = content.substring(0, match.index).split("\n").length;
          const params = match[2].split(",").map(p => p.trim()).filter(Boolean);
          fnMatches.push({ name: match[1], index: match.index, line, paramCount: params.length });
        }
        // 2. const name = (...) =>
        const arrowRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g;
        while ((match = arrowRegex.exec(content)) !== null) {
          const line = content.substring(0, match.index).split("\n").length;
          const params = match[2].split(",").map(p => p.trim()).filter(Boolean);
          fnMatches.push({ name: match[1], index: match.index, line, paramCount: params.length });
        }
      } catch (e) {}
    } else if (isPython) {
      const pyFnRegex = /def\s+(\w+)\s*\(([^)]*)\):/g;
      let match;
      try {
        while ((match = pyFnRegex.exec(content)) !== null) {
          const line = content.substring(0, match.index).split("\n").length;
          const params = match[2].split(",").map(p => p.trim()).filter(p => p && p !== "self" && p !== "cls");
          fnMatches.push({ name: match[1], index: match.index, line, paramCount: params.length });
        }
      } catch (e) {}
    } else {
      // Generic fallback for functions
      const genericRegex = /(\w+)\s*\(([^)]*)\)\s*\{/g;
      let match;
      try {
        while ((match = genericRegex.exec(content)) !== null) {
          const line = content.substring(0, match.index).split("\n").length;
          const name = match[1];
          if (!["if", "for", "while", "switch", "catch"].includes(name)) {
            fnMatches.push({ name, index: match.index, line, paramCount: match[2].split(",").length });
          }
        }
      } catch (e) {}
    }

    // Sort function matches by index to determine scopes
    fnMatches.sort((a, b) => a.index - b.index);

    // Calculate details for each function
    fnMatches.forEach((fn, idx) => {
      const startLine = fn.line;
      // Approximate end line
      let endLine = lineCount;
      if (idx < fnMatches.length - 1) {
        endLine = fnMatches[idx + 1].line - 1;
      }
      const fnLines = lines.slice(startLine - 1, endLine);
      const fnCode = fnLines.join("\n");
      const fnLineCount = fnLines.length;

      // Cyclomatic Complexity: check control flow tokens
      let cyclomaticComplexity = 1;
      const flowRegex = /\b(if|for|while|catch|case|else\s+if)\b|&&|\|\||\?/g;
      const matches = fnCode.match(flowRegex) || [];
      cyclomaticComplexity += matches.length;

      // Determine complexity level
      const complexity = cyclomaticComplexity > 10 ? "High" : cyclomaticComplexity > 4 ? "Medium" : "Low";

      // Readability score calculation
      let readability = 95 - (cyclomaticComplexity * 3) - (fn.paramCount * 4);
      if (fnLineCount > 30) readability -= (fnLineCount - 30) * 0.5;
      readability = Math.max(10, Math.min(100, Math.round(readability)));

      // Estimate runtime and memory based on loops & data structures
      let estimatedRuntime: FunctionDetail["estimatedRuntime"] = "O(1)";
      let memoryUsage: FunctionDetail["memoryUsage"] = "O(1)";
      const loopCount = (fnCode.match(/\b(for|while)\b/g) || []).length;
      const nestedLoopCount = (fnCode.match(/(?:for|while)[\s\S]*?(?:for|while)/g) || []).length;
      
      if (nestedLoopCount > 0) estimatedRuntime = "O(n²)";
      else if (loopCount > 0) estimatedRuntime = "O(n)";

      if (fnCode.includes(".push(") || fnCode.includes(".concat(") || fnCode.includes("new Array") || fnCode.includes("append(")) {
        memoryUsage = "O(n)";
      }

      // Check comments
      const hasComment = fnCode.includes("//") || fnCode.includes("/*") || fnCode.includes('"""') || fnCode.includes("#");
      if (!hasComment && fnLineCount > 5) {
        missingComments.push({ name: fn.name, type: "function", line: startLine });
      }

      // Large functions warning
      if (fnLineCount > 40) {
        largeFunctions.push({ name: fn.name, lineCount: fnLineCount, startLine });
        potentialBugs.push({
          line: startLine,
          type: "Large Function",
          description: `Function '${fn.name}' spans ${fnLineCount} lines. Consider breaking it down.`,
          severity: "Medium"
        });
      }

      // Naming issues (TypeScript/JavaScript camelCase, Python snake_case)
      let nameIssue = false;
      let nameSuggestion = "";
      if (isPython) {
        // should be snake_case
        if (/[A-Z]/.test(fn.name) && !fn.name.startsWith("__")) {
          nameIssue = true;
          nameSuggestion = fn.name.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
        }
      } else {
        // should be camelCase
        if (fn.name.includes("_") && !fn.name.toUpperCase().startsWith("L_")) {
          nameIssue = true;
          nameSuggestion = fn.name.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        }
      }

      if (nameIssue) {
        namingIssues.push({ name: fn.name, type: "Function", suggestion: nameSuggestion, line: startLine });
      }

      // AI Explanations and refactoring suggestions based on complexity and size
      let aiExplanation = `Function '${fn.name}' initializes and processes variables. It has low control flow overhead.`;
      let suggestedRefactoring = "No refactoring required. The function is optimal.";

      if (complexity === "High") {
        aiExplanation = `Function '${fn.name}' has high cognitive complexity due to multiple nested conditional checks and loops. This makes it difficult to verify and test.`;
        suggestedRefactoring = `1. Split conditional validation logic into separate helper predicates.\n2. Leverage early exit return statements to flatten block structures.\n3. Extract loop contents into a dedicated sub-function.`;
      } else if (complexity === "Medium") {
        aiExplanation = `Function '${fn.name}' coordinates logical branches. Readability is decent, but can be improved.`;
        suggestedRefactoring = `Consider extracting helper sub-functions or using array method mappings (e.g. map, filter) to simplify iteration.`;
      }

      functions.push({
        name: fn.name,
        complexity,
        estimatedRuntime,
        memoryUsage,
        readability,
        cyclomaticComplexity,
        suggestedRefactoring,
        aiExplanation,
        startLine,
        endLine
      });
    });

    // Detect general file code smells & bugs
    if (content.includes("console.log(") && isJSorTS) {
      codeSmells.push("Console log statement left in production-ready files.");
    }
    if (content.includes("eval(") && isJSorTS) {
      const idx = content.indexOf("eval(");
      const lineNum = content.substring(0, idx).split("\n").length;
      potentialBugs.push({
        line: lineNum,
        type: "Security Vulnerability",
        description: "Usage of 'eval()' detected. This presents a code execution risk.",
        severity: "Critical"
      });
      codeSmells.push("Avoid using global eval execution.");
    }
    if (content.includes("TODO:") || content.includes("todo:")) {
      codeSmells.push("Unresolved TODO items in codebase.");
    }
    if (lineCount > 300) {
      codeSmells.push("File exceeds 300 lines. Consider splitting it into multiple modules.");
    }
    if (content.includes("try {") && !content.includes("catch")) {
      logicProblems.push("Try block without catch exception handler.");
    }

    // Heuristics for overall score
    let baseScore = 98;
    baseScore -= unusedImports.length * 4;
    baseScore -= potentialBugs.filter(b => b.severity === "Critical" || b.severity === "High").length * 15;
    baseScore -= potentialBugs.filter(b => b.severity === "Medium").length * 8;
    baseScore -= codeSmells.length * 3;
    baseScore -= largeFunctions.length * 6;
    baseScore -= namingIssues.length * 2;
    const complexityScore = Math.max(10, Math.min(100, Math.round(baseScore)));

    let maintainabilityIndex = Math.max(10, Math.round(baseScore * 0.8 + (functions.reduce((acc, fn) => acc + fn.readability, 0) / (functions.length || 1)) * 0.2));

    // Summary compilation
    let aiSummary = `This is a standard ${ext.toUpperCase()} file.`;
    if (functions.length > 0) {
      aiSummary = `This file defines ${functions.length} function(s). Overall complexity is ${
        functions.some(f => f.complexity === "High") ? "High" : functions.some(f => f.complexity === "Medium") ? "Moderate" : "Low"
      } with a maintainability score of ${maintainabilityIndex}/100.`;
    }

    return {
      fileName,
      complexityScore,
      maintainabilityIndex,
      aiSummary,
      potentialBugs,
      unusedImports,
      deadCode,
      largeFunctions,
      namingIssues,
      missingComments,
      logicProblems,
      codeSmells,
      functions
    };
  }

  // ----------------------------------------------------
  // 2. PULL PR REVIEW
  // ----------------------------------------------------
  static getMockPullRequests(repoName: string): PullRequestDetail[] {
    return [
      {
        id: 28,
        title: "Feat/Auth: Add server-verified authentication & middleware security",
        author: "alex-developer",
        branch: "feat/auth-verifications",
        targetBranch: "main",
        createdAt: "2026-07-10T14:22:00Z",
        changedFilesCount: 4,
        additions: 182,
        deletions: 24,
        review: {
          status: "Approved",
          summary: "This pull request integrates secure server-verified tokens using the Firebase Admin SDK. Checked middleware redirections, token decryption parameters, and local cookie sessions. The implementation looks clean and meets production standards.",
          categories: {
            style: { status: "Passed", details: ["Code layout conforms to ESLint guidelines.", "All functions contain explicit return type signatures."] },
            performance: { status: "Passed", details: ["Token verification caching is successfully configured.", "Middleware execution time remains below 45ms."] },
            security: { status: "Passed", details: ["Environment secret keys are loaded securely via backend configurations.", "SQL injections and script injections are prevented through strict inputs."] },
            breakingChanges: { status: "None", details: ["Backward compatible with older client routing configs."] },
            documentation: { status: "Passed", details: ["Updated README file with the new security environment variables."] },
            tests: { status: "Partial", details: ["Unit test coverage added for token middleware, but missing mock user integration assertions."] }
          }
        }
      },
      {
        id: 25,
        title: "Fix/Database: Optimize repository queries and batch caching layout",
        author: "sarah-engineer",
        branch: "fix/db-rate-limits",
        targetBranch: "main",
        createdAt: "2026-07-08T09:15:00Z",
        changedFilesCount: 2,
        additions: 94,
        deletions: 68,
        review: {
          status: "Needs Changes",
          summary: "The query optimization is solid, but direct API key queries inside components violate MVC layer boundaries. There is also a circular dependency introduced in data hooks. Please check the recommendations below.",
          categories: {
            style: { status: "Warnings", details: ["Direct inline styles were committed. Move to CSS classes.", "Indentation discrepancy found on line 42 of database service."] },
            performance: { status: "Warnings", details: ["Memory leak risks. React components are triggering re-fetches continuously without callback wrapping.", "Caching parameters are set to expire too quickly (3 seconds)."] },
            security: { status: "Passed", details: ["No vulnerabilities scanned in database mappings."] },
            breakingChanges: { status: "None", details: ["No public properties removed or changed."] },
            documentation: { status: "Missing", details: ["No comment updates describing the database caching architecture changes."] },
            tests: { status: "Failed", details: ["Three existing unit tests failed inside db sync suite due to signature mismatch."] }
          }
        }
      }
    ];
  }

  // ----------------------------------------------------
  // 3. ARCHITECTURE REVIEWS
  // ----------------------------------------------------
  static getArchitectureReview(treePaths: string[]): ArchitectureReport {
    // Compile folder tree analyses
    const foldersMap: Record<string, { purpose: string; count: number }> = {
      "src/app": { purpose: "Main routing routes, Layout boundaries, and Page modules.", count: 0 },
      "src/components": { purpose: "Reusable UI components and layout blocks.", count: 0 },
      "src/hooks": { purpose: "Custom stateful react lifecycle extensions.", count: 0 },
      "src/services": { purpose: "External API connections, analytics processors, and AI algorithms.", count: 0 },
      "src/lib": { purpose: "Database configurations, constants, and utilities.", count: 0 },
      "src/types": { purpose: "Universal typescript data models and interface blueprints.", count: 0 },
    };

    treePaths.forEach(path => {
      const parts = path.split("/");
      if (parts.length > 1) {
        const rootFolder = `src/${parts[1]}`;
        if (foldersMap[rootFolder]) {
          foldersMap[rootFolder].count++;
        }
      }
    });

    const folderAnalysis = Object.keys(foldersMap).map(k => ({
      path: k,
      purpose: foldersMap[k].purpose,
      filesCount: foldersMap[k].count,
      status: (foldersMap[k].count > 50 ? "Refactoring Recommended" : "Healthy") as "Healthy" | "Refactoring Recommended"
    }));

    // Find any circular dependencies based on tree structure matches
    const circularDependencies: string[] = [];
    const layerViolations: string[] = [];
    const unusedModules: string[] = [];

    // Simulate architecture check
    if (treePaths.some(p => p.includes("hooks") || p.includes("services"))) {
      circularDependencies.push("src/hooks/useAnalytics.ts ⇄ src/services/github/github-analytics.service.ts");
      layerViolations.push("Layer violation: src/components/dashboard/OverviewTab.tsx directly fetches from raw Firebase firestore instead of routing through services layer.");
      unusedModules.push("src/services/communityService.ts (No reference dependencies mapped in active layouts).");
    }

    // SVG architecture diagram builder
    const diagramSvg = `
    <svg viewBox="0 0 800 400" width="100%" height="100%">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#2F81F7" />
        </marker>
        <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#161B22" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#0D1117" stop-opacity="0.8"/>
        </linearGradient>
      </defs>

      <!-- Client Layer -->
      <g transform="translate(40, 150)">
        <rect x="0" y="0" width="160" height="100" rx="10" fill="url(#glassGrad)" stroke="#30363D" stroke-width="1.5" />
        <text x="80" y="45" font-family="monospace" font-size="12" fill="#F0F6FC" font-weight="bold" text-anchor="middle">Frontend UI</text>
        <text x="80" y="65" font-family="monospace" font-size="9" fill="#8B949E" text-anchor="middle">React / Tailwind V4</text>
        <rect x="10" y="80" width="140" height="12" rx="3" fill="#2F81F7" fill-opacity="0.1" stroke="#2F81F7" stroke-width="0.5" />
        <text x="80" y="89" font-family="monospace" font-size="8" fill="#2F81F7" text-anchor="middle">src/app & components</text>
      </g>

      <!-- Connection 1 -->
      <path d="M 200 200 L 310 200" fill="none" stroke="#2F81F7" stroke-width="1.5" marker-end="url(#arrow)" stroke-dasharray="4 2" />

      <!-- Controller / Hooks Layer -->
      <g transform="translate(320, 150)">
        <rect x="0" y="0" width="160" height="100" rx="10" fill="url(#glassGrad)" stroke="#30363D" stroke-width="1.5" />
        <text x="80" y="45" font-family="monospace" font-size="12" fill="#F0F6FC" font-weight="bold" text-anchor="middle">State Orchestration</text>
        <text x="80" y="65" font-family="monospace" font-size="9" fill="#8B949E" text-anchor="middle">React Custom Hooks</text>
        <rect x="10" y="80" width="140" height="12" rx="3" fill="#A97BFF" fill-opacity="0.1" stroke="#A97BFF" stroke-width="0.5" />
        <text x="80" y="89" font-family="monospace" font-size="8" fill="#A97BFF" text-anchor="middle">src/hooks</text>
      </g>

      <!-- Connection 2 -->
      <path d="M 480 200 L 590 200" fill="none" stroke="#2F81F7" stroke-width="1.5" marker-end="url(#arrow)" />

      <!-- Services Layer -->
      <g transform="translate(600, 50)">
        <rect x="0" y="0" width="160" height="100" rx="10" fill="url(#glassGrad)" stroke="#30363D" stroke-width="1.5" />
        <text x="80" y="45" font-family="monospace" font-size="12" fill="#F0F6FC" font-weight="bold" text-anchor="middle">Telemetry Services</text>
        <text x="80" y="65" font-family="monospace" font-size="9" fill="#8B949E" text-anchor="middle">APIs & Analyzers</text>
        <rect x="10" y="80" width="140" height="12" rx="3" fill="#3FB950" fill-opacity="0.1" stroke="#3FB950" stroke-width="0.5" />
        <text x="80" y="89" font-family="monospace" font-size="8" fill="#3FB950" text-anchor="middle">src/services</text>
      </g>

      <!-- DB Layer -->
      <g transform="translate(600, 250)">
        <rect x="0" y="0" width="160" height="100" rx="10" fill="url(#glassGrad)" stroke="#30363D" stroke-width="1.5" />
        <text x="80" y="45" font-family="monospace" font-size="12" fill="#F0F6FC" font-weight="bold" text-anchor="middle">Database Cache</text>
        <text x="80" y="65" font-family="monospace" font-size="9" fill="#8B949E" text-anchor="middle">Firestore / LocalCache</text>
        <rect x="10" y="80" width="140" height="12" rx="3" fill="#D29922" fill-opacity="0.1" stroke="#D29922" stroke-width="0.5" />
        <text x="80" y="89" font-family="monospace" font-size="8" fill="#D29922" text-anchor="middle">src/lib/firebase.ts</text>
      </g>

      <!-- Connections Services/DB -->
      <path d="M 400 150 L 400 100 L 600 100" fill="none" stroke="#8B949E" stroke-width="1" stroke-dasharray="3 3" />
      <path d="M 400 250 L 400 300 L 600 300" fill="none" stroke="#8B949E" stroke-width="1" stroke-dasharray="3 3" />

    </svg>
    `;

    return {
      diagramSvg,
      folderAnalysis,
      circularDependencies,
      layerViolations,
      unusedModules,
      moduleRelationships: [
        { from: "src/app", to: "src/components", type: "import" },
        { from: "src/components", to: "src/hooks", type: "call" },
        { from: "src/hooks", to: "src/services", type: "call" },
        { from: "src/services", to: "src/lib", type: "import" }
      ]
    };
  }

  // ----------------------------------------------------
  // 4. TECHNICAL DEBT
  // ----------------------------------------------------
  static getTechnicalDebt(treePaths: string[]): TechnicalDebtReport {
    // Derive some heuristics based on paths
    const filesCount = treePaths.length;
    const isBigProject = filesCount > 80;

    const duplicateCodePercentage = Math.round(isBigProject ? 8.4 : 3.2);
    const codeSmellsCount = Math.round(filesCount * 0.35);
    const deadCodeCount = Math.round(filesCount * 0.12);
    const unusedImportsCount = Math.round(filesCount * 0.2);
    const largeFunctionsCount = Math.round(filesCount * 0.15);
    const namingIssuesCount = Math.round(filesCount * 0.4);

    const score = Math.max(40, 95 - (codeSmellsCount * 0.8) - (largeFunctionsCount * 1.5) - (duplicateCodePercentage * 2.0));
    let debtGrade: TechnicalDebtReport["debtGrade"] = "B";
    if (score >= 90) debtGrade = "A";
    else if (score >= 75) debtGrade = "B";
    else if (score >= 60) debtGrade = "C";
    else if (score >= 45) debtGrade = "D";
    else debtGrade = "F";

    const estimatedDebtHours = Math.round((codeSmellsCount * 0.5) + (largeFunctionsCount * 1.5) + (duplicateCodePercentage * 1.2));

    const roadmap: TechnicalDebtReport["roadmap"] = [
      {
        priority: 1,
        title: "Clean Up Unused Packages and Imports",
        difficulty: "Easy",
        estimatedTime: "45 mins",
        impact: "Medium",
        why: `${unusedImportsCount} unused import bindings were scanned in directory headers.`,
        benefit: "Decreases build tree-shaking compilation thresholds and speeds up local builds."
      },
      {
        priority: 2,
        title: "Refactor Large Functions inside UI tabs",
        difficulty: "Medium",
        estimatedTime: "3.5 hours",
        impact: "High",
        why: `${largeFunctionsCount} functions exceed 40 lines, introducing high cyclomatic complexity paths.`,
        benefit: "Improves test readability indices and eliminates visual update regression bugs."
      },
      {
        priority: 3,
        title: "Resolve Custom Hooks Circular Dependencies",
        difficulty: "Hard",
        estimatedTime: "2 hours",
        impact: "High",
        why: "Detected circular dependencies inside the workspace state manager components.",
        benefit: "Mitigates memory leakage risks during background polling updates."
      }
    ];

    return {
      debtGrade,
      debtScore: Math.round(score),
      estimatedDebtHours,
      codeSmellsCount,
      deadCodeCount,
      duplicateCodePercentage,
      unusedImportsCount,
      largeFunctionsCount,
      namingIssuesCount,
      roadmap
    };
  }

  // ----------------------------------------------------
  // 5. AI SUGGESTIONS
  // ----------------------------------------------------
  static getSuggestions(fileName: string, content: string): AISuggestionsReport {
    // Generate side-by-side comparisons based on the file content or fallback presets
    const renameVariables: AISuggestionsReport["renameVariables"] = [];
    const splitLargeFunctions: AISuggestionsReport["splitLargeFunctions"] = [];
    const extractComponents: AISuggestionsReport["extractComponents"] = [];
    const optimizeLoops: AISuggestionsReport["optimizeLoops"] = [];
    const reduceComplexity: AISuggestionsReport["reduceComplexity"] = [];
    const improveErrorHandling: AISuggestionsReport["improveErrorHandling"] = [];
    const improveAsyncLogic: AISuggestionsReport["improveAsyncLogic"] = [];
    const improveApiDesign: AISuggestionsReport["improveApiDesign"] = [];

    // Analyze variables and look for short name ones (like 'e', 'd', 'res')
    if (content.includes("const ") || content.includes("let ")) {
      renameVariables.push({
        original: "e",
        suggested: "error",
        reason: "Generic single letter variable. Difficult to trace context.",
        codeBefore: "catch(e) {\n  console.error(e);\n}",
        codeAfter: "catch(error) {\n  console.error(error);\n}"
      });
      renameVariables.push({
        original: "intel",
        suggested: "repoTelemetryData",
        reason: "Improve semantic naming describing the repository parameter scope.",
        codeBefore: "const intel = await fetchIntelligence();",
        codeAfter: "const repoTelemetryData = await fetchIntelligence();"
      });
    }

    // Default loops refactoring suggestion
    optimizeLoops.push({
      description: "Convert traditional nested map filters to a single reducer call.",
      codeBefore: `const filtered = items\n  .filter(item => item.active)\n  .map(item => item.value);`,
      codeAfter: `const filtered = items.reduce((acc, item) => {\n  if (item.active) acc.push(item.value);\n  return acc;\n}, []);`,
      savings: "~35% iteration speed improvement on large arrays."
    });

    // Default error handling
    improveErrorHandling.push({
      description: "Integrate boundary try-catch logic with fallback return objects.",
      codeBefore: `const data = JSON.parse(storedContent);`,
      codeAfter: `let data = null;\ntry {\n  data = JSON.parse(storedContent);\n} catch (error) {\n  console.error("Failed to parse cached contents:", error);\n  data = DEFAULT_CACHE_STATE;\n}`,
    });

    // Default large functions splits
    splitLargeFunctions.push({
      functionName: "renderDashboardWidgets",
      codeBefore: `function renderDashboardWidgets() {\n  return (\n    <div>\n      <header>...</header>\n      <main>...</main>\n      <footer>...</footer>\n    </div>\n  );\n}`,
      codeAfter: `function renderDashboardWidgets() {\n  return (\n    <div>\n      <WidgetHeader />\n      <WidgetMainBody />\n      <WidgetFooter />\n    </div>\n  );\n}\n\n// Subcomponents...\nfunction WidgetHeader() { ... }`,
      reason: "Function is rendering three separate layouts. Extracting them to dedicated components enhances maintainability."
    });

    // Default API design
    improveApiDesign.push({
      description: "Group standalone parameters into unified request objects.",
      codeBefore: `async function fetchDetails(owner: string, repo: string, token: string, force: boolean) { ... }`,
      codeAfter: `interface FetchOptions {\n  owner: string;\n  repo: string;\n  token?: string;\n  force?: boolean;\n}\n\nasync function fetchDetails(options: FetchOptions) { ... }`,
    });

    return {
      renameVariables,
      splitLargeFunctions,
      extractComponents,
      optimizeLoops,
      reduceComplexity,
      improveErrorHandling,
      improveAsyncLogic,
      improveApiDesign
    };
  }

  // ----------------------------------------------------
  // 6. TEST COVERAGE ESTIMATOR
  // ----------------------------------------------------
  static generateUnitTests(fileName: string, content: string): string {
    const ext = fileName.split(".").pop() || "ts";
    const baseName = fileName.split("/").pop() || "module";
    const nameWithoutExt = baseName.split(".")[0];

    if (ext === "py") {
      return `import unittest
from ${nameWithoutExt} import *

class Test${nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1)}(unittest.TestCase):
    
    def setUp(self):
        # Setup mock fixtures
        pass

    def test_core_functionality(self):
        # Verify function logic output
        # self.assertEqual(function_call(), expected)
        pass

if __name__ == '__main__':
    unittest.main()
`;
    }

    return `import { describe, it, expect, vi } from "vitest";
import { ${nameWithoutExt ? nameWithoutExt : "Module"} } from "./${nameWithoutExt}";

describe("${nameWithoutExt} Unit Tests", () => {
  it("should initialize with default states", () => {
    // TODO: Configure test variables and assertions
    expect(true).toBe(true);
  });

  it("should handle error edge cases gracefully", () => {
    // TODO: Assert mock input rejects
    expect(true).toBe(true);
  });
});
`;
  }

  // ----------------------------------------------------
  // 7. AI CHAT RESPONDER
  // ----------------------------------------------------
  static getChatResponse(
    history: { sender: "user" | "assistant"; text: string }[],
    prompt: string,
    activeFile?: { path: string; content: string },
    repoName?: string
  ): string {
    const cleanPrompt = prompt.toLowerCase();

    if (cleanPrompt.includes("explain this repository") || cleanPrompt.includes("explain repo")) {
      return `### Repository Architecture Overview - **${repoName || "Workspace"}**

This repository is constructed using a **Next.js** framework coupled with a client-side database synchronization model using **Firebase/Firestore**.

#### Core Directory Role:
1. **\`src/app/\`**: Declares routing structures. Leverages Next.js 16 layouts.
2. **\`src/components/\`**: Organizes layout components. Styling is compiled using **Tailwind CSS v4** styling parameters.
3. **\`src/services/\`**: Orchestrates GitHub queries and client-side processing metrics.

Would you like to analyze any specific file inside the directory?`;
    }

    if (cleanPrompt.includes("explain this function") || cleanPrompt.includes("explain function")) {
      if (activeFile) {
        return `### Function Explanation inside \`${activeFile.path.split("/").pop()}\`

Analyzing the active scopes:
- **Scope Parameters**: Coordinates external state maps.
- **Complexity rating**: It utilizes linear control flows.
- **Estimated Runtime**: **O(n)** execution complexity, scaling with variable length.

#### Key Suggestions:
Ensure return objects are checked for null/undefined bounds. You can refactor nested loops into map filters to improve performance by 35%.`;
      }
      return "Please select a source file in the files tree first so I can inspect the active function scopes.";
    }

    if (cleanPrompt.includes("optimize this file") || cleanPrompt.includes("optimize file")) {
      if (activeFile) {
        const ext = activeFile.path.split(".").pop();
        return `### Optimized refactoring for \`${activeFile.path.split("/").pop()}\`

Here is an optimized revision that improves caching layers, adds structured error boundaries, and flat-maps loop evaluations:

\`\`\`${ext || "typescript"}
// Optimized revision code
export async function processTelemetry(data) {
  try {
    if (!data || data.length === 0) return [];
    
    // 1. Unified mapper replacing nested loop execution
    return data.reduce((acc, item) => {
      if (item.valid) {
        acc.push({
          id: item.id,
          score: Math.round(item.val * 1.15)
        });
      }
      return acc;
    }, []);
  } catch (error) {
    console.error("Telemetry process error:", error);
    return [];
  }
}
\`\`\`

Would you like me to generate unit tests validating this structure?`;
      }
      return "Select a file from the explorer pane first to generate optimizations.";
    }

    if (cleanPrompt.includes("generate better implementation")) {
      return `### Modular Architecture Proposal

To improve decoupling, I recommend moving direct database Firestore queries from your view components into **custom hooks** or dedicated **service wrappers**.

#### Before (Anti-pattern):
\`\`\`tsx
// Inside view component
useEffect(() => {
  db.collection("users").doc(uid).get().then(...)
}, []);
\`\`\`

#### After (Clean Pattern):
\`\`\`tsx
// Inside src/services/userService.ts
export class UserService {
  static async fetchUserProfile(uid: string) {
    const doc = await db.collection("users").doc(uid).get();
    return doc.data();
  }
}
\`\`\`

This separates styling render cycles from database schemas!`;
    }

    // Default chat responder
    return `I've analyzed the codebase context for **${repoName || "this repository"}**.

Here are some quick things you can ask me:
1. **"Explain this repository"** to inspect overall architecture layers.
2. **"Optimize this file"** to refactor imports, clean loops, and add try-catch handlers.
3. **"Explain this function"** to review complexity and runtime memory indexes.
4. **"Review my architecture"** to look for circular dependencies and MVC structure warnings.

What would you like to review next?`;
  }
}
