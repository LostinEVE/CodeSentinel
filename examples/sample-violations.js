/**
 * Sample User Application System - CONTAINS ETHICAL VIOLATIONS FOR DEMONSTRATION
 * This file intentionally contains several ethical violations to demonstrate
 * the Ethics Engine's detection capabilities.
 */

class UserApplicationSystem {
  constructor(config) {
    this.config = config;
    this.applications = [];
    this.rejectedApplications = [];
  }

  /**
   * ETHICAL VIOLATION 1: Nationality-based discrimination (CRITICAL)
   * This function demonstrates the exact pattern our engine is designed to catch
   */
  processApplication(applicant) {
    // This is a critical ethical violation - nationality-based filtering
    if (applicant.nationality === "china" || applicant.nationality === "iran") {
      this.rejectedApplications.push({
        ...applicant,
        reason: "Geographic restrictions",
        timestamp: Date.now()
      });
      return { status: "rejected", reason: "Not available in your region" };
    }

    // Additional demographic filtering (also problematic)
    if (applicant.age > 50) {
      return { status: "flagged", reason: "Age review required" };
    }

    return this.approveApplication(applicant);
  }

  /**
   * ETHICAL VIOLATION 2: Surveillance without clear consent
   */
  enableLocationTracking(user) {
    // Automatically enable location tracking without explicit consent
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        this.trackUserLocation(user.id, position);
      });
    }
  }

  /**
   * ETHICAL VIOLATION 3: Privacy violation - unencrypted sensitive data
   */
  storeUserCredentials(user, password) {
    // Critical violation: storing password in plain text
    user.password = password; // plain text storage
    user.ssn = user.socialSecurityNumber; // storing sensitive PII
    
    this.saveToDatabase(user);
  }

  /**
   * ETHICAL VIOLATION 4: Potential authentication bypass (backdoor)
   */
  authenticateUser(username, password) {
    // Critical security backdoor
    if (username === "admin" && password === "debug") {
      return { 
        authenticated: true, 
        role: "admin",
        bypass: true // bypass normal authentication
      };
    }

    return this.normalAuthentication(username, password);
  }

  /**
   * ETHICAL VIOLATION 5: Hidden manipulation pattern
   */
  calculateTotalCost(basePrice, user) {
    const serviceFee = basePrice * 0.15; // 15% service fee
    
    // Hidden fee that's not disclosed upfront
    const hiddenProcessingFee = basePrice * 0.05; // hidden fee
    
    return {
      basePrice,
      serviceFee,
      // Processing fee is intentionally not shown in the UI
      total: basePrice + serviceFee + hiddenProcessingFee
    };
  }

  /**
   * ETHICAL VIOLATION 6: Discriminatory filtering in data processing
   */
  filterEligibleCandidates(candidates) {
    return candidates.filter(candidate => {
      // Multiple discriminatory filters
      if (candidate.gender === "female" && candidate.hasChildren) {
        return false; // Gender + family status discrimination
      }
      
      if (candidate.religion === "muslim" || candidate.religion === "jewish") {
        return false; // Religious discrimination
      }
      
      return true;
    });
  }

  /**
   * ETHICAL VIOLATION 7: Invasive surveillance capabilities
   */
  enableAdvancedMonitoring(userId) {
    // Excessive surveillance without clear justification
    this.monitorKeystrokes(userId);
    this.trackMouseMovements(userId);
    this.captureScreenActivity(userId);
    
    // Access camera and microphone without explicit permission
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      }).then(stream => {
        this.recordUserActivity(userId, stream);
      });
    }
  }

  /**
   * Legitimate functions (no violations)
   */
  approveApplication(applicant) {
    this.applications.push(applicant);
    return { status: "approved", id: this.generateId() };
  }

  normalAuthentication(username, password) {
    // Proper authentication logic would go here
    return { authenticated: false };
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Additional standalone violations for comprehensive testing

/**
 * ETHICAL VIOLATION 8: Dynamic code execution with user input
 */
function processUserCommand(userInput) {
  // Critical security violation - code injection vulnerability
  eval(userInput.command); // Direct eval of user input
}

/**
 * ETHICAL VIOLATION 9: Bias in algorithmic decision making
 */
function calculateCreditScore(applicant) {
  let score = applicant.baseScore;
  
  // Biased scoring based on protected characteristics
  if (applicant.race === "african_american") {
    score -= 50; // Racial bias in scoring
  }
  
  if (applicant.zipCode.startsWith("90")) {
    score += 25; // Geographic bias
  }
  
  return score;
}

/**
 * ETHICAL VIOLATION 10: Deceptive UI patterns
 */
function createSubscriptionInterface() {
  return {
    html: `
      <div>
        <button onclick="subscribe()">Start Free Trial</button>
        <div style="display:none">
          <!-- Hidden auto-renewal clause -->
          <p>By clicking above, you agree to automatic renewal at $99/month</p>
        </div>
      </div>
    `,
    // Deceptive pattern: hiding important information
    hideRenewalTerms: true
  };
}

module.exports = {
  UserApplicationSystem,
  processUserCommand,
  calculateCreditScore,
  createSubscriptionInterface
};
