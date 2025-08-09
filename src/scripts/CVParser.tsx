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
  compétance: string;
  status?: string;
  address?: string;
  linkedin?: string;
  portfolio?: string;
  certifications?: string[];
  languages?: string[];
  availability?: string;
  salary?: string;
  notes?: string;
}

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_REGEX = /(\+?\d{1,4}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/gi;
const PORTFOLIO_REGEX = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:com|net|org|io|co|me)\/?/gi;

const DEPARTMENT_KEYWORDS = {
  'Engineering': ['engineer', 'developer', 'software', 'programming', 'coding', 'technical', 'backend', 'frontend', 'fullstack', 'devops', 'system', 'data'],
  'Design': ['designer', 'ui', 'ux', 'graphic', 'visual', 'creative', 'photoshop', 'illustrator', 'figma', 'sketch', 'adobe'],
  'Marketing': ['marketing', 'digital marketing', 'seo', 'social media', 'advertising', 'campaign', 'brand', 'content'],
  'Sales': ['sales', 'business development', 'account manager', 'customer relations', 'revenue', 'business'],
  'HR': ['human resources', 'hr', 'recruitment', 'talent acquisition', 'people operations', 'personnel'],
  'Finance': ['finance', 'accounting', 'financial', 'budget', 'audit', 'controller', 'analyst', 'accountant'],
  'Operations': ['operations', 'logistics', 'supply chain', 'project management', 'process improvement', 'management'],
  'Design Department': ['designer', 'ui', 'ux', 'graphic', 'visual', 'creative', 'photoshop', 'illustrator', 'figma', 'sketch', 'adobe']
};

const SKILLS_KEYWORDS = [
  'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'python', 'java', 'c++', 'c#',
  'html', 'css', 'sass', 'bootstrap', 'tailwind', 'mongodb', 'mysql', 'postgresql', 'firebase',
  'aws', 'azure', 'docker', 'kubernetes', 'git', 'github', 'gitlab', 'jenkins', 'ci/cd',
  'photoshop', 'illustrator', 'figma', 'sketch', 'adobe', 'canva', 'indesign',
  'excel', 'powerpoint', 'word', 'google analytics', 'seo', 'sem', 'social media',
  'project management', 'agile', 'scrum', 'jira', 'trello', 'slack', 'teams', 'flutter', 'react native',
  'graphql', 'rest', 'api', 'web development', 'mobile development', 'data analysis',
  'machine learning', 'artificial intelligence', 'data science', 'big data', 'cloud computing',
  'cybersecurity', 'penetration testing', 'ethical hacking', 'network security', 'information security',
  'business analysis', 'ux design', 'ui design', 'graphic design', 'content creation', 'copywriting',
  'video editing', 'audio editing', 'public speaking', 'communication', 'negotiation', 'leadership',
  'teamwork', 'problem solving', 'critical thinking', 'time management', 'adaptability', 'creativity'
];

const STATUS_KEYWORDS = {
  'Full-Time': ['full-time', 'full time', 'permanent', 'fulltime'],
  'Part-Time': ['part-time', 'part time', 'parttime'],
  'Contract': ['contract', 'freelance', 'consultant'],
  'Internship': ['intern', 'internship', 'student'],
  'Pending': ['pending', 'applied', 'new']
};

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

    // Extract email
    const emailMatches = text.match(EMAIL_REGEX);
    const email = emailMatches ? emailMatches[0] : '';

    // Extract phone
    const phoneMatches = text.match(PHONE_REGEX);
    const phone = phoneMatches ? phoneMatches[0].replace(/\s+/g, '') : '';

    // Extract LinkedIn
    const linkedinMatches = text.match(LINKEDIN_REGEX);
    const linkedin = linkedinMatches ? linkedinMatches[0] : '';

    // Extract portfolio
    const portfolioMatches = text.match(PORTFOLIO_REGEX);
    const portfolio = portfolioMatches ? portfolioMatches[0] : '';

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

    // Extract skills
    const skills = SKILLS_KEYWORDS.filter(skill => lowerText.includes(skill.toLowerCase()));

    // Extract experience
    let experience = '';
    const experienceMatches = text.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi);
    if (experienceMatches) {
      experience = experienceMatches[0];
    } else {
      const expSection = this.extractSection(text, ['experience', 'work history', 'employment']);
      experience = expSection.substring(0, 200) + (expSection.length > 200 ? '...' : '');
    }

    // Extract education
    const education = this.extractSection(text, ['education', 'academic', 'qualification', 'degree']);

    // Extract role
    let role = '';
    if (experience) {
      const roleMatches = experience.match(/(?:as\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:\s+(?:at|in|for)\s+)/);
      if (roleMatches && roleMatches[1]) {
        role = roleMatches[1];
      } else {
        role = experience.substring(0, 50) + (experience.length > 50 ? '...' : '');
      }
    }

    // Detect status
    let status = 'Pending';
    for (const [statusType, keywords] of Object.entries(STATUS_KEYWORDS)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        status = statusType;
        break;
      }
    }

    // Extract certifications
    const certifications = this.extractCertifications(text);

    // Extract languages
    const languages = this.extractLanguages(text);

    // Extract address
    const address = this.extractAddress(text);

    return {
      name,
      email,
      phone,
      department,
      skills: skills.slice(0, 10),
      experience: experience || 'Not specified',
      education: education.substring(0, 200) + (education.length > 200 ? '...' : ''),
      rawText: text,
      role: role || 'Not specified',
      compétance: skills.join(', ') || 'Not specified',
      status,
      address,
      linkedin,
      portfolio,
      certifications,
      languages,
      availability: 'Available',
      salary: '',
      notes: ''
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

  private static extractCertifications(text: string): string[] {
    const certifications: string[] = [];
    const certKeywords = ['certification', 'certified', 'certificate', 'license', 'accreditation'];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (certKeywords.some(keyword => lowerLine.includes(keyword))) {
        const cleanCert = line.replace(/[^\w\s-]/g, '').trim();
        if (cleanCert.length > 3 && cleanCert.length < 100) {
          certifications.push(cleanCert);
        }
      }
    }
    
    return certifications.slice(0, 5); // Limit to 5 certifications
  }

  private static extractLanguages(text: string): string[] {
    const languages: string[] = [];
    const languageKeywords = ['english', 'french', 'spanish', 'german', 'italian', 'portuguese', 'arabic', 'chinese', 'japanese', 'korean'];
    const lowerText = text.toLowerCase();
    
    for (const lang of languageKeywords) {
      if (lowerText.includes(lang)) {
        languages.push(lang.charAt(0).toUpperCase() + lang.slice(1));
      }
    }
    
    return languages;
  }

  private static extractAddress(text: string): string {
    const addressRegex = /(\d+\s+[A-Za-z\s,]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|place|pl|court|ct|circle|cir|terrace|ter|trail|trl|parkway|pkwy|highway|hwy|freeway|fwy|expressway|expy|turnpike|tpke|route|rte|county|co|state|st|province|prov|country|ctry|zip|postal|code|postcode|pc)[A-Za-z\s,]*)/gi;
    const addressMatches = text.match(addressRegex);
    return addressMatches ? addressMatches[0].trim() : '';
  }
}

export default CVParser;