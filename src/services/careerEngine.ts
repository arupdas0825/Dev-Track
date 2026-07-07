// DevTrack Career Suite Engine Client Service
// Integrates with HireSight-AI backend running on FastAPI (http://localhost:5000)

const BASE_URL = process.env.NEXT_PUBLIC_HIRESIGHT_API_URL || "http://localhost:5000/api";

async function defPost(endpoint: string, payload: any) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error(`CareerEngine Error in ${endpoint}:`, error);
    throw error;
  }
}

export const CareerEngine = {
  // Helper for cache lookups
  getCache<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(`devtrack_cache_${key}`);
    return item ? JSON.parse(item) as T : null;
  },

  setCache(key: string, data: any): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(`devtrack_cache_${key}`, JSON.stringify(data));
  },

  clearCache(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`devtrack_cache_${key}`);
  },

  // 1. Resume Builder
  async generateResumes(profile: any, repositories: any[], languages: any[], forceRefresh = false): Promise<any> {
    const cacheKey = `resumes_${profile.login}`;
    if (!forceRefresh) {
      const cached = this.getCache<any>(cacheKey);
      if (cached) return cached;
    }
    const res = await defPost("/resume/", { profile, repositories, languages });
    if (res.success) {
      this.setCache(cacheKey, res.resumes);
      return res.resumes;
    }
    throw new Error("Failed to generate resumes");
  },

  // 2. ATS Analyzer
  async analyzeAts(resumeText: string, jobDescription: string): Promise<any> {
    const res = await defPost("/ats/", { resume_text: resumeText, job_description: jobDescription });
    if (res.success) return res.data;
    throw new Error("Failed to analyze ATS");
  },

  // 3. Job Match
  async matchJob(resumeText: string, jobDescription: string, repositories: any[]): Promise<any> {
    const res = await defPost("/job-match/", { resume_text: resumeText, job_description: jobDescription, repositories });
    if (res.success) return res.data;
    throw new Error("Failed to match job");
  },

  // 4. LinkedIn Optimizer
  async optimizeLinkedin(profile: any, repositories: any[], languages: any[], forceRefresh = false): Promise<any> {
    const cacheKey = `linkedin_${profile.login}`;
    if (!forceRefresh) {
      const cached = this.getCache<any>(cacheKey);
      if (cached) return cached;
    }
    const res = await defPost("/linkedin/", { profile, repositories, languages });
    if (res.success) {
      this.setCache(cacheKey, res.data);
      return res.data;
    }
    throw new Error("Failed to optimize LinkedIn");
  },

  // 5. Portfolio Analyzer
  async analyzePortfolio(portfolioUrl: string, profile: any, repositories: any[], forceRefresh = false): Promise<any> {
    const cacheKey = `portfolio_${profile.login}`;
    if (!forceRefresh) {
      const cached = this.getCache<any>(cacheKey);
      if (cached) return cached;
    }
    const res = await defPost("/portfolio/", { portfolio_url: portfolioUrl, profile, repositories });
    if (res.success) {
      this.setCache(cacheKey, res.data);
      return res.data;
    }
    throw new Error("Failed to analyze portfolio");
  },

  // 6. Cover Letter Generator
  async generateCoverLetter(company: string, role: string, description: string, letterType: string, profile: any, languages: any[]): Promise<any> {
    const res = await defPost("/cover-letter/", { company, role, description, letter_type: letterType, profile, languages });
    if (res.success) return res.data;
    throw new Error("Failed to generate cover letter");
  },

  // 7. Skill Gap Analysis
  async analyzeSkillGap(languages: any[], repositories: any[], targetRole: string, forceRefresh = false): Promise<any> {
    const cacheKey = `skillgap_${targetRole.replace(/\s+/g, "_")}`;
    if (!forceRefresh) {
      const cached = this.getCache<any>(cacheKey);
      if (cached) return cached;
    }
    const res = await defPost("/skill-gap/", { languages, repositories, target_role: targetRole });
    if (res.success) {
      this.setCache(cacheKey, res.data);
      return res.data;
    }
    throw new Error("Failed to analyze skill gap");
  },

  // 8. Interview Preparation
  async generateInterviewQuestions(profile: any, repositories: any[], languages: any[], targetRole: string, forceRefresh = false): Promise<any> {
    const cacheKey = `interview_${profile.login}_${targetRole.replace(/\s+/g, "_")}`;
    if (!forceRefresh) {
      const cached = this.getCache<any>(cacheKey);
      if (cached) return cached;
    }
    const res = await defPost("/interview/", { profile, repositories, languages, target_role: targetRole });
    if (res.success) {
      this.setCache(cacheKey, res.questions);
      return res.questions;
    }
    throw new Error("Failed to generate interview questions");
  },

  // 9. Career Roadmap
  async generateRoadmap(languages: any[], targetRole: string, forceRefresh = false): Promise<any> {
    const cacheKey = `roadmap_${targetRole.replace(/\s+/g, "_")}`;
    if (!forceRefresh) {
      const cached = this.getCache<any>(cacheKey);
      if (cached) return cached;
    }
    const res = await defPost("/career-roadmap/", { languages, target_role: targetRole });
    if (res.success) {
      this.setCache(cacheKey, res.data);
      return res.data;
    }
    throw new Error("Failed to generate roadmap");
  },

  // 10. Repository Review
  async reviewRepository(repoName: string, language: string, stars: number, readmeContent: string, forceRefresh = false): Promise<any> {
    const cacheKey = `reporeview_${repoName}`;
    if (!forceRefresh) {
      const cached = this.getCache<any>(cacheKey);
      if (cached) return cached;
    }
    const res = await defPost("/repository-review/", { repo_name: repoName, language, stars, readme_content: readmeContent });
    if (res.success) {
      this.setCache(cacheKey, res.data);
      return res.data;
    }
    throw new Error("Failed to review repository");
  },

  // 11. AI Assistant Chat
  async assistantChat(message: string, profile: any, repositories: any[]): Promise<any> {
    const res = await defPost("/assistant/", { message, profile, repositories });
    if (res.success) return res.data;
    throw new Error("Failed to chat with AI Assistant");
  }
};
