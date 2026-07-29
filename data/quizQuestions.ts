import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ===== General Security Concepts (12%) =====
  {
    id: 'q001',
    question: 'Which principle of the CIA Triad ensures that information is not altered or corrupted?',
    options: ['Confidentiality', 'Integrity', 'Availability', 'Authentication'],
    correctAnswer: 1,
    explanation:
      'Integrity ensures that data has not been modified, corrupted, or deleted by unauthorized users. It verifies authenticity and maintains the accuracy of information.',
    difficulty: 'easy',
    domain: 'general_security_concepts',
  },
  {
    id: 'q002',
    question: 'What is the primary goal of a security control?',
    options: ['Eliminate all risks', 'Reduce risk to an acceptable level', 'Detect all threats', 'Comply with regulations'],
    correctAnswer: 1,
    explanation:
      'Security controls aim to reduce risk to an acceptable level (risk mitigation), not eliminate it completely. Complete risk elimination is impossible in practice.',
    difficulty: 'easy',
    domain: 'general_security_concepts',
  },
  {
    id: 'q003',
    question: 'Which type of control is designed to stop an attack from occurring?',
    options: ['Detective', 'Preventive', 'Corrective', 'Compensating'],
    correctAnswer: 1,
    explanation:
      'Preventive controls are designed to stop an attack or unwanted event from occurring. Examples include firewalls, access controls, and encryption.',
    difficulty: 'easy',
    domain: 'general_security_concepts',
  },
  {
    id: 'q004',
    question: 'What does non-repudiation ensure in security?',
    options: [
      'Users cannot deny their actions',
      'Data cannot be repeated',
      'Systems are not replicable',
      'Backups are not necessary',
    ],
    correctAnswer: 0,
    explanation:
      'Non-repudiation ensures that a user cannot deny performing an action. Digital signatures provide non-repudiation by proving who originated and sent a message.',
    difficulty: 'medium',
    domain: 'general_security_concepts',
  },
  {
    id: 'q005',
    question: 'Which framework provides guidelines for identifying, assessing, and managing cyber risks?',
    options: ['NIST Cybersecurity Framework', 'OWASP Top 10', 'MITRE ATT&CK', 'ISO 27001'],
    correctAnswer: 0,
    explanation:
      'The NIST Cybersecurity Framework provides organizations with guidelines for managing and reducing cybersecurity risks. It includes Identify, Protect, Detect, Respond, and Recover functions.',
    difficulty: 'medium',
    domain: 'general_security_concepts',
  },
  {
    id: 'q006',
    question: 'What is the purpose of defense in depth?',
    options: [
      'Use multiple layers of security controls',
      'Deploy only the strongest controls',
      'Use only preventive controls',
      'Eliminate the need for monitoring',
    ],
    correctAnswer: 0,
    explanation:
      'Defense in depth uses multiple layers of security controls so that if one layer fails, others continue to provide protection. This reduces overall risk through redundancy.',
    difficulty: 'medium',
    domain: 'general_security_concepts',
  },
  {
    id: 'q007',
    question: 'Which principle states that users should only have the minimum permissions needed to perform their job?',
    options: ['Defense in depth', 'Separation of duties', 'Least privilege', 'Diversity of controls'],
    correctAnswer: 2,
    explanation:
      'The principle of least privilege restricts user access rights to only what is necessary for their job function, minimizing the potential impact of compromised accounts.',
    difficulty: 'medium',
    domain: 'general_security_concepts',
  },
  {
    id: 'q008',
    question: 'In the context of security controls, what is a compensating control?',
    options: [
      'A control that replaces a faulty detection system',
      'An alternative control used when primary control cannot be implemented',
      'A control that monitors employee compensation',
      'A control that regulates data backup frequency',
    ],
    correctAnswer: 1,
    explanation:
      'A compensating control is an alternative security measure implemented when a primary control cannot be used due to cost, technical limitations, or other constraints.',
    difficulty: 'hard',
    domain: 'general_security_concepts',
  },
  {
    id: 'q009',
    question: 'Which authentication factor is based on something the user knows?',
    options: ['Biometric data', 'Security token', 'Password', 'Location'],
    correctAnswer: 2,
    explanation:
      'Passwords are knowledge-based factors, while biometric data is inherence-based and tokens are possession-based.',
    difficulty: 'easy',
    domain: 'general_security_concepts',
  },
  {
    id: 'q010',
    question: 'What is the primary benefit of asymmetric encryption compared to symmetric encryption?',
    options: [
      'It is always faster',
      'It uses the same key for encryption and decryption',
      'It enables secure key exchange without sharing a private key',
      'It does not require certificates',
    ],
    correctAnswer: 2,
    explanation:
      'Asymmetric encryption uses a public/private key pair, allowing secure key exchange without sharing a private key, which is especially useful for secure communications and digital signatures.',
    difficulty: 'medium',
    domain: 'general_security_concepts',
  },
  {
    id: 'q011',
    question: 'Which control type is used to identify a security incident after it occurs?',
    options: ['Deterrent', 'Detective', 'Preventive', 'Corrective'],
    correctAnswer: 1,
    explanation:
      'Detective controls, such as intrusion detection systems and audits, are designed to identify and report security events after they occur.',
    difficulty: 'medium',
    domain: 'general_security_concepts',
  },
  {
    id: 'q012',
    question: 'What is the primary purpose of digital certificates in PKI?',
    options: [
      'To store backup data securely',
      'To verify the identity of an entity and enable secure communication',
      'To encrypt all data at rest',
      'To replace passwords for user login',
    ],
    correctAnswer: 1,
    explanation:
      'Digital certificates bind a public key to an entity’s identity, allowing trust in secure communications and authentication using public key infrastructure (PKI).',
    difficulty: 'medium',
    domain: 'general_security_concepts',
  },
  {
    id: 'q013',
    question: 'Which technique is best for verifying that a file has not been altered?',
    options: ['Hashing the file and comparing the digest', 'Encrypting the file', 'Compressing the file', 'Backing up the file'],
    correctAnswer: 0,
    explanation:
      'Hashing produces a fixed digest representing the file contents; comparing that digest later verifies file integrity and detects unauthorized changes.',
    difficulty: 'easy',
    domain: 'general_security_concepts',
  },
  {
    id: 'q014',
    question: 'Which factor is not part of multi-factor authentication?',
    options: ['Something you know', 'Something you have', 'Something you are', 'Something you own'],
    correctAnswer: 3,
    explanation:
      'Multi-factor authentication typically includes something you know, something you have, and something you are; "something you own" is not a standard category.',
    difficulty: 'hard',
    domain: 'general_security_concepts',
  },
  {
    id: 'q015',
    question: 'Which type of security control helps restore a system after an incident?',
    options: ['Preventive', 'Detective', 'Corrective', 'Deterrent'],
    correctAnswer: 2,
    explanation:
      'Corrective controls are designed to restore systems and data affected by an incident, such as restoring from backups or applying patches.',
    difficulty: 'medium',
    domain: 'general_security_concepts',
  },
  {
    id: 'q016',
    question: 'What is the main difference between authentication and authorization?',
    options: [
      'Authentication verifies identity; authorization determines access rights',
      'Authorization verifies identity; authentication determines access rights',
      'They are the same thing',
      'Authorization is only used for network devices',
    ],
    correctAnswer: 0,
    explanation:
      'Authentication confirms who a user is, while authorization determines what resources that authenticated user is allowed to access.',
    difficulty: 'easy',
    domain: 'general_security_concepts',
  },

  // ===== Threats, Vulnerabilities & Mitigations (22%) =====
  {
    id: 'q101',
    question: 'What is a zero-day vulnerability?',
    options: [
      'A vulnerability patched within 24 hours',
      'A security flaw unknown to the vendor with no available patch',
      'A vulnerability affecting systems zero days old',
      'A vulnerability in the BIOS firmware',
    ],
    correctAnswer: 1,
    explanation:
      'A zero-day vulnerability is a software flaw unknown to the vendor, for which no patch exists. Attackers can exploit it before the vendor becomes aware and releases a fix.',
    difficulty: 'easy',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q102',
    question: 'Which type of malware replicates itself and spreads to other systems without user action?',
    options: ['Trojan', 'Worm', 'Ransomware', 'Adware'],
    correctAnswer: 1,
    explanation:
      'A worm is self-replicating malware that spreads across networks without requiring user action. Unlike viruses, worms do not need to attach to a host file.',
    difficulty: 'easy',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q103',
    question: 'What does a distributed denial of service (DDoS) attack aim to accomplish?',
    options: ['Steal user credentials', 'Make a service unavailable', 'Corrupt data', 'Encrypt files for ransom'],
    correctAnswer: 1,
    explanation:
      'A DDoS attack overwhelms a target system with traffic from multiple sources to make the service unavailable to legitimate users, effectively denying service.',
    difficulty: 'easy',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q104',
    question: 'Which attack involves manipulating a user into revealing sensitive information by posing as a trustworthy entity?',
    options: ['SQL injection', 'Phishing', 'Man-in-the-middle', 'Session hijacking'],
    correctAnswer: 1,
    explanation:
      'Phishing is a social engineering attack where attackers impersonate trustworthy entities via email, messages, or websites to trick users into divulging sensitive information like passwords or credit card numbers.',
    difficulty: 'easy',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q105',
    question: 'What is a common mitigation for SQL injection vulnerabilities?',
    options: [
      'Disable all database queries',
      'Use prepared statements and parameterized queries',
      'Require HTTPS only',
      'Implement multi-factor authentication',
    ],
    correctAnswer: 1,
    explanation:
      'Prepared statements (parameterized queries) separate SQL code from data, preventing attackers from injecting malicious SQL commands. This is the primary defense against SQL injection.',
    difficulty: 'medium',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q106',
    question: 'Which vulnerability occurs when user input is not properly validated?',
    options: [
      'Cross-site scripting (XSS)',
      'Privilege escalation',
      'Denial of service',
      'Eavesdropping',
    ],
    correctAnswer: 0,
    explanation:
      'Cross-site scripting (XSS) occurs when unvalidated user input is reflected in web pages, allowing attackers to inject malicious scripts that execute in users\' browsers.',
    difficulty: 'medium',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q107',
    question: 'What type of malware encrypts a victim\'s files and demands payment for decryption?',
    options: ['Spyware', 'Ransomware', 'Rootkit', 'Logic bomb'],
    correctAnswer: 1,
    explanation:
      'Ransomware encrypts a user\'s or organization\'s data and demands payment (ransom) for providing the decryption key. It is a significant threat to business continuity.',
    difficulty: 'easy',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q108',
    question: 'What is a man-in-the-middle (MITM) attack?',
    options: [
      'An attack on a specific employee in the middle of an organization',
      'An attacker intercepting communications between two parties',
      'A denial of service attack from a central location',
      'An attempt to escalate privileges to administrator level',
    ],
    correctAnswer: 1,
    explanation:
      'A MITM attack occurs when an attacker intercepts and potentially alters communications between two parties. The attacker can eavesdrop and modify data without either party knowing.',
    difficulty: 'medium',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q109',
    question: 'How can you prevent privilege escalation attacks?',
    options: [
      'Disable all security alerts',
      'Regularly update systems and follow least privilege principles',
      'Use the same password for all accounts',
      'Enable all user accounts as administrators',
    ],
    correctAnswer: 1,
    explanation:
      'Privilege escalation is mitigated by keeping systems patched, applying the principle of least privilege, enforcing strong authentication, and monitoring for suspicious activity.',
    difficulty: 'medium',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q110',
    question: 'What does a rootkit allow an attacker to do?',
    options: [
      'Access only non-critical files',
      'Gain unrestricted administrative access to a system',
      'Steal passwords only',
      'Disable firewalls only',
    ],
    correctAnswer: 1,
    explanation:
      'A rootkit provides attackers with deep system access and control while remaining hidden. It grants administrative (root-level) privileges, making it difficult to detect and remove.',
    difficulty: 'hard',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q111',
    question: 'What is the purpose of a vulnerability scan?',
    options: [
      'Exploit vulnerabilities in a system',
      'Identify missing patches and known weaknesses',
      'Encrypt sensitive data',
      'Monitor employee activity',
    ],
    correctAnswer: 1,
    explanation:
      'A vulnerability scan identifies missing patches, misconfigurations, and known weaknesses so they can be remediated before attackers exploit them.',
    difficulty: 'easy',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q112',
    question: 'Which attack uses a compromised website to target visitors with malware?',
    options: ['Watering hole', 'Whaling', 'Spear phishing', 'Brute force'],
    correctAnswer: 0,
    explanation:
      'A watering hole attack compromises websites likely to be visited by a target group, then infects visitors when they access the site.',
    difficulty: 'medium',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q113',
    question: 'What distinguishes an advanced persistent threat (APT)?',
    options: [
      'It is always caused by insiders',
      'It uses a one-time attack with no follow-up',
      'It is a stealthy, long-term attack focused on targeted objectives',
      'It only impacts mobile devices',
    ],
    correctAnswer: 2,
    explanation:
      'APTs are stealthy, targeted attacks that persist over time to maintain unauthorized access and achieve specific objectives.',
    difficulty: 'hard',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q114',
    question: 'Which social engineering technique relies on creating a believable but fake scenario to gain trust?',
    options: ['Pretexting', 'Spoofing', 'Vishing', 'Tailgating'],
    correctAnswer: 0,
    explanation:
      'Pretexting involves inventing a convincing story or scenario to gain someone’s trust and trick them into revealing information.',
    difficulty: 'medium',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q115',
    question: 'Which vulnerability is most likely exploited by a buffer overflow attack?',
    options: ['Incorrect authentication', 'Unvalidated input handling', 'Weak encryption', 'Expired certificates'],
    correctAnswer: 1,
    explanation:
      'Buffer overflow attacks exploit improper input validation and memory management, allowing attackers to overwrite memory and execute arbitrary code.',
    difficulty: 'hard',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q116',
    question: 'What is the main goal of a penetration test?',
    options: [
      'To deploy security patches automatically',
      'To assess security by simulating an attacker and finding vulnerabilities',
      'To create user security awareness training',
      'To encrypt all sensitive files',
    ],
    correctAnswer: 1,
    explanation:
      'A penetration test simulates an attacker to identify exploitable vulnerabilities and evaluate the effectiveness of security controls.',
    difficulty: 'medium',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q117',
    question: 'Which term describes software that appears useful but performs malicious actions in the background?',
    options: ['Backdoor', 'Trojan', 'Worm', 'Rootkit'],
    correctAnswer: 1,
    explanation:
      'A Trojan disguises itself as legitimate software while executing malicious activities, often providing unauthorized access.',
    difficulty: 'easy',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q118',
    question: 'What type of attack attempts to trick users into approving unwanted actions in their web browser?',
    options: ['CSRF', 'XSS', 'Pharming', 'Brute force'],
    correctAnswer: 0,
    explanation:
      'Cross-site request forgery (CSRF) tricks authenticated users into executing actions they did not intend by leveraging their browser session.',
    difficulty: 'medium',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q119',
    question: 'Which threat actor is most likely to have legitimate insider access to the environment?',
    options: ['Script kiddie', 'Insider', 'Hacktivist', 'Nation-state'],
    correctAnswer: 1,
    explanation:
      'An insider has authorized access to systems and data, which can make their actions more dangerous if they are negligent or malicious.',
    difficulty: 'easy',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q120',
    question: 'Which mitigation reduces the impact of malicious email attachments?',
    options: [
      'Disable software updates',
      'Use email filtering and user awareness training',
      'Allow all attachments from internal users',
      'Use FTP instead of email',
    ],
    correctAnswer: 1,
    explanation:
      'Email filtering can block malicious attachments, and security awareness training helps users recognize and avoid dangerous messages.',
    difficulty: 'easy',
    domain: 'threats_vulnerabilities_mitigations',
  },

  // ===== Security Architecture (18%) =====
  {
    id: 'q201',
    question: 'What is the primary function of a firewall?',
    options: [
      'Encrypt all network traffic',
      'Monitor and control network traffic based on security rules',
      'Scan for viruses on all files',
      'Automatically patch systems',
    ],
    correctAnswer: 1,
    explanation:
      'A firewall filters incoming and outgoing network traffic based on predefined security policies, acting as a barrier between trusted internal networks and untrusted external networks.',
    difficulty: 'easy',
    domain: 'security_architecture',
  },
  {
    id: 'q202',
    question: 'What is an intrusion detection system (IDS)?',
    options: [
      'A system that blocks all network traffic',
      'A system that monitors network traffic and detects suspicious activity',
      'A firewall that filters emails',
      'A system that encrypts all data',
    ],
    correctAnswer: 1,
    explanation:
      'An IDS monitors network and system activity for signs of attacks or security policy violations, alerting administrators when suspicious activity is detected.',
    difficulty: 'easy',
    domain: 'security_architecture',
  },
  {
    id: 'q203',
    question: 'What is the difference between an IDS and an IPS?',
    options: [
      'An IDS blocks threats while an IPS detects them',
      'An IDS detects threats while an IPS blocks them',
      'They are the same technology',
      'An IPS is used for encryption',
    ],
    correctAnswer: 1,
    explanation:
      'An IDS (Intrusion Detection System) detects and alerts on threats, while an IPS (Intrusion Prevention System) detects and actively blocks malicious traffic.',
    difficulty: 'medium',
    domain: 'security_architecture',
  },
  {
    id: 'q204',
    question: 'What is network segmentation used for?',
    options: [
      'To increase network speed',
      'To isolate critical systems and limit lateral movement of threats',
      'To reduce the number of routers needed',
      'To eliminate the need for firewalls',
    ],
    correctAnswer: 1,
    explanation:
      'Network segmentation divides a network into smaller isolated segments, limiting lateral movement of threats and containing breaches to specific network zones.',
    difficulty: 'medium',
    domain: 'security_architecture',
  },
  {
    id: 'q205',
    question: 'What is a demilitarized zone (DMZ)?',
    options: [
      'A region where cybersecurity is not enforced',
      'A network segment between internal networks and the internet, used for public-facing services',
      'An area where military networks are protected',
      'A zone where all encryption is disabled',
    ],
    correctAnswer: 1,
    explanation:
      'A DMZ is a network segment positioned between an internal network and the internet. It hosts public-facing services while protecting the internal network from direct exposure.',
    difficulty: 'medium',
    domain: 'security_architecture',
  },
  {
    id: 'q206',
    question: 'Which type of encryption uses two mathematically related keys?',
    options: ['Symmetric encryption', 'Asymmetric encryption', 'Hashing', 'Substitution cipher'],
    correctAnswer: 1,
    explanation:
      'Asymmetric encryption (public-key cryptography) uses two related keys: a public key for encryption and a private key for decryption, enabling secure key exchange and digital signatures.',
    difficulty: 'medium',
    domain: 'security_architecture',
  },
  {
    id: 'q207',
    question: 'What is a virtual private network (VPN) used for?',
    options: [
      'To increase Internet speed',
      'To create an encrypted tunnel for secure remote communication',
      'To replace firewalls',
      'To eliminate the need for passwords',
    ],
    correctAnswer: 1,
    explanation:
      'A VPN creates an encrypted tunnel for secure communication over untrusted networks, protecting data from interception and allowing secure remote access to internal resources.',
    difficulty: 'easy',
    domain: 'security_architecture',
  },
  {
    id: 'q208',
    question: 'What is the purpose of a reverse proxy?',
    options: [
      'To block all inbound traffic',
      'To forward client requests to backend servers while hiding server details',
      'To encrypt only outbound traffic',
      'To eliminate the need for firewalls',
    ],
    correctAnswer: 1,
    explanation:
      'A reverse proxy receives client requests and forwards them to backend servers, hiding server architecture from external users and providing load balancing and security benefits.',
    difficulty: 'hard',
    domain: 'security_architecture',
  },
  {
    id: 'q209',
    question: 'Which protocol is used to securely transfer files over a network?',
    options: ['FTP', 'SFTP', 'HTTP', 'SMTP'],
    correctAnswer: 1,
    explanation:
      'SFTP (SSH File Transfer Protocol) provides encrypted file transfer over SSH, protecting credentials and data from interception, unlike unencrypted FTP.',
    difficulty: 'easy',
    domain: 'security_architecture',
  },
  {
    id: 'q210',
    question: 'What is a certificate authority (CA)?',
    options: [
      'A server that issues IP addresses',
      'An entity that issues and validates digital certificates for authentication and encryption',
      'A system that monitors certificate usage',
      'A device that generates encryption keys',
    ],
    correctAnswer: 1,
    explanation:
      'A Certificate Authority (CA) is a trusted entity that issues digital certificates after verifying the identity of requesters, enabling secure SSL/TLS communications and digital signatures.',
    difficulty: 'medium',
    domain: 'security_architecture',
  },

  // ===== Security Operations (28%) =====
  {
    id: 'q301',
    question: 'What is the primary role of a Security Information and Event Management (SIEM) system?',
    options: [
      'To encrypt all data',
      'To collect, analyze, and correlate security logs from multiple sources',
      'To block all network traffic',
      'To manage user passwords',
    ],
    correctAnswer: 1,
    explanation:
      'A SIEM collects and analyzes logs from various sources (firewalls, IDS, servers) to detect security incidents, monitor compliance, and provide real-time visibility into security events.',
    difficulty: 'easy',
    domain: 'security_operations',
  },
  {
    id: 'q302',
    question: 'What is the first step in the incident response process?',
    options: ['Recovery', 'Detection', 'Preparation', 'Containment'],
    correctAnswer: 2,
    explanation:
      'Preparation is the first step in incident response, involving establishing policies, training teams, acquiring tools, and creating playbooks before incidents occur.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q303',
    question: 'What is the goal of the containment phase in incident response?',
    options: [
      'To identify who caused the incident',
      'To stop the attack and limit its spread',
      'To restore all systems to normal operation',
      'To document lessons learned',
    ],
    correctAnswer: 1,
    explanation:
      'Containment aims to stop the ongoing attack and limit its impact by isolating affected systems, disabling compromised accounts, and preventing further lateral movement.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q304',
    question: 'What is a honeypot in cybersecurity?',
    options: [
      'A password protected system',
      'A decoy system designed to attract and detect attackers',
      'A backup storage system',
      'A system that encrypts files',
    ],
    correctAnswer: 1,
    explanation:
      'A honeypot is a decoy system with intentional vulnerabilities that attracts attackers, allowing security teams to study attack methods and divert them from real systems.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q305',
    question: 'What is vulnerability scanning?',
    options: [
      'Manually checking each system for flaws',
      'Using automated tools to identify security weaknesses in systems',
      'Blocking all network ports',
      'Requiring periodic password changes',
    ],
    correctAnswer: 1,
    explanation:
      'Vulnerability scanning uses automated tools to systematically scan systems for known security vulnerabilities, misconfigurations, and policy violations.',
    difficulty: 'easy',
    domain: 'security_operations',
  },
  {
    id: 'q306',
    question: 'What is penetration testing?',
    options: [
      'Testing how well passwords penetrate security',
      'Simulating real-world attacks to identify vulnerabilities',
      'Testing the durability of physical locks',
      'Verifying that encryption is unbreakable',
    ],
    correctAnswer: 1,
    explanation:
      'Penetration testing involves authorized simulated attacks on systems to identify vulnerabilities and assess security controls before malicious actors can exploit them.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q307',
    question: 'What is log aggregation used for?',
    options: [
      'To delete old logs',
      'To centralize logs from multiple sources for analysis and monitoring',
      'To encrypt log files',
      'To reduce system performance',
    ],
    correctAnswer: 1,
    explanation:
      'Log aggregation centralizes logs from multiple sources into a single repository, enabling comprehensive analysis, threat detection, and compliance auditing.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q308',
    question: 'What is a false positive in security monitoring?',
    options: [
      'A real security threat that is detected',
      'A benign activity incorrectly flagged as a security threat',
      'A successful attack that goes undetected',
      'A misconfigured firewall rule',
    ],
    correctAnswer: 1,
    explanation:
      'A false positive is when security monitoring systems incorrectly identify benign activity as a threat, causing wasted investigation time and alert fatigue.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q309',
    question: 'What is the MITRE ATT&CK framework used for?',
    options: [
      'To attack systems',
      'To provide a knowledge base of adversary tactics and techniques',
      'To manage passwords',
      'To encrypt data',
    ],
    correctAnswer: 1,
    explanation:
      'MITRE ATT&CK is a comprehensive knowledge base documenting real-world adversary tactics, techniques, and procedures (TTPs) used by defenders to understand threats and improve detection.',
    difficulty: 'hard',
    domain: 'security_operations',
  },
  {
    id: 'q310',
    question: 'What is the purpose of continuous monitoring in security operations?',
    options: [
      'To prevent all attacks',
      'To provide real-time visibility into security events and threats',
      'To eliminate the need for incident response',
      'To prevent employees from working',
    ],
    correctAnswer: 1,
    explanation:
      'Continuous monitoring maintains real-time visibility into systems and networks, detecting anomalies and threats as they occur, enabling faster incident response.',
    difficulty: 'hard',
    domain: 'security_operations',
  },

  // ===== Security Program Management (20%) =====
  {
    id: 'q401',
    question: 'What is the goal of a security governance program?',
    options: [
      'To eliminate all technology use',
      'To establish policies, controls, and accountability for security',
      'To make security the only business function',
      'To hire more security personnel',
    ],
    correctAnswer: 1,
    explanation:
      'Security governance establishes policies, procedures, and accountability frameworks to ensure organizations systematically manage security risks and meet compliance requirements.',
    difficulty: 'medium',
    domain: 'security_program_management',
  },
  {
    id: 'q402',
    question: 'What is risk management?',
    options: [
      'Eliminating all risks',
      'Identifying, assessing, and mitigating risks to an acceptable level',
      'Ignoring risks',
      'Transferring all risks to insurance companies',
    ],
    correctAnswer: 1,
    explanation:
      'Risk management is a systematic process of identifying, analyzing, and mitigating risks to reduce their impact on the organization to acceptable levels.',
    difficulty: 'easy',
    domain: 'security_program_management',
  },
  {
    id: 'q403',
    question: 'What is the purpose of an acceptable use policy (AUP)?',
    options: [
      'To eliminate all computer use',
      'To define appropriate use of company resources and consequences for misuse',
      'To increase system performance',
      'To replace passwords',
    ],
    correctAnswer: 1,
    explanation:
      'An Acceptable Use Policy (AUP) defines appropriate use of company IT resources, outlining prohibited activities and consequences, protecting the organization from liability.',
    difficulty: 'easy',
    domain: 'security_program_management',
  },
  {
    id: 'q404',
    question: 'What is security awareness training?',
    options: [
      'Training systems to detect attacks',
      'Educating employees about security risks and best practices',
      'Teaching programmers to write secure code',
      'Certifying security professionals',
    ],
    correctAnswer: 1,
    explanation:
      'Security awareness training educates employees about security policies, threats, and best practices, reducing human error and helping organizations build a security-conscious culture.',
    difficulty: 'easy',
    domain: 'security_program_management',
  },
  {
    id: 'q405',
    question: 'What is compliance in the context of information security?',
    options: [
      'Installing antivirus software',
      'Adhering to regulatory requirements and security standards',
      'Using the most expensive security tools',
      'Having perfect security with no breaches',
    ],
    correctAnswer: 1,
    explanation:
      'Compliance means adhering to applicable laws, regulations, standards (e.g., GDPR, HIPAA, ISO 27001), and organizational policies for managing information security.',
    difficulty: 'medium',
    domain: 'security_program_management',
  },
  {
    id: 'q406',
    question: 'What is a security audit?',
    options: [
      'A test to find security vulnerabilities',
      'An independent evaluation of security controls and compliance',
      'A system performance check',
      'A backup of security data',
    ],
    correctAnswer: 1,
    explanation:
      'A security audit is an independent examination of an organization\'s security controls, policies, and compliance status, often performed by third parties for objectivity.',
    difficulty: 'medium',
    domain: 'security_program_management',
  },
  {
    id: 'q407',
    question: 'What is the purpose of a business continuity plan (BCP)?',
    options: [
      'To continue business without any disruptions',
      'To ensure organizational operations continue during and after disruptions',
      'To prevent all security incidents',
      'To eliminate data backups',
    ],
    correctAnswer: 1,
    explanation:
      'A Business Continuity Plan outlines procedures and strategies to maintain critical business functions during and after disruptive events, ensuring organizational resilience.',
    difficulty: 'medium',
    domain: 'security_program_management',
  },
  {
    id: 'q408',
    question: 'What is the difference between a Business Continuity Plan (BCP) and a Disaster Recovery Plan (DRP)?',
    options: [
      'They are the same thing',
      'A BCP maintains business functions; a DRP focuses on recovering systems and data after failure',
      'A DRP is for physical disasters only',
      'A BCP is only for IT systems',
    ],
    correctAnswer: 1,
    explanation:
      'A BCP focuses on maintaining critical business functions during disruptions, while a DRP specifically addresses recovering IT systems and data after a disaster.',
    difficulty: 'hard',
    domain: 'security_program_management',
  },
  {
    id: 'q409',
    question: 'What is a risk assessment?',
    options: [
      'Determining the cost of antivirus software',
      'Systematically identifying and evaluating threats and vulnerabilities to determine risk levels',
      'Testing security guards\' readiness',
      'Calculating insurance premiums',
    ],
    correctAnswer: 1,
    explanation:
      'A risk assessment systematically identifies assets, threats, and vulnerabilities, then evaluates the likelihood and impact of potential incidents to prioritize mitigation efforts.',
    difficulty: 'medium',
    domain: 'security_program_management',
  },
  {
    id: 'q410',
    question: 'What is data classification used for?',
    options: [
      'To organize data alphabetically',
      'To categorize data by sensitivity and apply appropriate protection controls',
      'To delete old data',
      'To encrypt all data equally',
    ],
    correctAnswer: 1,
    explanation:
      'Data classification assigns sensitivity levels (e.g., public, internal, confidential, restricted) to information, enabling application of appropriate security controls based on sensitivity.',
    difficulty: 'medium',
    domain: 'security_program_management',
  },
];
