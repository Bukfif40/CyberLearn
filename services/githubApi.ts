import { Roadmap, IndustryStandards } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubApiService {
  private token: string | null = null;

  constructor(token?: string) {
    this.token = token || null;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'CyberLearn/1.0',
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    return headers;
  }

  async searchRoadmaps(minStars: number = 200, maxAgeDays: number = 365, customQuery?: string): Promise<Roadmap[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
    const cutoffString = cutoffDate.toISOString().split('T')[0];

    const query = customQuery || `cybersecurity roadmap stars:>=${minStars} pushed:>${cutoffString}`;
    const url = `${GITHUB_API_BASE}/search/repositories`;

    try {
      const response = await fetch(`${url}?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=15`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.items.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        full_name: item.full_name,
        description: item.description || '',
        stars: item.stargazers_count,
        forks: item.forks_count,
        updated_at: item.pushed_at,
        html_url: item.html_url,
        owner: {
          login: item.owner.login,
          avatar_url: item.owner.avatar_url,
        },
      }));
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      throw error;
    }
  }

  async getReadme(repoFullName: string): Promise<string | null> {
    const url = `${GITHUB_API_BASE}/repos/${repoFullName}/readme`;

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      
      const base64Content = data.content;
      const cleanBase64 = base64Content.replace(/\s/g, '');
      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const content = new TextDecoder('utf-8').decode(bytes);
      return content;
    } catch (error) {
      console.error('Error fetching README:', error);
      return null;
    }
  }

  evaluateIndustryStandards(readmeContent: string): IndustryStandards {
    const content = readmeContent.toLowerCase();

    const criteria = {
      frameworks: {
        nist: content.includes('nist'),
        mitre: content.includes('mitre') || content.includes('att&ck'),
        iso: content.includes('iso') || content.includes('27001'),
        sans: content.includes('sans') || content.includes('giac'),
      },
      certifications: {
        comptia: content.includes('comptia') || content.includes('security+'),
        cissp: content.includes('cissp'),
        oscp: content.includes('oscp'),
        ceh: content.includes('ceh'),
        aws: content.includes('aws') || content.includes('azure'),
      },
      hands_on: {
        tryhackme: content.includes('tryhackme'),
        hackthebox: content.includes('hackthebox') || content.includes('hack the box'),
        labs: content.includes('lab'),
        projects: content.includes('project') || content.includes('home lab'),
      },
      structure: {
        beginner: content.includes('beginner'),
        intermediate: content.includes('intermediate'),
        advanced: content.includes('advanced'),
        career: content.includes('career') || content.includes('job'),
      },
    };

    const totalChecks = Object.values(criteria).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
    const passedChecks = Object.values(criteria).reduce((sum, cat) => 
      sum + Object.values(cat).filter(Boolean).length, 0);
    
    const score = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;

    return { score, criteria };
  }

  async getRoadmapWithStandards(repoFullName: string): Promise<{ roadmap: Roadmap; standards: IndustryStandards } | null> {
    const readme = await this.getReadme(repoFullName);
    
    if (!readme) {
      return null;
    }

    const standards = this.evaluateIndustryStandards(readme);
    
    // Get basic repo info
    const url = `${GITHUB_API_BASE}/repos/${repoFullName}`;
    const response = await fetch(url, { headers: this.getHeaders() });
    
    if (!response.ok) {
      return null;
    }

    const item = await response.json();
    
    const roadmap: Roadmap = {
      id: item.id.toString(),
      name: item.name,
      full_name: item.full_name,
      description: item.description || '',
      stars: item.stargazers_count,
      forks: item.forks_count,
      updated_at: item.pushed_at,
      html_url: item.html_url,
      owner: {
        login: item.owner.login,
        avatar_url: item.owner.avatar_url,
      },
    };

    return { roadmap, standards };
  }
}
