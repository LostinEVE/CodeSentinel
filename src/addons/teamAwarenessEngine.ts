/**
 * Team Awareness Layer - Role-Based Ethical Violation Weighting
 * Adjusts violation weights based on developer roles and team context
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EthicalViolation, EthicalRiskMetrics } from '../core/ethicsEngine';

export interface DeveloperProfile {
  id: string;
  name: string;
  email: string;
  role: DeveloperRole;
  experienceLevel: ExperienceLevel;
  certifications: string[];
  teamId: string;
  joinDate: Date;
  lastTrainingDate?: Date;
  ethicsScore: number; // Historical ethics compliance score
}

export interface DeveloperRole {
  type: 'junior' | 'mid' | 'senior' | 'lead' | 'architect' | 'security' | 'compliance' | 'contractor';
  permissions: RolePermissions;
  responsibilities: string[];
  ethicsWeightModifier: number; // 0.5-2.0 multiplier for violation severity
}

export interface RolePermissions {
  canIgnoreWarnings: boolean;
  canModifyPolicies: boolean;
  requiresReview: boolean;
  canApproveViolations: boolean;
  maxRiskThreshold: number;
}

export interface ExperienceLevel {
  years: number;
  category: 'novice' | 'intermediate' | 'advanced' | 'expert';
  ethicsTrainingHours: number;
  previousViolations: number;
}

export interface TeamContext {
  id: string;
  name: string;
  project: string;
  industry: 'financial' | 'healthcare' | 'education' | 'social' | 'enterprise' | 'gaming' | 'other';
  complianceLevel: 'standard' | 'high' | 'critical';
  ethicsChampion?: string; // User ID of team ethics champion
  averageExperience: number;
  recentViolationTrend: 'improving' | 'stable' | 'concerning';
}

export interface GitCommitMetadata {
  author: string;
  email: string;
  timestamp: Date;
  message: string;
  filesChanged: string[];
  linesAdded: number;
  linesRemoved: number;
}

export interface AdjustedViolation extends EthicalViolation {
  originalSeverity: string;
  adjustedSeverity: 'low' | 'medium' | 'high' | 'critical';
  adjustmentReason: string;
  requiresReview: boolean;
  assignedReviewer?: string;
  weightingFactors: WeightingFactors;
}

export interface WeightingFactors {
  roleMultiplier: number;
  experienceMultiplier: number;
  teamContextMultiplier: number;
  historicalPerformanceMultiplier: number;
  industryComplianceMultiplier: number;
}

/**
 * Team Awareness Engine with Original Role-Based Risk Assessment
 */
export class TeamAwarenessEngine {
  private developerProfiles: Map<string, DeveloperProfile> = new Map();
  private teamContexts: Map<string, TeamContext> = new Map();
  private gitMetadataCache: Map<string, GitCommitMetadata[]> = new Map();
  
  constructor() {
    this.initializeRoleDefinitions();
    this.loadTeamData();
  }

  /**
   * Adjust violations based on developer role and team context
   */
  public async adjustViolationsForDeveloper(
    violations: EthicalViolation[],
    workspacePath: string
  ): Promise<AdjustedViolation[]> {
    const developer = await this.identifyDeveloper(workspacePath);
    const teamContext = await this.getTeamContext(workspacePath);
    
    return violations.map(violation => 
      this.adjustViolation(violation, developer, teamContext)
    );
  }

  /**
   * Adjust risk metrics based on team composition and roles
   */
  public adjustRiskMetricsForTeam(
    metrics: EthicalRiskMetrics,
    workspacePath: string
  ): Promise<EthicalRiskMetrics> {
    return this.getTeamContext(workspacePath).then(teamContext => {
      const adjustmentFactor = this.calculateTeamRiskAdjustment(teamContext);
      
      return {
        surveillanceRisk: Math.min(1.0, metrics.surveillanceRisk * adjustmentFactor.surveillance),
        discriminationRisk: Math.min(1.0, metrics.discriminationRisk * adjustmentFactor.discrimination),
        privacyViolationRisk: Math.min(1.0, metrics.privacyViolationRisk * adjustmentFactor.privacy),
        misuseRisk: Math.min(1.0, metrics.misuseRisk * adjustmentFactor.misuse),
        manipulationRisk: Math.min(1.0, metrics.manipulationRisk * adjustmentFactor.manipulation),
        overallEthicsScore: metrics.overallEthicsScore * adjustmentFactor.overall
      };
    });
  }

  /**
   * Identify developer from Git metadata and VS Code profile
   */
  private async identifyDeveloper(workspacePath: string): Promise<DeveloperProfile> {
    // Try VS Code user profile first
    const vscodeProfile = await this.getVSCodeProfile();
    if (vscodeProfile) {
      const profile = this.developerProfiles.get(vscodeProfile.email);
      if (profile) {
        return profile;
      }
    }

    // Fall back to Git metadata
    const gitMetadata = await this.getLatestGitCommit(workspacePath);
    if (gitMetadata) {
      let profile = this.developerProfiles.get(gitMetadata.email);
      if (!profile) {
        // Create default profile for unknown developer
        profile = this.createDefaultProfile(gitMetadata);
        this.developerProfiles.set(gitMetadata.email, profile);
      }
      return profile;
    }

    // Return anonymous developer profile
    return this.getAnonymousProfile();
  }

  /**
   * Get VS Code user profile information
   */
  private async getVSCodeProfile(): Promise<{ name: string; email: string } | null> {
    try {
      // Try to get Git user info from VS Code workspace
      const gitExtension = vscode.extensions.getExtension('vscode.git');
      if (gitExtension?.isActive) {
        const git = gitExtension.exports.getAPI(1);
        const repository = git.repositories[0];
        
        if (repository) {
          const config = repository.repository.getGlobalConfig();
          return {
            name: config['user.name'] || 'Unknown',
            email: config['user.email'] || 'unknown@example.com'
          };
        }
      }

      return null;
    } catch (error) {
      console.warn('Failed to get VS Code profile:', error);
      return null;
    }
  }

  /**
   * Get latest Git commit metadata
   */
  private async getLatestGitCommit(workspacePath: string): Promise<GitCommitMetadata | null> {
    try {
      const gitDir = path.join(workspacePath, '.git');
      if (!fs.existsSync(gitDir)) {
        return null;
      }

      // Simple git log parsing (in production, use proper Git library)
      const { execSync } = require('child_process');
      const gitLog = execSync(
        'git log -1 --pretty=format:"%H|%an|%ae|%at|%s" --numstat',
        { cwd: workspacePath, encoding: 'utf8' }
      ).toString();

      const lines = gitLog.split('\n');
      const [hash, author, email, timestamp, message] = lines[0].split('|');
      
      let linesAdded = 0;
      let linesRemoved = 0;
      const filesChanged: string[] = [];

      // Parse numstat output
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const parts = line.split('\t');
          if (parts.length === 3) {
            const added = parseInt(parts[0]) || 0;
            const removed = parseInt(parts[1]) || 0;
            const filename = parts[2];
            
            linesAdded += added;
            linesRemoved += removed;
            filesChanged.push(filename);
          }
        }
      }

      return {
        author,
        email,
        timestamp: new Date(parseInt(timestamp) * 1000),
        message,
        filesChanged,
        linesAdded,
        linesRemoved
      };
    } catch (error) {
      console.warn('Failed to get Git commit metadata:', error);
      return null;
    }
  }

  /**
   * Adjust individual violation based on developer and team context
   */
  private adjustViolation(
    violation: EthicalViolation,
    developer: DeveloperProfile,
    teamContext: TeamContext
  ): AdjustedViolation {
    const weightingFactors = this.calculateWeightingFactors(developer, teamContext, violation);
    const adjustedSeverity = this.calculateAdjustedSeverity(violation, weightingFactors);
    const requiresReview = this.determineReviewRequirement(violation, developer, adjustedSeverity);
    
    return {
      ...violation,
      originalSeverity: violation.severity,
      adjustedSeverity,
      adjustmentReason: this.generateAdjustmentReason(weightingFactors, developer),
      requiresReview,
      assignedReviewer: requiresReview ? this.assignReviewer(teamContext, developer) : undefined,
      weightingFactors
    };
  }

  /**
   * Calculate weighting factors for violation adjustment
   */
  private calculateWeightingFactors(
    developer: DeveloperProfile,
    teamContext: TeamContext,
    violation: EthicalViolation
  ): WeightingFactors {
    // Role-based multiplier
    const roleMultiplier = developer.role.ethicsWeightModifier;

    // Experience-based multiplier (more experienced = higher expectations)
    let experienceMultiplier = 1.0;
    switch (developer.experienceLevel.category) {
      case 'novice':
        experienceMultiplier = 0.7; // More lenient for beginners
        break;
      case 'intermediate':
        experienceMultiplier = 0.9;
        break;
      case 'advanced':
        experienceMultiplier = 1.1;
        break;
      case 'expert':
        experienceMultiplier = 1.3; // Higher expectations for experts
        break;
    }

    // Team context multiplier
    let teamContextMultiplier = 1.0;
    switch (teamContext.complianceLevel) {
      case 'standard':
        teamContextMultiplier = 1.0;
        break;
      case 'high':
        teamContextMultiplier = 1.3;
        break;
      case 'critical':
        teamContextMultiplier = 1.6;
        break;
    }

    // Historical performance multiplier
    const historicalPerformanceMultiplier = developer.ethicsScore < 0.8 ? 1.2 : 0.9;

    // Industry compliance multiplier
    let industryComplianceMultiplier = 1.0;
    switch (teamContext.industry) {
      case 'financial':
      case 'healthcare':
        industryComplianceMultiplier = 1.4;
        break;
      case 'education':
        industryComplianceMultiplier = 1.2;
        break;
      case 'social':
        if (violation.type === 'discriminationRisk' || violation.type === 'manipulationRisk') {
          industryComplianceMultiplier = 1.5;
        }
        break;
    }

    return {
      roleMultiplier,
      experienceMultiplier,
      teamContextMultiplier,
      historicalPerformanceMultiplier,
      industryComplianceMultiplier
    };
  }

  /**
   * Calculate adjusted severity based on weighting factors
   */
  private calculateAdjustedSeverity(
    violation: EthicalViolation,
    factors: WeightingFactors
  ): 'low' | 'medium' | 'high' | 'critical' {
    const severityValues = { low: 1, medium: 2, high: 3, critical: 4 };
    const originalValue = severityValues[violation.severity as keyof typeof severityValues];
    
    const compositeMultiplier = 
      factors.roleMultiplier *
      factors.experienceMultiplier *
      factors.teamContextMultiplier *
      factors.historicalPerformanceMultiplier *
      factors.industryComplianceMultiplier;

    const adjustedValue = Math.round(originalValue * compositeMultiplier);
    const clampedValue = Math.max(1, Math.min(4, adjustedValue));

    const severityMapping: { [key: number]: 'low' | 'medium' | 'high' | 'critical' } = { 
      1: 'low', 
      2: 'medium', 
      3: 'high', 
      4: 'critical' 
    };
    return severityMapping[clampedValue];
  }

  /**
   * Determine if violation requires manual review
   */
  private determineReviewRequirement(
    violation: EthicalViolation,
    developer: DeveloperProfile,
    adjustedSeverity: string
  ): boolean {
    // Always require review for critical violations
    if (adjustedSeverity === 'critical') {
      return true;
    }

    // Require review for contractors on high violations
    if (developer.role.type === 'contractor' && adjustedSeverity === 'high') {
      return true;
    }

    // Require review for developers with low ethics scores
    if (developer.ethicsScore < 0.6) {
      return true;
    }

    // Require review based on role permissions
    if (developer.role.permissions.requiresReview) {
      return true;
    }

    return false;
  }

  /**
   * Assign appropriate reviewer for violation
   */
  private assignReviewer(teamContext: TeamContext, developer: DeveloperProfile): string | undefined {
    // Assign ethics champion if available
    if (teamContext.ethicsChampion && teamContext.ethicsChampion !== developer.id) {
      return teamContext.ethicsChampion;
    }

    // Find senior developer or lead in the team
    const potentialReviewers = Array.from(this.developerProfiles.values())
      .filter(profile => 
        profile.teamId === teamContext.id &&
        profile.id !== developer.id &&
        (profile.role.type === 'senior' || profile.role.type === 'lead' || profile.role.type === 'architect') &&
        profile.role.permissions.canApproveViolations
      )
      .sort((a, b) => b.ethicsScore - a.ethicsScore);

    return potentialReviewers[0]?.id;
  }

  /**
   * Generate human-readable adjustment reason
   */
  private generateAdjustmentReason(factors: WeightingFactors, developer: DeveloperProfile): string {
    const reasons: string[] = [];

    if (factors.roleMultiplier > 1.1) {
      reasons.push(`Increased severity due to ${developer.role.type} role responsibilities`);
    } else if (factors.roleMultiplier < 0.9) {
      reasons.push(`Reduced severity considering ${developer.role.type} role context`);
    }

    if (factors.experienceMultiplier > 1.1) {
      reasons.push(`Higher expectations for ${developer.experienceLevel.category} developer`);
    } else if (factors.experienceMultiplier < 0.9) {
      reasons.push(`Adjusted for developer experience level (${developer.experienceLevel.category})`);
    }

    if (factors.industryComplianceMultiplier > 1.2) {
      reasons.push('Elevated due to industry compliance requirements');
    }

    if (factors.historicalPerformanceMultiplier > 1.1) {
      reasons.push('Increased scrutiny due to previous ethics concerns');
    }

    return reasons.join('; ') || 'Standard team-based adjustment';
  }

  /**
   * Calculate team-wide risk adjustment factors
   */
  private calculateTeamRiskAdjustment(teamContext: TeamContext): {
    surveillance: number;
    discrimination: number;
    privacy: number;
    misuse: number;
    manipulation: number;
    overall: number;
  } {
    let baseAdjustment = 1.0;

    // Adjust based on team compliance level
    switch (teamContext.complianceLevel) {
      case 'high':
        baseAdjustment = 1.2;
        break;
      case 'critical':
        baseAdjustment = 1.4;
        break;
    }

    // Adjust based on recent violation trend
    let trendMultiplier = 1.0;
    switch (teamContext.recentViolationTrend) {
      case 'improving':
        trendMultiplier = 0.9;
        break;
      case 'concerning':
        trendMultiplier = 1.3;
        break;
    }

    const adjustment = baseAdjustment * trendMultiplier;

    return {
      surveillance: adjustment,
      discrimination: adjustment * 1.1, // Slightly higher for discrimination
      privacy: adjustment,
      misuse: adjustment * 1.2, // Higher for misuse in teams
      manipulation: adjustment,
      overall: adjustment
    };
  }

  /**
   * Create default profile for unknown developer
   */
  private createDefaultProfile(gitMetadata: GitCommitMetadata): DeveloperProfile {
    return {
      id: gitMetadata.email,
      name: gitMetadata.author,
      email: gitMetadata.email,
      role: {
        type: 'mid', // Default assumption
        permissions: {
          canIgnoreWarnings: false,
          canModifyPolicies: false,
          requiresReview: true,
          canApproveViolations: false,
          maxRiskThreshold: 0.7
        },
        responsibilities: ['Development'],
        ethicsWeightModifier: 1.0
      },
      experienceLevel: {
        years: 3, // Default assumption
        category: 'intermediate',
        ethicsTrainingHours: 0,
        previousViolations: 0
      },
      certifications: [],
      teamId: 'default',
      joinDate: new Date(),
      ethicsScore: 0.8 // Neutral starting score
    };
  }

  /**
   * Get anonymous developer profile for unknown users
   */
  private getAnonymousProfile(): DeveloperProfile {
    return {
      id: 'anonymous',
      name: 'Anonymous Developer',
      email: 'anonymous@example.com',
      role: {
        type: 'contractor',
        permissions: {
          canIgnoreWarnings: false,
          canModifyPolicies: false,
          requiresReview: true,
          canApproveViolations: false,
          maxRiskThreshold: 0.5
        },
        responsibilities: ['Development'],
        ethicsWeightModifier: 1.2 // Higher scrutiny for unknown developers
      },
      experienceLevel: {
        years: 0,
        category: 'novice',
        ethicsTrainingHours: 0,
        previousViolations: 0
      },
      certifications: [],
      teamId: 'unknown',
      joinDate: new Date(),
      ethicsScore: 0.5 // Lower starting score for unknown developers
    };
  }

  /**
   * Get team context for workspace
   */
  private async getTeamContext(workspacePath: string): Promise<TeamContext> {
    // Try to determine team from workspace metadata
    const workspaceName = path.basename(workspacePath);
    const existingContext = this.teamContexts.get(workspaceName);
    
    if (existingContext) {
      return existingContext;
    }

    // Create default team context
    const defaultContext: TeamContext = {
      id: workspaceName,
      name: workspaceName,
      project: workspaceName,
      industry: 'enterprise',
      complianceLevel: 'standard',
      averageExperience: 3,
      recentViolationTrend: 'stable'
    };

    this.teamContexts.set(workspaceName, defaultContext);
    return defaultContext;
  }

  /**
   * Initialize role definitions with enterprise-appropriate permissions
   */
  private initializeRoleDefinitions(): void {
    // Role definitions are handled in the individual developer profiles
    // This could be expanded to load from configuration
  }

  /**
   * Load team data from configuration or external source
   */
  private loadTeamData(): void {
    // In production, this would load from:
    // - HR systems
    // - Active Directory
    // - Configuration files
    // - Team management platforms
    
    // For now, we'll use dynamic discovery based on Git metadata
  }

  /**
   * Update developer ethics score based on violation history
   */
  public updateDeveloperEthicsScore(developerId: string, violationSeverity: string): void {
    const developer = this.developerProfiles.get(developerId);
    if (!developer) return;

    const severityImpact = {
      'low': -0.01,
      'medium': -0.03,
      'high': -0.07,
      'critical': -0.15
    };

    const impact = severityImpact[violationSeverity as keyof typeof severityImpact] || 0;
    developer.ethicsScore = Math.max(0, developer.ethicsScore + impact);
    developer.experienceLevel.previousViolations++;
  }

  /**
   * Get team ethics summary
   */
  public getTeamEthicsSummary(teamId: string): {
    averageEthicsScore: number;
    totalViolations: number;
    riskProfile: string;
    recommendedActions: string[];
  } {
    const teamMembers = Array.from(this.developerProfiles.values())
      .filter(profile => profile.teamId === teamId);

    const averageEthicsScore = teamMembers.length > 0 
      ? teamMembers.reduce((sum, profile) => sum + profile.ethicsScore, 0) / teamMembers.length
      : 0;

    const totalViolations = teamMembers.reduce(
      (sum, profile) => sum + profile.experienceLevel.previousViolations, 0
    );

    let riskProfile = 'Low';
    if (averageEthicsScore < 0.6 || totalViolations > teamMembers.length * 5) {
      riskProfile = 'High';
    } else if (averageEthicsScore < 0.8 || totalViolations > teamMembers.length * 2) {
      riskProfile = 'Medium';
    }

    const recommendedActions: string[] = [];
    if (averageEthicsScore < 0.7) {
      recommendedActions.push('Schedule team ethics training');
    }
    if (totalViolations > teamMembers.length * 3) {
      recommendedActions.push('Implement additional code review requirements');
    }
    if (teamMembers.some(m => m.role.type === 'contractor' && m.ethicsScore < 0.6)) {
      recommendedActions.push('Provide contractor-specific ethics orientation');
    }

    return {
      averageEthicsScore,
      totalViolations,
      riskProfile,
      recommendedActions
    };
  }
}
