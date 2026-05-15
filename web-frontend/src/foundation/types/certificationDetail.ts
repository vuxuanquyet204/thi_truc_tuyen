export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  isOpen?: boolean;
}

export interface CertificationDetail {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  questions: string;
  level: 'Basic' | 'Intermediate' | 'Advanced' | 'Cơ bản' | 'Trung cấp' | 'Nâng cao';
  category: 'role' | 'skill';
  icon: string;
  color: string;
  benefits: string[];
  requirements: string[];
  topics: string[];
  faqs: FAQItem[];
  companyLogos: string[];
  testimonialCount: string;
}
