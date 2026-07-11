export interface SecurityIssue {
  id: string;
  type: "Secret" | "Vulnerability" | "Misconfiguration" | "Dependency Risk" | "License Conflict";
  title: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  file: string;
  line: number;
  snippet?: string;
  cve?: string;
  recommendation: string;
  patchDiff?: string;
}

export interface SecurityScanResult {
  score: number;
  riskLevel: "Critical" | "High" | "Medium" | "Low" | "Secure";
  issues: SecurityIssue[];
  metrics: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  complianceStatus: {
    owasp: "Passed" | "Partial" | "Failed";
    soc2: "Passed" | "Partial" | "Failed";
    hipaa: "Passed" | "Partial" | "Failed";
  };
  lastScan: string;
  nextScan: string;
  licenseInfo: {
    repoLicense: string;
    conflicts: string[];
    gplDetected: boolean;
    commercialRisk: "High" | "Medium" | "Low";
    list: { name: string; license: string; type: string }[];
  };
  timeline: { date: string; event: string; severity: "Critical" | "High" | "Medium" | "Low" | "Info" }[];
}

export class AISecurityScanner {
  // Regex patterns for secrets scanning
  private static SECRET_PATTERNS = [
    { name: "GitHub Token", pattern: /\bghp_[a-zA-Z0-9]{36}\b/g, severity: "Critical" as const },
    { name: "Firebase API Key", pattern: /\bAIzaSy[a-zA-Z0-9-_]{33}\b/g, severity: "High" as const },
    { name: "AWS Access Key ID", pattern: /\bAKIA[0-9A-Z]{16}\b/g, severity: "High" as const },
    { name: "AWS Secret Access Key", pattern: /\b[a-zA-Z0-9+/]{40}\b/g, severity: "Critical" as const, verify: (s: string) => s.includes("secret") || s.includes("key") },
    { name: "OpenAI API Key", pattern: /\bsk-[a-zA-Z0-9]{48}\b/g, severity: "Critical" as const },
    { name: "JWT Secret Pattern", pattern: /jwt_secret|jwt-secret|jwtSecret\s*:\s*['"][a-zA-Z0-9-_]{16,}['"]/gi, severity: "High" as const },
    { name: "Database Password Pattern", pattern: /mongodb\+srv:\/\/|postgres:\/\/|mysql:\/\/|redis:\/\/.*:[a-zA-Z0-9]+@/gi, severity: "Critical" as const },
    { name: "Private SSH Key", pattern: /-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----/g, severity: "Critical" as const },
  ];

  // Heuristics for static code security vulnerabilities
  private static CODE_VULN_PATTERNS = [
    {
      id: "OWASP-SQLI",
      title: "SQL Injection Susceptibility",
      pattern: /(select|insert|update|delete).*from.*(\+.*\b\w+|`.*\${.*\b\w+.*`)/gi,
      description: "Direct SQL string concatenation detected. This is vulnerable to SQL injection if variables contain untrusted user inputs.",
      severity: "High" as const,
      recommendation: "Use parameterized queries or ORM sanitizers instead of direct string concatenations.",
      patchDiff: `@@ -12,3 +12,3 @@
- const query = "SELECT * FROM users WHERE name = '" + userName + "'";
+ const query = "SELECT * FROM users WHERE name = $1";
+ const result = await db.query(query, [userName]);`
    },
    {
      id: "OWASP-XSS",
      title: "Cross-Site Scripting (XSS)",
      pattern: /dangerouslySetInnerHTML\s*=\s*\{|document\.write\(|innerHTML\s*=/g,
      description: "Direct writing to HTML properties detected. This can lead to persistent or reflected Cross-Site Scripting (XSS) if data is unsanitized.",
      severity: "High" as const,
      recommendation: "Use secure text rendering mechanisms like textContent, render methods, or sanitizers.",
      patchDiff: `@@ -4,2 +4,2 @@
- <div dangerouslySetInnerHTML={{ __html: userInput }} />
+ <div>{userInput}</div>`
    },
    {
      id: "OWASP-INJ",
      title: "Arbitrary Code/Command Injection",
      pattern: /\beval\(|\bchild_process\.exec\(|\bexec\(/gi,
      description: "Usage of eval() or dynamic command execution shells detected. This presents a high risk of remote code execution if input parameters are not sanitized.",
      severity: "Critical" as const,
      recommendation: "Avoid eval and use structured parsing models like JSON.parse() or define whitelist parameters.",
      patchDiff: `@@ -2,2 +2,2 @@
- const obj = eval("(" + data + ")");
+ const obj = JSON.parse(data);`
    },
    {
      id: "OWASP-AUTH",
      title: "Weak Cryptographic Key / Hardcoded Secret",
      pattern: /(const|let|var)\s+(secret|password|key)\s*=\s*['"][a-zA-Z0-9!@#$%^&*()_+]{6,}['"]/gi,
      description: "Hardcoded secret, password, or encryption key declared directly inside file scopes.",
      severity: "High" as const,
      recommendation: "Move sensitive parameters and credentials into external environment configuration configurations.",
      patchDiff: `@@ -1,2 +1,2 @@
- const API_KEY = "AIzaSyBnPzEY2wOrbfby_8wf8LOHYVglzBQwv3o";
+ const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;`
    },
    {
      id: "OWASP-TRAV",
      title: "Path Traversal Risk",
      pattern: /fs\.(readFile|writeFile|createReadStream|createWriteStream).*?\b\w+?\b/gi,
      description: "Accessing filesystem paths directly using variables. User inputs could exploit dot-dot-slash (../) to read system files.",
      severity: "Medium" as const,
      recommendation: "Sanitize directory path resolve bounds using path.basename() or define whitelist resolvers.",
      patchDiff: `@@ -6,2 +6,3 @@
- const file = path.join(UPLOAD_DIR, filename);
+ const safeFilename = path.basename(filename);
+ const file = path.join(UPLOAD_DIR, safeFilename);`
    }
  ];

  // Heuristics for configuration file auditing
  private static CONFIG_AUDIT_PATTERNS = [
    {
      file: "Dockerfile",
      title: "Missing Non-Root User in Container configuration",
      pattern: /USER/gi,
      inverse: true, // triggers if pattern is MISSING
      description: "The Docker container executes as root. This allows container breakout vulnerabilities to access host scopes.",
      severity: "Medium" as const,
      recommendation: "Add a non-root USER directive inside your Dockerfile definition."
    },
    {
      file: "firestore.rules",
      title: "Insecure Firebase Authorization Rules",
      pattern: /allow\s+read,\s*write\s*:\s*if\s+true/g,
      description: "Firestore collection rules allow read and write permissions without requiring authentication.",
      severity: "Critical" as const,
      recommendation: "Require auth checks: e.g. allow read, write: if request.auth != null;"
    },
    {
      file: ".github/workflows",
      title: "Unsanitized GitHub Actions Shell inputs",
      pattern: /run\s*:\s*.*?github\.event\.inputs/g,
      description: "Referencing raw workflow event parameters directly in shell executions can allow command injection.",
      severity: "High" as const,
      recommendation: "Reference event parameters using environment variables instead of direct script substitution."
    }
  ];

  // ----------------------------------------------------
  // CORE RUNNER
  // ----------------------------------------------------
  static scanRepository(treePaths: string[], filesContent: Record<string, string>): SecurityScanResult {
    const issues: SecurityIssue[] = [];
    
    // Iterate over files to check contents
    Object.keys(filesContent).forEach(filePath => {
      const content = filesContent[filePath];
      const lines = content.split("\n");

      // 1. Secrets Scan
      this.SECRET_PATTERNS.forEach(rule => {
        let match;
        rule.pattern.lastIndex = 0;
        try {
          while ((match = rule.pattern.exec(content)) !== null) {
            const lineNum = content.substring(0, match.index).split("\n").length;
            const snippet = lines[lineNum - 1].trim();
            
            // Optional custom verify function
            if (rule.verify && !rule.verify(snippet)) continue;

            issues.push({
              id: `SEC-SECRET-${rule.name.replace(/\s+/g, "").toUpperCase()}`,
              type: "Secret",
              title: `Leaked ${rule.name}`,
              description: `A credential pattern matching ${rule.name} was found exposed in the codebase.`,
              severity: rule.severity,
              file: filePath,
              line: lineNum,
              snippet,
              recommendation: "Revoke the leaked credential immediately, erase this line from Git history, and declare it in an ignored .env file."
            });
          }
        } catch (e) {}
      });

      // 2. Code Security Scan
      this.CODE_VULN_PATTERNS.forEach(rule => {
        let match;
        rule.pattern.lastIndex = 0;
        try {
          while ((match = rule.pattern.exec(content)) !== null) {
            const lineNum = content.substring(0, match.index).split("\n").length;
            const snippet = lines[lineNum - 1].trim();

            issues.push({
              id: rule.id,
              type: "Vulnerability",
              title: rule.title,
              description: rule.description,
              severity: rule.severity,
              file: filePath,
              line: lineNum,
              snippet,
              recommendation: rule.recommendation,
              patchDiff: rule.patchDiff
            });
          }
        } catch (e) {}
      });

      // 3. Configurations Scan (specific file name matches)
      this.CONFIG_AUDIT_PATTERNS.forEach(rule => {
        const matchesFile = filePath.toLowerCase().includes(rule.file.toLowerCase());
        if (matchesFile) {
          const matched = rule.pattern.test(content);
          // If we expect the pattern to NOT exist (e.g. missing USER directive)
          if (rule.inverse ? !matched : matched) {
            issues.push({
              id: `CFG-AUDIT-${rule.title.replace(/\s+/g, "").toUpperCase()}`,
              type: "Misconfiguration",
              title: rule.title,
              description: rule.description,
              severity: rule.severity,
              file: filePath,
              line: 1,
              recommendation: rule.recommendation
            });
          }
        }
      });
    });

    // Check for missing Docker USER rule if Dockerfile exists in tree but wasn't scanned
    if (treePaths.some(p => p.toLowerCase().includes("dockerfile")) && !Object.keys(filesContent).some(k => k.toLowerCase().includes("dockerfile"))) {
      issues.push({
        id: "CFG-AUDIT-MISSING-USER",
        type: "Misconfiguration",
        title: "Missing Non-Root User in Container configuration",
        description: "Dockerfile exists in repository files, but no non-root USER instruction was identified. The container executes as root by default.",
        severity: "Medium",
        file: "Dockerfile",
        line: 1,
        recommendation: "Create a non-root system user inside your container configuration and set the active environment context: e.g. USER node"
      });
    }

    // 4. Dependency Vulnerabilities CVE Check
    let packageManager = "npm";
    let list: SecurityScanResult["licenseInfo"]["list"] = [];
    let repoLicense = "MIT";
    let outdatedCount = 0;

    const packageJsonContent = filesContent["package.json"];
    if (packageJsonContent) {
      try {
        const pkg = JSON.parse(packageJsonContent);
        repoLicense = pkg.license || "MIT";
        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        
        Object.keys(deps).forEach(name => {
          const ver = deps[name];
          let cve = "";
          let desc = "";
          let sev: SecurityIssue["severity"] = "Medium";

          if (name === "lodash" && ver.includes("4.17.") && parseInt(ver.split(".")[2]) < 21) {
            cve = "CVE-2020-8203";
            desc = "Prototype pollution vulnerability inside lodash.defaultsDeep allow remote variable overrides.";
            sev = "High";
          } else if (name === "axios" && ver.includes("1.") && parseInt(ver.split(".")[1]) < 6) {
            cve = "CVE-2023-45857";
            desc = "Server-Side Request Forgery (SSRF) vulnerability inside axios config parser.";
            sev = "High";
          } else if (name === "express" && parseInt(ver.split(".")[0]) === 4 && parseInt(ver.split(".")[1]) < 19) {
            cve = "CVE-2024-29025";
            desc = "Express open redirect vulnerabilities inside query parser configurations.";
            sev = "Medium";
          }

          if (cve) {
            outdatedCount++;
            issues.push({
              id: `DEP-CVE-${cve}`,
              type: "Dependency Risk",
              title: `Vulnerable Dependency: ${name}`,
              description: desc,
              severity: sev,
              file: "package.json",
              line: packageJsonContent.split(name)[0].split("\n").length,
              cve,
              recommendation: `Upgrade package '${name}' to safe version target (e.g. lodash >= 4.17.21).`
            });
          }

          // Compile license logs
          let type = "Permissive";
          let licName = "MIT";
          if (name.includes("react") || name.includes("next")) {
            licName = "MIT";
          } else if (name.includes("three")) {
            licName = "MIT";
          } else if (name.includes("framer-motion")) {
            licName = "MIT";
          } else if (name.includes("mysql")) {
            licName = "GPL-2.0";
            type = "Copyleft";
          }
          list.push({ name, license: licName, type });
        });
      } catch (e) {}
    }

    // Heuristic Score Calculation
    let score = 98;
    let crit = 0, high = 0, med = 0, low = 0;

    issues.forEach(iss => {
      if (iss.severity === "Critical") { score -= 18; crit++; }
      else if (iss.severity === "High") { score -= 12; high++; }
      else if (iss.severity === "Medium") { score -= 6; med++; }
      else { score -= 3; low++; }
    });

    score = Math.max(10, Math.min(100, Math.round(score)));
    const riskLevel: SecurityScanResult["riskLevel"] = score >= 90 ? "Secure" : score >= 75 ? "Low" : score >= 60 ? "Medium" : score >= 40 ? "High" : "Critical";

    // Licenses Audit
    const gplDetected = list.some(l => l.license.startsWith("GPL") || l.license.startsWith("AGPL"));
    const conflicts = gplDetected ? ["Conflict: Copyleft GPL license detected in dependencies. Commercial closed-source redistribution is blocked."] : [];
    const commercialRisk = gplDetected ? "High" : "Low";

    // Compliance Flags
    const owasp: SecurityScanResult["complianceStatus"]["owasp"] = high > 0 || crit > 0 ? "Failed" : med > 0 ? "Partial" : "Passed";
    const soc2: SecurityScanResult["complianceStatus"]["soc2"] = crit > 0 ? "Failed" : high > 0 || med > 0 ? "Partial" : "Passed";
    const hipaa: SecurityScanResult["complianceStatus"]["hipaa"] = crit > 0 || high > 0 ? "Failed" : med > 0 ? "Partial" : "Passed";

    // Simulated timelines
    const timeline: { date: string; event: string; severity: "Critical" | "High" | "Medium" | "Low" | "Info" }[] = [
      { date: "June 25", event: "Automated vulnerability check configured on main", severity: "Info" },
      { date: "June 28", event: "Resolved 2 dependency vulnerabilities (Axios CVE update)", severity: "Info" },
      { date: "July 04", event: "Completed compliance check: SOC2 Scope", severity: "Info" },
    ];
    if (issues.length > 0) {
      const highestSev = issues.some(i => i.severity === "Critical") 
        ? "Critical" as const
        : issues.some(i => i.severity === "High")
        ? "High" as const
        : "Medium" as const;
      timeline.push({
        date: "Today",
        event: `Security scanner identified ${issues.length} issues during repository push check.`,
        severity: highestSev
      });
    }

    return {
      score,
      riskLevel,
      issues,
      metrics: { critical: crit, high, medium: med, low },
      complianceStatus: { owasp, soc2, hipaa },
      lastScan: new Date().toLocaleString(),
      nextScan: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toLocaleDateString() + " at 04:00 AM",
      licenseInfo: {
        repoLicense,
        conflicts,
        gplDetected,
        commercialRisk,
        list
      },
      timeline
    };
  }

  // ----------------------------------------------------
  // AI SECURITY CHAT ASSISTANT RESPONSES
  // ----------------------------------------------------
  static getChatResponse(prompt: string, issues: SecurityIssue[], repoName?: string): string {
    const cleanPrompt = prompt.toLowerCase();

    if (cleanPrompt.includes("explain this vulnerability") || cleanPrompt.includes("explain vuln")) {
      const highIssue = issues.find(i => i.severity === "High" || i.severity === "Critical");
      if (highIssue) {
        return `### Vulnerability Explanations - **${highIssue.title}**

This repository contains a **${highIssue.title}** located inside \`${highIssue.file}\` at line ${highIssue.line}.

#### Attack Mechanism:
- **Severity**: **${highIssue.severity}**
- **OWASP Categorization**: Injection Flaw.
- **Risk Vectors**: Unfiltered variables are directly processed by critical operations. If an attacker passes malicious input payload, they can manipulate internal logic (e.g. database schemas, file queries, or run commands on the shell host).

#### Safer Remediation:
Do not trust client input strings directly. Use whitelists, sanitization functions, or parameterized API parameters to bypass raw execution contexts.`;
      }
      return "There are no Critical or High severity vulnerabilities detected in your active workspace scan to explain.";
    }

    if (cleanPrompt.includes("generate patch") || cleanPrompt.includes("generate secure code") || cleanPrompt.includes("fix this issue")) {
      const fixableIssue = issues.find(i => i.patchDiff);
      if (fixableIssue) {
        return `### Security Patch Diff - **${fixableIssue.title}**

Apply the following patch to fix the vulnerability in \`${fixableIssue.file}\`:

\`\`\`diff
${fixableIssue.patchDiff}
\`\`\`

#### Secure Code Example:
Use parameterized variable bindings to prevent input injection manipulation.

Would you like me to inspect this configuration logic further?`;
      }
      return "I didn't find any auto-fixable code vulnerability patterns with a predefined diff. Let me know which file you would like to refactor.";
    }

    if (cleanPrompt.includes("suggest best practices")) {
      return `### General Repository Security Best Practices

1. **Secret Scanning Guidelines**: Ensure '.env' is listed inside '.gitignore'. Avoid committing testing credentials or test API keys to GitHub.
2. **Package Auditing**: Run 'npm audit' regularly in CI/CD pipeline scopes to prevent supply chain exploits.
3. **Container Configurations**: Set active 'USER' contexts in Dockerfiles to block root execution.
4. **Firebase Policies**: Never configure 'allow write: if true' in public collection namespaces.`;
    }

    return `I am your **DevTrack Security AI Assistant**.

Scanned active repository: **${repoName || "Workspace"}**
Total Issues Exposing: **${issues.length} detected**

You can ask me to:
1. **"Explain this vulnerability"** to review details of a found issue.
2. **"Generate patch"** to generate copyable secure diff fixes.
3. **"Suggest best practices"** to review OWASP guidelines.

How can I secure your repository today?`;
  }
}
