import mammoth from 'mammoth';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?worker';

export interface ExtractedCVInfo {
  name: string;
  email: string;
  phone: string;
  department: string;
  skills: string[];
  experience: string;
  education: string;
  rawText: string;
  role: string;
  compétance :string;
}

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_REGEX = /(\+?\d{1,4}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;

const DEPARTMENT_KEYWORDS = {
  'Engineering': ['engineer', 'developer', 'software', 'programming', 'coding', 'technical', 'backend', 'frontend', 'fullstack', 'devops'],
  'Design': ['designer', 'ui', 'ux', 'graphic', 'visual', 'creative', 'photoshop', 'illustrator', 'figma'],
  'Marketing': ['marketing', 'digital marketing', 'seo', 'social media', 'advertising', 'campaign', 'brand'],
  'Sales': ['sales', 'business development', 'account manager', 'customer relations', 'revenue'],
  'HR': ['human resources', 'hr', 'recruitment', 'talent acquisition', 'people operations'],
  'Finance': ['finance', 'accounting', 'financial', 'budget', 'audit', 'controller', 'analyst'],
  'Operations': ['operations', 'logistics', 'supply chain', 'project management', 'process improvement']
};

const SKILLS_KEYWORDS = [
  'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'python', 'java', 'c++', 'c#',
  'html', 'css', 'sass', 'bootstrap', 'tailwind', 'mongodb', 'mysql', 'postgresql', 'firebase',
  'aws', 'azure', 'docker', 'kubernetes', 'git', 'github', 'gitlab', 'jenkins', 'ci/cd',
  'photoshop', 'illustrator', 'figma', 'sketch', 'adobe', 'canva', 'indesign',
  'excel', 'powerpoint', 'word', 'google analytics', 'seo', 'sem', 'social media',
  'project management', 'agile', 'scrum', 'jira', 'trello', 'slack', 'teams','flutter', 'react native',
  'graphql', 'rest', 'api', 'web development', 'mobile development', 'data analysis',
  'machine learning', 'artificial intelligence', 'data science', 'big data', 'cloud computing',
  'cybersecurity', 'penetration testing', 'ethical hacking', 'network security', 'information security',
  'business analysis', 'ux design', 'ui design', 'graphic design', 'content creation', 'copywriting',
  'video editing', 'audio editing', 'public speaking', 'communication', 'negotiation', 'leadership',
  'teamwork', 'problem solving', 'critical thinking', 'time management', 'adaptability', 'creativity'
  ];

export class CVParser {
  static async parseCV(file: File): Promise<ExtractedCVInfo> {
    let text = '';

    try {
      if (file.type === 'application/pdf') {
        text = await this.extractTextFromPDF(file);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
      ) {
        text = await this.extractTextFromWord(file);
      } else {
        throw new Error('Unsupported file format. Please upload PDF or Word documents.');
      }

      return this.extractInformation(text);
    } catch (error) {
      console.error('Error parsing CV:', error);
      throw error;
    }
  }

  private static async extractTextFromPDF(file: File): Promise<string> {
    try {
      const pdfjsLib = await import('pdfjs-dist');

      try {
        pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();
      } catch {
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.js',
            import.meta.url
          ).toString();
        } catch {
          pdfjsLib.GlobalWorkerOptions.workerSrc = '';
        }
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        text += pageText + '\n';
      }

      return text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return `Unable to extract text from PDF: ${file.name}\nPlease ensure the PDF contains selectable text or try uploading a Word document instead.\nFile size: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    }
  }

  private static async extractTextFromWord(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  private static extractInformation(text: string): ExtractedCVInfo {
    const lowerText = text.toLowerCase();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const emailMatches = text.match(EMAIL_REGEX);
    const email = emailMatches ? emailMatches[0] : '';

    const phoneMatches = text.match(PHONE_REGEX);
    const phone = phoneMatches ? phoneMatches[0].replace(/\s+/g, '') : '';

    // ✅ Improved name extraction logic
    let name = '';
    for (const line of lines.slice(0, 10)) {
      const cleanLine = line.replace(/[^a-zA-Z\s]/g, '').trim();
      const words = cleanLine.split(/\s+/);

      if (
        words.length >= 2 &&
        words.length <= 4 &&
        words.every(w => /^[A-Z][a-z]+$/.test(w))
      ) {
        name = cleanLine;
        break;
      }
    }

    if (!name && email) {
      const emailUsername = email.split('@')[0];
      const parts = emailUsername.split(/[._]/).map(p =>
        p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
      );
      name = parts.slice(0, 2).join(' ');
    }

    if (!name) {
      name = 'Unknown';
    }

    // Detect department
    let department = 'General';
    let maxMatches = 0;
    for (const [dept, keywords] of Object.entries(DEPARTMENT_KEYWORDS)) {
      const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        department = dept;
      }
    }

    const skills = SKILLS_KEYWORDS.filter(skill => lowerText.includes(skill.toLowerCase()));

    let experience = '';
    const experienceMatches = text.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi);
    if (experienceMatches) {
      experience = experienceMatches[0];
    } else {
      const expSection = this.extractSection(text, ['experience', 'work history', 'employment']);
      experience = expSection.substring(0, 200) + (expSection.length > 200 ? '...' : '');
    }

    const education = this.extractSection(text, ['education', 'academic', 'qualification', 'degree']);

    let role = '';
    if (experience) {
      const roleMatches = experience.match(/(?:as\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:\s+(?:at|in|for)\s+)/);
      if (roleMatches && roleMatches[1]) {
        role = roleMatches[1];
      } else {
        role = experience.substring(0, 50) + (experience.length > 50 ? '...' : '');
      }
    }

    return {
      name,
      email,
      phone,
      department,
      skills: skills.slice(0, 10),
      experience: experience || 'Not specified',
      education: education.substring(0, 200) + (education.length > 200 ? '...' : ''),
      rawText: text,
      role: role || 'Not specified'
      , compétance : skills.join(', ') || 'Not specified'
    };
  }

  private static extractSection(text: string, keywords: string[]): string {
    const lines = text.split('\n');
    let sectionStart = -1;
    let sectionEnd = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (keywords.some(keyword => line.includes(keyword))) {
        sectionStart = i;
        break;
      }
    }

    if (sectionStart === -1) return '';

    const majorSections = ['experience', 'education', 'skills', 'projects', 'certifications', 'references'];
    for (let i = sectionStart + 1; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (
        majorSections.some(section => line.includes(section)) &&
        !keywords.some(keyword => line.includes(keyword))
      ) {
        sectionEnd = i;
        break;
      }
    }

    if (sectionEnd === -1) sectionEnd = Math.min(sectionStart + 10, lines.length);

    return lines.slice(sectionStart + 1, sectionEnd).join('\n').trim();
  }
}
export default CVParser;