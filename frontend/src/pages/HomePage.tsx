import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Users, CheckCircle } from 'lucide-react';

export default function HomePage(): React.ReactElement {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <Shield className="mx-auto h-16 w-16 text-primary mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          CodeSentinel
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
          AI-powered ethical code analysis platform. Ensure your code reflects the values you stand for.
        </p>
        <div className="mt-10 flex justify-center space-x-4">
          <Link
            to="/dashboard"
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Start Scanning
          </Link>
          <Link
            to="/about"
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Why Choose CodeSentinel?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Comprehensive ethical analysis for modern development teams
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <Zap className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Real-time Analysis
            </h3>
            <p className="text-gray-600">
              Instant feedback on ethical violations with detailed recommendations for improvement.
            </p>
          </div>
          
          <div className="text-center p-6">
            <Users className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Team Collaboration
            </h3>
            <p className="text-gray-600">
              Role-based access control and team management for enterprise-grade compliance.
            </p>
          </div>
          
          <div className="text-center p-6">
            <CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Industry Standards
            </h3>
            <p className="text-gray-600">
              Built-in compliance with GDPR, SOX, HIPAA, and other major regulatory frameworks.
            </p>
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="py-16 bg-gray-50 -mx-6 px-6 rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Enterprise-Ready Platform
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Built with production-grade architecture and enterprise security standards. 
            Ready to scale from individual developers to large organizations.
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">v1.0</div>
            <div className="text-gray-600">Latest Release</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">100%</div>
            <div className="text-gray-600">TypeScript</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">New</div>
            <div className="text-gray-600">Platform Launch</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">24/7</div>
            <div className="text-gray-600">Monitoring</div>
          </div>
        </div>
      </div>
    </div>
  );
}
