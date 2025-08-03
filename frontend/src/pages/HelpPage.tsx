import React, { useState } from 'react';
import { Search, Book, MessageCircle, FileText, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

export default function helpPage(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);

  const toggleSection = (sectionId: string): void => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const faqSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      questions: [
        {
          q: 'How do I start my first code scan?',
          a: 'Navigate to the Dashboard, enter your project directory path, and click "Start Scan". The system will analyze your code for ethical violations and provide detailed results.'
        },
        {
          q: 'What programming languages are supported?',
          a: 'CodeSentinel currently supports JavaScript, TypeScript, Python, Java, C#, and Go. We are continuously adding support for more languages.'
        },
        {
          q: 'How long does a typical scan take?',
          a: 'Scan duration depends on your codebase size and complexity. Small projects (< 1000 files) typically complete in 1-3 minutes, while larger codebases may take 10-30 minutes.'
        }
      ]
    },
    {
      id: 'ethical-analysis',
      title: 'Ethical Analysis',
      questions: [
        {
          q: 'What types of ethical violations does CodeSentinel detect?',
          a: 'Our AI analyzes code for privacy violations, discriminatory algorithms, surveillance implementations, data misuse patterns, and manipulation techniques that could harm users.'
        },
        {
          q: 'How accurate are the ethical violation detections?',
          a: 'CodeSentinel maintains a 95% accuracy rate with minimal false positives. Our AI models are continuously trained on the latest ethical guidelines and regulatory frameworks.'
        },
        {
          q: 'Can I customize the ethical rules for my organization?',
          a: 'Yes! Enterprise users can define custom ethical policies, adjust violation thresholds, and create organization-specific rules that align with your values and compliance requirements.'
        }
      ]
    },
    {
      id: 'team-management',
      title: 'Team Management',
      questions: [
        {
          q: 'How do I add team members to my organization?',
          a: 'Go to Team Access page, click "Add Member", enter their details, and assign appropriate roles. They will receive an invitation email to join your organization.'
        },
        {
          q: 'What are the different user roles and permissions?',
          a: 'Admin: Full access; Team Lead: Manage scans and view reports; Developer: Run scans and view results; Viewer: Read-only access to reports and history.'
        },
        {
          q: 'Can I track team scanning activity?',
          a: 'Yes! The dashboard provides comprehensive analytics on team scanning activity, including individual member contributions, violation trends, and improvement metrics.'
        }
      ]
    },
    {
      id: 'integrations',
      title: 'Integrations',
      questions: [
        {
          q: 'Does CodeSentinel integrate with VS Code?',
          a: 'Yes! Our VS Code extension provides real-time ethical analysis as you code, with inline suggestions and automatic scanning on file save.'
        },
        {
          q: 'Can I integrate with CI/CD pipelines?',
          a: 'Absolutely! CodeSentinel provides REST APIs and CLI tools for seamless integration with GitHub Actions, Jenkins, GitLab CI, and other popular CI/CD platforms.'
        },
        {
          q: 'Is there a command-line interface?',
          a: 'Yes, we provide a robust CLI tool for automated scanning, batch processing, and integration with existing development workflows.'
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      questions: [
        {
          q: 'My scan is stuck or taking too long. What should I do?',
          a: 'Try stopping the current scan and restarting. If the issue persists, check that your project directory is accessible and doesn\'t contain extremely large files (>100MB).'
        },
        {
          q: 'I\'m getting false positive violations. How can I address this?',
          a: 'You can mark violations as false positives in the scan results. This feedback helps improve our AI models. Enterprise users can also adjust sensitivity settings.'
        },
        {
          q: 'The application is running slowly. How can I improve performance?',
          a: 'Ensure you have sufficient system resources (4GB RAM minimum). Consider excluding large dependency folders (node_modules, .git) from scans using the ignore patterns feature.'
        }
      ]
    }
  ];

  const quickLinks = [
    { title: 'API Documentation', icon: FileText, url: '/docs/api' },
    { title: 'VS Code Extension Guide', icon: Book, url: '/docs/vscode' },
    { title: 'Enterprise Setup', icon: FileText, url: '/docs/enterprise' },
    { title: 'Community Forum', icon: MessageCircle, url: 'https://community.codesentinel.ai' },
  ];

  const filteredSections = faqSections.map(section => ({
    ...section,
    questions: section.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.questions.length > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Help & Documentation</h1>
        <p className="mt-2 text-gray-600">Find answers to common questions and learn how to use CodeSentinel</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-4">
        {quickLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow border-l-4 border-primary"
          >
            <div className="flex items-center">
              <link.icon className="w-6 h-6 text-primary mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">{link.title}</h3>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500 mr-1">Learn more</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* FAQ Sections */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
        
        {filteredSections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                {expandedSections.includes(section.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </button>
            
            {expandedSections.includes(section.id) && (
              <div className="p-6 space-y-6">
                {section.questions.map((qa, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-gray-900">{qa.q}</h4>
                    <p className="text-gray-600 leading-relaxed">{qa.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {searchQuery && filteredSections.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">
              Try searching with different keywords or browse the sections above.
            </p>
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div className="bg-primary rounded-lg p-8 text-white text-center">
        <MessageCircle className="mx-auto h-12 w-12 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
        <p className="text-primary-100 mb-6">
          Our support team is here to help you get the most out of CodeSentinel.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:support@codesentinel.ai"
            className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Email Support
          </a>
          <a
            href="https://community.codesentinel.ai"
            className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-primary transition-colors"
          >
            Join Community
          </a>
        </div>
      </div>
    </div>
  );
}
