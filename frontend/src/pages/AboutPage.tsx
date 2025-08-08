import React from 'react';
import { Shield, Heart, Users, Globe, Github, Mail, ExternalLink } from 'lucide-react';

export default function AboutPage(): React.ReactElement {
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
          As a solo developer, I'm passionate about empowering developers and organizations to build software 
          that respects privacy, promotes fairness, and creates positive impact. This AI-driven platform 
          analyzes code for ethical violations, helping teams catch potential issues before they reach production.
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

      {/* Developer */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center mb-6">
          <Users className="w-8 h-8 text-blue-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">About the Developer</h2>
        </div>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          CodeSentinel is developed by a passionate solo developer committed to responsible AI and 
          ethical software development. This project combines expertise in full-stack development, 
          machine learning, and ethical technology principles to create tools that make a difference.
        </p>
        
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">DEV</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">Solo Developer & Creator</h3>
          <p className="text-gray-600 mt-2">
            Full-stack engineer passionate about ethical AI, responsible technology, 
            and building tools that empower developers to create positive impact.
          </p>
          <div className="mt-4 flex justify-center space-x-4 text-sm text-gray-500">
            <span>• TypeScript/React Expert</span>
            <span>• AI/ML Integration</span>
            <span>• Enterprise Architecture</span>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Connect</h3>
            <div className="space-y-3">
              <a 
                href="mailto:contact@codesentinel.dev" 
                className="flex items-center text-gray-600 hover:text-primary transition-colors"
              >
                <Mail className="w-5 h-5 mr-3" />
                contact@codesentinel.dev
              </a>
              <a 
                href="https://github.com/LostinEVE/CodeSentinel" 
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
          © 2025 CodeSentinel. Built with ❤️ by a solo developer passionate about ethical software.
        </p>
      </div>
    </div>
  );
}
