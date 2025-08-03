import React from 'react';
import { Shield, Heart, Users, Globe, Github, Mail, ExternalLink } from 'lucide-react';

export default function aboutPage(): React.ReactElement {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <Shield className="mx-auto h-16 w-16 text-primary mb-6" />
        <h1 className="text-4xl font-bold text-gray-900">About CodeSentinel</h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          AI-powered ethical code analysis platform built for the modern development world
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center mb-6">
          <Heart className="w-8 h-8 text-red-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
        </div>
        <p className="text-gray-600 text-lg leading-relaxed">
          CodeSentinel was born from the belief that technology should enhance humanity, not exploit it. 
          We empower developers and organizations to build software that respects privacy, promotes fairness, 
          and creates positive impact. Our AI-driven platform analyzes code for ethical violations, helping 
          teams catch potential issues before they reach production.
        </p>
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Do</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">🔍 Intelligent Analysis</h3>
            <p className="text-gray-600">
              Advanced AI algorithms scan your codebase for ethical violations including privacy breaches, 
              discriminatory algorithms, and potential misuse patterns.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">⚡ Real-time Feedback</h3>
            <p className="text-gray-600">
              Get instant notifications about ethical concerns as you code, with detailed explanations 
              and actionable recommendations for improvement.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">🏢 Enterprise Ready</h3>
            <p className="text-gray-600">
              Built-in compliance with GDPR, SOX, HIPAA, and other regulatory frameworks. 
              Role-based access control and audit trails for enterprise governance.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">🤝 Team Collaboration</h3>
            <p className="text-gray-600">
              Collaborative tools for code review, team training, and building ethical 
              awareness across your development organization.
            </p>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center mb-6">
          <Users className="w-8 h-8 text-blue-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Our Team</h2>
        </div>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          CodeSentinel is developed by a diverse team of engineers, ethicists, and domain experts 
          passionate about responsible AI and software development. We believe in transparency, 
          accountability, and building technology that serves everyone.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">AI</span>
            </div>
            <h3 className="font-semibold text-gray-900">AI Research Team</h3>
            <p className="text-sm text-gray-600">Machine learning engineers and researchers</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">ET</span>
            </div>
            <h3 className="font-semibold text-gray-900">Ethics Team</h3>
            <p className="text-sm text-gray-600">Philosophers, policy experts, and ethicists</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">ENG</span>
            </div>
            <h3 className="font-semibold text-gray-900">Engineering Team</h3>
            <p className="text-sm text-gray-600">Full-stack developers and DevOps specialists</p>
          </div>
        </div>
      </div>

      {/* Technology */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Technology Stack</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Frontend</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• React 18+ with TypeScript</li>
              <li>• Redux Toolkit for state management</li>
              <li>• Tailwind CSS for styling</li>
              <li>• Vite for build optimization</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Backend</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Node.js with TypeScript</li>
              <li>• Advanced AI/ML models</li>
              <li>• VS Code Extension API</li>
              <li>• Enterprise security standards</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center mb-6">
          <Globe className="w-8 h-8 text-green-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Get in Touch</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Connect With Us</h3>
            <div className="space-y-3">
              <a 
                href="mailto:hello@codesentinel.ai" 
                className="flex items-center text-gray-600 hover:text-primary transition-colors"
              >
                <Mail className="w-5 h-5 mr-3" />
                hello@codesentinel.ai
              </a>
              <a 
                href="https://github.com/codesentinel" 
                className="flex items-center text-gray-600 hover:text-primary transition-colors"
              >
                <Github className="w-5 h-5 mr-3" />
                GitHub Repository
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Version Information</h3>
            <div className="space-y-2 text-gray-600">
              <p>• Version: 1.0.0</p>
              <p>• Released: August 2025</p>
              <p>• License: MIT</p>
              <p>• Node.js: 18+</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-gray-200">
        <p className="text-gray-500">
          © 2025 CodeSentinel. Built with ❤️ for ethical software development.
        </p>
      </div>
    </div>
  );
}
