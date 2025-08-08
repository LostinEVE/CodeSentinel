// Enterprise Ethics Engine - Full Integration Demonstration
// This file contains violations that will trigger all four addon modules

// 1. REMEDIATION ENGINE TRIGGERS
function discriminatoryHiring(applicant) {
  // Age discrimination violation - will trigger automated remediation
  if (applicant.age > 45) {
    return false; // Discriminatory age filter
  }
  
  // Gender bias violation - will trigger LLM-assisted remediation
  if (applicant.gender === 'female' && applicant.department === 'engineering') {
    applicant.salary *= 0.8; // Gender pay gap
  }
  
  return true;
}

// 2. TEAM AWARENESS ENGINE TRIGGERS
function surveillanceSystem() {
  // Privacy violation with team context consideration
  const userLocation = navigator.geolocation.getCurrentPosition();
  const userContacts = getUserContacts(); // Excessive data collection
  
  // Track user without consent
  setInterval(() => {
    sendUserDataToServer(userLocation, userContacts);
  }, 1000);
}

// 3. GIT PRE-COMMIT ENFORCEMENT TRIGGERS
function authenticationBypass() {
  // Critical security violation that should block commits
  const masterPassword = "admin123"; // Hardcoded credentials
  
  if (password === masterPassword) {
    return true; // Authentication bypass
  }
  
  // Backdoor access - critical violation
  if (username === "debug_user" || password === "backdoor") {
    return true;
  }
}

// 4. PATENT INFRINGEMENT SCANNER TRIGGERS
function rsa_encrypt(message, key) {
  // Potential RSA algorithm implementation - patent risk
  const modulus = key.n;
  const exponent = key.e;
  
  // RSA encryption process (simplified)
  let encrypted = 1;
  for (let i = 0; i < exponent; i++) {
    encrypted = (encrypted * message) % modulus;
  }
  
  return encrypted;
}

function lzw_compress(data) {
  // LZW compression algorithm - high patent risk
  const dictionary = {};
  let dictSize = 256;
  
  // Initialize dictionary with single characters
  for (let i = 0; i < 256; i++) {
    dictionary[String.fromCharCode(i)] = i;
  }
  
  let w = "";
  const result = [];
  
  for (let i = 0; i < data.length; i++) {
    const c = data.charAt(i);
    const wc = w + c;
    
    if (dictionary[wc]) {
      w = wc;
    } else {
      result.push(dictionary[w]);
      dictionary[wc] = dictSize++;
      w = c;
    }
  }
  
  if (w !== "") {
    result.push(dictionary[w]);
  }
  
  return result;
}

// 5. MULTIPLE VIOLATION SCENARIOS
class UserProfiler {
  constructor() {
    this.userData = {};
  }
  
  profileUser(userId) {
    // Surveillance + discrimination combo
    const user = this.getUserData(userId);
    
    // Racial profiling algorithm
    if (user.name.includes("Mohammed") || user.name.includes("Ahmed")) {
      user.riskScore += 50; // Discriminatory profiling
    }
    
    // Age discrimination in insurance
    if (user.age > 60) {
      user.insuranceRate *= 2.5; // Age-based discrimination
    }
    
    // Gender bias in credit scoring
    if (user.gender === 'female' && user.maritalStatus === 'single') {
      user.creditScore -= 100; // Discriminatory credit scoring
    }
    
    // Privacy violation - excessive tracking
    this.trackUserBehavior(user);
    this.shareWithThirdParties(user);
    
    return user;
  }
  
  // One-click purchase implementation - patent risk
  oneClickPurchase(item, user) {
    // Single-click purchasing mechanism - patent infringement risk
    if (user.paymentMethods.length > 0) {
      const payment = user.paymentMethods[0];
      return this.processPayment(payment, item.price);
    }
  }
  
  // Progress bar during download - patent risk
  downloadWithProgress(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    
    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        this.updateProgressBar(percentComplete); // Patent-protected progress indication
      }
    };
    
    xhr.send();
  }
  
  // Auto-complete search - patent risk
  autoCompleteSearch(query) {
    // Real-time search suggestions - potential patent infringement
    const suggestions = this.generateSuggestions(query);
    this.displayTypeaheadResults(suggestions);
  }
}

// 6. FINANCIAL MANIPULATION
function financialReporting() {
  // Manipulation violation for SOX compliance
  const actualRevenue = 1000000;
  const reportedRevenue = actualRevenue * 1.2; // Revenue inflation
  
  // Hide liabilities
  const actualLiabilities = 500000;
  const reportedLiabilities = actualLiabilities * 0.8; // Liability concealment
  
  return {
    revenue: reportedRevenue,
    liabilities: reportedLiabilities,
    // Missing: audit trail and proper documentation
  };
}

// 7. HEALTHCARE PRIVACY VIOLATIONS
function patientDataHandler() {
  // HIPAA violation triggers
  const patientRecords = getAllPatientData(); // Excessive access
  
  // Share with unauthorized parties
  patientRecords.forEach(patient => {
    if (patient.condition === 'HIV' || patient.condition === 'cancer') {
      // Share sensitive health information without consent
      shareWithInsuranceCompany(patient);
      shareWithEmployer(patient);
    }
  });
  
  // Store without encryption
  localStorage.setItem('patient_data', JSON.stringify(patientRecords));
}

// 8. DARK PATTERNS IN UI
function manipulativeInterface() {
  // UI manipulation patterns
  function hideUnsubscribeButton() {
    document.getElementById('unsubscribe').style.display = 'none';
  }
  
  function preCheckPremiumOption() {
    // Pre-select expensive options
    document.getElementById('premium_plan').checked = true;
    document.getElementById('basic_plan').style.fontSize = '8px';
  }
  
  function createFakeUrgency() {
    // Manipulative urgency messaging
    alert("Only 2 spots left! Buy now or lose this opportunity forever!");
  }
  
  // Confusing cancellation process
  function makeCancellationHard() {
    const cancelButton = document.getElementById('cancel');
    cancelButton.onclick = () => {
      alert("Are you sure you want to miss out on exclusive benefits?");
      return false; // Prevent actual cancellation
    };
  }
}

// 9. COMPREHENSIVE VIOLATION EXAMPLE
async function comprehensiveViolationExample() {
  // This function contains multiple violation types that will trigger
  // all four enterprise addon modules simultaneously
  
  // 1. Remediation Engine will suggest fixes
  const users = await getAllUsers();
  const filteredUsers = users.filter(user => {
    // Age and gender discrimination
    return user.age < 50 && user.gender === 'male';
  });
  
  // 2. Team Awareness Engine will adjust severity based on developer role
  const sensitiveData = await accessSensitiveDatabase();
  sendToUntrustedThirdParty(sensitiveData);
  
  // 3. Git Pre-Commit Enforcement will analyze for blocking violations
  const apiKey = "sk-hardcoded-api-key-12345"; // Critical security violation
  const adminPassword = "admin"; // Authentication bypass
  
  // 4. Patent Infringement Scanner will detect algorithmic risks
  const compressedData = lzw_compress(sensitiveData.toString());
  const encryptedData = rsa_encrypt(compressedData, {n: 12345, e: 65537});
  
  return {
    processedUsers: filteredUsers,
    data: encryptedData,
    timestamp: new Date(),
    // Ethical violations summary:
    // - Discrimination: age, gender filtering
    // - Privacy: unauthorized data sharing
    // - Security: hardcoded credentials, backdoors
    // - Patent: RSA + LZW implementation
    // - Manipulation: hidden user filtering
  };
}

export {
  discriminatoryHiring,
  surveillanceSystem, 
  authenticationBypass,
  rsa_encrypt,
  lzw_compress,
  UserProfiler,
  financialReporting,
  patientDataHandler,
  manipulativeInterface,
  comprehensiveViolationExample
};
