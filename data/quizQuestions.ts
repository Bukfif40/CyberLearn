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

  // ===== Additional General Security Concepts (12%) =====
  {
    id: 'q017',
    question: 'What is the core principle of a Zero Trust security model?',
    options: [
      'Trust all internal network traffic by default',
      'Never trust, always verify every request regardless of origin',
      'Trust is granted permanently after the first login',
      'Only external traffic needs verification',
    ],
    correctAnswer: 1,
    explanation:
      'Zero Trust assumes no implicit trust for any user or device, inside or outside the network, and requires continuous verification of identity and context for every access request.',
    difficulty: 'medium',
    domain: 'general_security_concepts',
  },
  {
    id: 'q018',
    question: 'Why is asymmetric encryption typically used to exchange a symmetric key rather than to encrypt bulk data?',
    options: [
      'Asymmetric encryption is faster for large data sets',
      'Asymmetric encryption is computationally slower, so symmetric keys handle the bulk workload',
      'Symmetric encryption cannot be automated',
      'Asymmetric encryption does not support key pairs',
    ],
    correctAnswer: 1,
    explanation:
      'Asymmetric (public-key) encryption is computationally expensive, so it is commonly used only to securely exchange a symmetric session key, which then encrypts the actual bulk data efficiently.',
    difficulty: 'medium',
    domain: 'general_security_concepts',
  },
  {
    id: 'q019',
    question: 'What does the AAA framework in security stand for?',
    options: [
      'Authentication, Authorization, Accounting',
      'Access, Auditing, Availability',
      'Authentication, Auditing, Accountability',
      'Assessment, Authorization, Availability',
    ],
    correctAnswer: 0,
    explanation:
      'AAA stands for Authentication (verifying identity), Authorization (granting permissions), and Accounting (logging and tracking usage/activity).',
    difficulty: 'easy',
    domain: 'general_security_concepts',
  },
  {
    id: 'q020',
    question: 'What is the purpose of a gap analysis in a security program?',
    options: [
      'To find gaps in a network cable run',
      'To compare current security posture against a desired standard or framework to identify deficiencies',
      'To measure employee attendance',
      'To calculate the cost of a data breach',
    ],
    correctAnswer: 1,
    explanation:
      'A gap analysis compares an organization\'s current security controls and practices against a target framework or standard, highlighting deficiencies that need remediation.',
    difficulty: 'medium',
    domain: 'general_security_concepts',
  },

  // ===== Additional Threats, Vulnerabilities & Mitigations (22%) =====
  {
    id: 'q121',
    question: 'What is the difference between a threat and a vulnerability?',
    options: [
      'They are interchangeable terms',
      'A threat is a potential danger; a vulnerability is a weakness that a threat can exploit',
      'A vulnerability is always caused by malware',
      'A threat only refers to insider risks',
    ],
    correctAnswer: 1,
    explanation:
      'A threat is any potential danger to an asset (e.g., an attacker or natural disaster), while a vulnerability is a weakness that a threat could exploit to cause harm.',
    difficulty: 'easy',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q122',
    question: 'What distinguishes spear phishing from generic phishing?',
    options: [
      'Spear phishing only targets executives',
      'Spear phishing is a highly targeted attack customized for a specific individual or group',
      'Spear phishing never uses email',
      'Spear phishing is always automated',
    ],
    correctAnswer: 1,
    explanation:
      'Spear phishing is a targeted phishing attack that uses personalized information about a specific victim to increase credibility, unlike generic mass phishing campaigns.',
    difficulty: 'medium',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q123',
    question: 'What is a zero-day vulnerability?',
    options: [
      'A vulnerability that has existed for zero days',
      'A previously unknown vulnerability with no available patch at the time of exploitation',
      'A vulnerability that only affects day-zero installations',
      'A vulnerability that resets every 24 hours',
    ],
    correctAnswer: 1,
    explanation:
      'A zero-day vulnerability is a flaw unknown to the vendor with no patch available, giving defenders "zero days" to prepare before it can be exploited.',
    difficulty: 'medium',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q124',
    question: 'What is the most effective mitigation against SQL injection attacks?',
    options: [
      'Disabling the database',
      'Using parameterized queries (prepared statements) and input validation',
      'Encrypting the database at rest',
      'Blocking all traffic on port 443',
    ],
    correctAnswer: 1,
    explanation:
      'Parameterized queries separate SQL code from user-supplied data, preventing attackers from injecting malicious SQL, and should be combined with strict input validation.',
    difficulty: 'medium',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q125',
    question: 'What is the primary characteristic of ransomware?',
    options: [
      'It slows down network traffic',
      'It encrypts victim data and demands payment for the decryption key',
      'It only displays unwanted advertisements',
      'It replicates itself without any payload',
    ],
    correctAnswer: 1,
    explanation:
      'Ransomware encrypts a victim\'s files or systems and demands a ransom payment, typically in cryptocurrency, in exchange for the decryption key.',
    difficulty: 'easy',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q126',
    question: 'What best describes a Business Email Compromise (BEC) attack?',
    options: [
      'A virus that infects email servers',
      'An attacker impersonating an executive or trusted vendor to trick an employee into transferring funds or data',
      'A denial-of-service attack against an email provider',
      'Encrypting email attachments for ransom',
    ],
    correctAnswer: 1,
    explanation:
      'BEC attacks rely on social engineering, often impersonating executives or trusted vendors via email, to convince employees to wire funds or disclose sensitive information.',
    difficulty: 'medium',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q127',
    question: 'What is a buffer overflow attack?',
    options: [
      'Filling a hard drive until it is full',
      'Writing more data to a memory buffer than it can hold, potentially allowing arbitrary code execution',
      'Overloading a network switch with traffic',
      'Duplicating backup files repeatedly',
    ],
    correctAnswer: 1,
    explanation:
      'A buffer overflow occurs when a program writes more data to a memory buffer than it was allocated, which can corrupt adjacent memory and allow attackers to execute arbitrary code.',
    difficulty: 'hard',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q128',
    question: 'What is a supply chain attack?',
    options: [
      'An attack that disrupts shipping logistics',
      'Compromising a trusted third-party vendor or software component to reach the ultimate target',
      'A denial-of-service attack on retail websites',
      'Stealing physical inventory from a warehouse',
    ],
    correctAnswer: 1,
    explanation:
      'A supply chain attack targets a trusted vendor, supplier, or software dependency to indirectly compromise the intended target, often bypassing traditional defenses.',
    difficulty: 'hard',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q129',
    question: 'What is an Indicator of Compromise (IoC)?',
    options: [
      'A performance metric for a firewall',
      'Forensic evidence such as unusual file hashes, IP addresses, or log entries suggesting a system has been breached',
      'A certificate revocation notice',
      'A password complexity requirement',
    ],
    correctAnswer: 1,
    explanation:
      'An IoC is a piece of forensic data (e.g., malicious file hash, suspicious IP, unusual login pattern) that suggests a system or network may have been compromised.',
    difficulty: 'medium',
    domain: 'threats_vulnerabilities_mitigations',
  },
  {
    id: 'q130',
    question: 'What is credential stuffing?',
    options: [
      'Manually guessing passwords one character at a time',
      'Using lists of previously breached username/password pairs to attempt logins across multiple sites',
      'Storing credentials in plaintext files',
      'Forcing users to reset passwords frequently',
    ],
    correctAnswer: 1,
    explanation:
      'Credential stuffing uses automated tools to test username/password pairs leaked from other breaches against many sites, exploiting users who reuse passwords.',
    difficulty: 'medium',
    domain: 'threats_vulnerabilities_mitigations',
  },

  // ===== Additional Security Architecture (18%) =====
  {
    id: 'q211',
    question: 'What is the primary purpose of a Demilitarized Zone (DMZ) in network architecture?',
    options: [
      'To store encrypted backups',
      'To host public-facing services in a segmented network isolated from the internal LAN',
      'To physically separate employees from the internet',
      'To provide unrestricted access between the internet and internal network',
    ],
    correctAnswer: 1,
    explanation:
      'A DMZ is a segmented network zone that hosts public-facing services (e.g., web servers) so that, if compromised, the attacker still cannot directly reach the internal network.',
    difficulty: 'medium',
    domain: 'security_architecture',
  },
  {
    id: 'q212',
    question: 'In the cloud shared responsibility model, who is typically responsible for securing the physical data center hardware in an IaaS deployment?',
    options: ['The customer', 'The cloud provider', 'A third-party auditor', 'No one; it is not covered'],
    correctAnswer: 1,
    explanation:
      'In IaaS, the cloud provider is responsible for physical security and the underlying infrastructure, while the customer remains responsible for the OS, applications, and data.',
    difficulty: 'medium',
    domain: 'security_architecture',
  },
  {
    id: 'q213',
    question: 'What is a key security advantage of containerization compared to traditional virtual machines?',
    options: [
      'Containers eliminate the need for any isolation',
      'Containers are lightweight and share the host OS kernel, enabling faster, more consistent deployment',
      'Containers always run with more privileges than VMs',
      'Containers cannot be scanned for vulnerabilities',
    ],
    correctAnswer: 1,
    explanation:
      'Containers share the host OS kernel and package only the application and its dependencies, making them lightweight and fast to deploy compared to full virtual machines, though they typically offer weaker isolation.',
    difficulty: 'hard',
    domain: 'security_architecture',
  },
  {
    id: 'q214',
    question: 'What is the main difference between an IDS and an IPS?',
    options: [
      'An IDS only detects and alerts; an IPS can actively block malicious traffic',
      'An IDS blocks traffic; an IPS only logs it',
      'They are identical technologies',
      'An IPS only works on wireless networks',
    ],
    correctAnswer: 0,
    explanation:
      'An Intrusion Detection System (IDS) passively monitors and alerts on suspicious traffic, while an Intrusion Prevention System (IPS) sits inline and can actively block or drop malicious traffic.',
    difficulty: 'medium',
    domain: 'security_architecture',
  },
  {
    id: 'q215',
    question: 'What is the purpose of network segmentation?',
    options: [
      'To make troubleshooting more difficult',
      'To divide a network into isolated zones to limit the spread of an attack and control access',
      'To increase the number of public IP addresses needed',
      'To eliminate the need for firewalls',
    ],
    correctAnswer: 1,
    explanation:
      'Network segmentation divides a network into smaller isolated zones, limiting lateral movement during a breach and allowing more granular access control between segments.',
    difficulty: 'easy',
    domain: 'security_architecture',
  },
  {
    id: 'q216',
    question: 'Why is Telnet considered insecure compared to SSH for remote administration?',
    options: [
      'Telnet is slower than SSH',
      'Telnet transmits credentials and data in plaintext, while SSH encrypts the session',
      'Telnet requires a VPN',
      'Telnet only works on Windows systems',
    ],
    correctAnswer: 1,
    explanation:
      'Telnet sends all data, including credentials, in plaintext, making it vulnerable to eavesdropping. SSH encrypts the entire session, protecting confidentiality and integrity.',
    difficulty: 'easy',
    domain: 'security_architecture',
  },
  {
    id: 'q217',
    question: 'What is the function of a Certificate Authority (CA) in a PKI?',
    options: [
      'To store all private keys for users',
      'To issue, sign, and manage digital certificates that bind public keys to identities',
      'To encrypt all network traffic directly',
      'To act as a firewall for certificate traffic',
    ],
    correctAnswer: 1,
    explanation:
      'A Certificate Authority issues and digitally signs certificates, vouching for the binding between a public key and an identity, forming the trust foundation of a PKI.',
    difficulty: 'medium',
    domain: 'security_architecture',
  },
  {
    id: 'q218',
    question: 'What is the purpose of an air-gapped system?',
    options: [
      'To improve wireless signal strength',
      'To physically isolate a system from unsecured networks, including the internet',
      'To reduce cooling costs in a data center',
      'To allow faster patch deployment',
    ],
    correctAnswer: 1,
    explanation:
      'An air-gapped system is physically isolated from unsecured networks like the internet, providing strong protection for highly sensitive systems at the cost of convenience.',
    difficulty: 'medium',
    domain: 'security_architecture',
  },
  {
    id: 'q219',
    question: 'What is a honeypot used for in security architecture?',
    options: [
      'Storing production customer data',
      'A decoy system designed to attract and analyze attacker behavior away from real assets',
      'Accelerating network throughput',
      'Backing up encryption keys',
    ],
    correctAnswer: 1,
    explanation:
      'A honeypot is a decoy system intentionally exposed to attract attackers, allowing defenders to study attack techniques and divert attention from genuine production systems.',
    difficulty: 'medium',
    domain: 'security_architecture',
  },
  {
    id: 'q220',
    question: 'What is a key security concern specific to ICS/SCADA environments?',
    options: [
      'They are always air-gapped and require no protection',
      'Legacy protocols and hardware often lack modern security controls and cannot easily be patched without downtime',
      'They only run on modern cloud infrastructure',
      'They have no availability requirements',
    ],
    correctAnswer: 1,
    explanation:
      'Industrial Control Systems (ICS) and SCADA environments frequently run legacy protocols and hardware that lack authentication or encryption, and patching is difficult due to strict uptime requirements.',
    difficulty: 'hard',
    domain: 'security_architecture',
  },
  {
    id: 'q221',
    question: 'What does a load balancer primarily provide from a security and availability standpoint?',
    options: [
      'Encryption of data at rest',
      'Distribution of traffic across multiple servers to improve availability and resilience',
      'Elimination of the need for backups',
      'Automatic patching of vulnerabilities',
    ],
    correctAnswer: 1,
    explanation:
      'A load balancer distributes incoming traffic across multiple servers, improving availability, performance, and resilience against server failure or traffic spikes.',
    difficulty: 'easy',
    domain: 'security_architecture',
  },
  {
    id: 'q222',
    question: 'What is the primary risk of using a self-signed certificate in a production environment?',
    options: [
      'It cannot encrypt any traffic',
      'It is not validated by a trusted third-party CA, so clients cannot verify the identity of the server',
      'It expires immediately upon creation',
      'It only works with symmetric encryption',
    ],
    correctAnswer: 1,
    explanation:
      'A self-signed certificate is not vouched for by a trusted CA, so clients have no independent way to verify the server\'s identity, making it vulnerable to impersonation.',
    difficulty: 'medium',
    domain: 'security_architecture',
  },
  {
    id: 'q223',
    question: 'What is the main security challenge posed by many consumer IoT devices?',
    options: [
      'They use too much bandwidth',
      'They often ship with weak default credentials and infrequent firmware updates',
      'They cannot connect to Wi-Fi',
      'They require too much physical storage space',
    ],
    correctAnswer: 1,
    explanation:
      'Many IoT devices ship with weak or hardcoded default credentials and receive infrequent security updates, making them attractive targets for botnets and lateral movement.',
    difficulty: 'medium',
    domain: 'security_architecture',
  },
  {
    id: 'q224',
    question: 'What is the purpose of high availability (HA) clustering in system design?',
    options: [
      'To reduce the number of servers needed to zero',
      'To provide automatic failover so services remain available if a component fails',
      'To increase the attack surface for redundancy testing',
      'To eliminate the need for monitoring',
    ],
    correctAnswer: 1,
    explanation:
      'High availability clustering uses redundant systems with automatic failover so that if one node fails, another takes over, minimizing downtime for critical services.',
    difficulty: 'medium',
    domain: 'security_architecture',
  },
  {
    id: 'q225',
    question: 'What distinguishes a next-generation firewall (NGFW) from a traditional stateful firewall?',
    options: [
      'NGFWs only filter by port number',
      'NGFWs add deep packet inspection, application awareness, and integrated intrusion prevention',
      'NGFWs cannot be centrally managed',
      'NGFWs remove the need for any access control lists',
    ],
    correctAnswer: 1,
    explanation:
      'An NGFW extends traditional stateful inspection with deep packet inspection, application-layer awareness, and integrated intrusion prevention capabilities for more granular control.',
    difficulty: 'medium',
    domain: 'security_architecture',
  },

  // ===== Additional Security Operations (28%) =====
  {
    id: 'q311',
    question: 'What is the correct order of the incident response lifecycle phases?',
    options: [
      'Containment, Preparation, Identification, Eradication, Recovery, Lessons Learned',
      'Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned',
      'Identification, Preparation, Recovery, Containment, Eradication, Lessons Learned',
      'Lessons Learned, Preparation, Identification, Containment, Eradication, Recovery',
    ],
    correctAnswer: 1,
    explanation:
      'The standard incident response lifecycle is Preparation, Identification, Containment, Eradication, Recovery, and Lessons Learned (post-incident review).',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q312',
    question: 'In digital forensics, what does the "order of volatility" refer to?',
    options: [
      'The order in which files were created',
      'The sequence for collecting evidence, starting with the most easily lost data (e.g., RAM) before less volatile data (e.g., disk)',
      'The order in which backups should be restored',
      'The priority order for patching systems',
    ],
    correctAnswer: 1,
    explanation:
      'Order of volatility guides evidence collection to preserve the most fragile data first — such as CPU registers and RAM — before less volatile sources like disk drives and backups.',
    difficulty: 'hard',
    domain: 'security_operations',
  },
  {
    id: 'q313',
    question: 'Why is maintaining a chain of custody important during forensic investigations?',
    options: [
      'It speeds up data recovery',
      'It documents who handled evidence and when, preserving its integrity and admissibility',
      'It is only required for physical evidence, not digital',
      'It eliminates the need for hashing evidence',
    ],
    correctAnswer: 1,
    explanation:
      'Chain of custody documents every person who handled evidence and when, ensuring the evidence has not been tampered with and remains admissible in legal proceedings.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q314',
    question: 'What is the key difference between vulnerability scanning and penetration testing?',
    options: [
      'They are the same activity performed at different times',
      'Vulnerability scanning identifies potential weaknesses automatically; penetration testing actively exploits them to demonstrate real-world impact',
      'Penetration testing is always automated with no human involvement',
      'Vulnerability scanning requires written authorization but penetration testing does not',
    ],
    correctAnswer: 1,
    explanation:
      'Vulnerability scanning uses automated tools to identify known weaknesses, while penetration testing goes further by actively attempting to exploit those weaknesses to assess real-world risk.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q315',
    question: 'What is the primary purpose of a SIEM system?',
    options: [
      'To physically secure server rooms',
      'To aggregate, correlate, and analyze log data from multiple sources for threat detection and alerting',
      'To encrypt data at rest',
      'To manage employee onboarding',
    ],
    correctAnswer: 1,
    explanation:
      'A Security Information and Event Management (SIEM) system centralizes log collection from across the environment, correlating events to detect threats and generate alerts.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q316',
    question: 'How does SOAR extend the capabilities of a SIEM?',
    options: [
      'SOAR replaces the need for log collection entirely',
      'SOAR adds automated response playbooks and orchestration on top of detection and alerting',
      'SOAR only works with physical security cameras',
      'SOAR removes the need for human analysts permanently',
    ],
    correctAnswer: 1,
    explanation:
      'Security Orchestration, Automation, and Response (SOAR) platforms build on SIEM alerting by automating investigation and response workflows through predefined playbooks.',
    difficulty: 'hard',
    domain: 'security_operations',
  },
  {
    id: 'q317',
    question: 'What is the main difference between a full backup and an incremental backup?',
    options: [
      'A full backup only saves file names',
      'A full backup copies all data every time; an incremental backup only copies data changed since the last backup of any type',
      'An incremental backup is always larger than a full backup',
      'A full backup cannot be restored without an incremental backup',
    ],
    correctAnswer: 1,
    explanation:
      'A full backup copies all selected data every time it runs, while an incremental backup only copies data that changed since the most recent backup (full or incremental), saving time and storage.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q318',
    question: 'What does the 3-2-1 backup rule recommend?',
    options: [
      'Three backups taken on the first day of the month',
      'Three copies of data, on two different media types, with one copy stored off-site',
      'Two copies of data reviewed three times a year',
      'One backup encrypted with two different keys',
    ],
    correctAnswer: 1,
    explanation:
      'The 3-2-1 rule recommends keeping three copies of data, stored on two different media types, with at least one copy kept off-site to protect against site-wide disasters.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q319',
    question: 'What is the purpose of Network Access Control (NAC)?',
    options: [
      'To encrypt all wireless traffic',
      'To evaluate and enforce device compliance before granting network access',
      'To replace the need for firewalls',
      'To manage DNS records exclusively',
    ],
    correctAnswer: 1,
    explanation:
      'NAC evaluates a device\'s security posture (e.g., patch level, antivirus status) and enforces policy compliance before, or immediately after, granting network access.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q320',
    question: 'What is the primary function of Endpoint Detection and Response (EDR)?',
    options: [
      'To manage user password resets',
      'To continuously monitor endpoints for malicious activity and enable rapid investigation and response',
      'To physically lock down USB ports',
      'To provide network bandwidth throttling',
    ],
    correctAnswer: 1,
    explanation:
      'EDR tools continuously monitor endpoint activity, detect suspicious behavior, and provide tools for investigation, containment, and response beyond traditional antivirus.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q321',
    question: 'What is the goal of a Data Loss Prevention (DLP) solution?',
    options: [
      'To back up all company data automatically',
      'To detect and prevent unauthorized transmission or exposure of sensitive data',
      'To compress data for storage efficiency',
      'To manage software license keys',
    ],
    correctAnswer: 1,
    explanation:
      'DLP solutions monitor and control data in use, in motion, and at rest to detect and block unauthorized transmission or exposure of sensitive information.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q322',
    question: 'Why is timely account deprovisioning important when an employee leaves an organization?',
    options: [
      'It reduces electricity costs',
      'It prevents former employees from retaining unauthorized access to systems and data',
      'It is only relevant for privileged accounts',
      'It speeds up the hiring of a replacement',
    ],
    correctAnswer: 1,
    explanation:
      'Prompt deprovisioning removes a departed employee\'s access rights, closing a common avenue for unauthorized access, data theft, or sabotage by former insiders.',
    difficulty: 'easy',
    domain: 'security_operations',
  },
  {
    id: 'q323',
    question: 'What is the principle of "least functionality" in system hardening?',
    options: [
      'Installing every available feature for flexibility',
      'Disabling or removing unnecessary services, ports, and applications to reduce the attack surface',
      'Limiting the number of administrators to one',
      'Reducing the number of backups taken',
    ],
    correctAnswer: 1,
    explanation:
      'Least functionality means configuring systems to provide only the capabilities required for their purpose, disabling unneeded services and ports to minimize the attack surface.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q324',
    question: 'What is a secure configuration baseline?',
    options: [
      'The default settings shipped by a vendor',
      'A documented, approved standard configuration that systems must be built and maintained against',
      'A one-time security scan report',
      'A list of all employees with admin rights',
    ],
    correctAnswer: 1,
    explanation:
      'A secure configuration baseline defines the approved, hardened settings a system should be deployed and maintained with, providing a benchmark to detect unauthorized drift.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q325',
    question: 'What is a primary security benefit of Mobile Device Management (MDM)?',
    options: [
      'It guarantees faster mobile network speeds',
      'It allows centralized enforcement of security policies, remote wipe, and app control on mobile devices',
      'It eliminates the need for device passcodes',
      'It only manages device battery life',
    ],
    correctAnswer: 1,
    explanation:
      'MDM platforms let organizations centrally enforce security policies (encryption, passcodes), push updates, and remotely wipe lost or stolen mobile devices.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q326',
    question: 'What is the main purpose of a formal change management process?',
    options: [
      'To slow down all IT projects',
      'To ensure changes to systems are reviewed, tested, approved, and documented to minimize unintended impact',
      'To eliminate the need for testing environments',
      'To automatically approve all emergency changes',
    ],
    correctAnswer: 1,
    explanation:
      'Change management ensures modifications to production systems go through review, testing, and approval, reducing the risk of outages or security gaps from unplanned changes.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q327',
    question: 'What is threat hunting?',
    options: [
      'Waiting passively for automated alerts to fire',
      'Proactively searching an environment for signs of undetected threats or adversary activity',
      'Purchasing threat intelligence subscriptions only',
      'Running a single annual vulnerability scan',
    ],
    correctAnswer: 1,
    explanation:
      'Threat hunting is a proactive practice where analysts actively search networks and endpoints for indicators of compromise or adversary activity that automated tools may have missed.',
    difficulty: 'hard',
    domain: 'security_operations',
  },
  {
    id: 'q328',
    question: 'What is a key benefit of security automation and orchestration in daily operations?',
    options: [
      'It removes the need for any human oversight permanently',
      'It reduces response time and analyst workload by automating repetitive detection and response tasks',
      'It guarantees zero false positives',
      'It replaces the need for logging',
    ],
    correctAnswer: 1,
    explanation:
      'Automation and orchestration speed up repetitive tasks like alert triage and containment actions, reducing analyst workload and shortening response times, though human oversight is still needed.',
    difficulty: 'medium',
    domain: 'security_operations',
  },
  {
    id: 'q329',
    question: 'Which multifactor authentication factor category does a hardware token or authenticator app code belong to?',
    options: ['Something you know', 'Something you have', 'Something you are', 'Somewhere you are'],
    correctAnswer: 1,
    explanation:
      'A hardware token or one-time code from an authenticator app is classified as "something you have," a possession-based authentication factor.',
    difficulty: 'easy',
    domain: 'security_operations',
  },
  {
    id: 'q330',
    question: 'What is the purpose of centralized log management in security operations?',
    options: [
      'To reduce the number of servers needed',
      'To aggregate logs from many sources into one place for easier correlation, retention, and analysis',
      'To automatically fix vulnerabilities found in logs',
      'To replace the need for a SIEM entirely',
    ],
    correctAnswer: 1,
    explanation:
      'Centralized log management collects logs from across the environment into a single repository, simplifying correlation, long-term retention, and forensic analysis during investigations.',
    difficulty: 'medium',
    domain: 'security_operations',
  },

  // ===== Additional Security Program Management (20%) =====
  {
    id: 'q411',
    question: 'Which of the following is NOT one of the four common risk management strategies?',
    options: ['Accept', 'Transfer', 'Avoid', 'Ignore'],
    correctAnswer: 3,
    explanation:
      'The four standard risk management strategies are Accept, Avoid, Mitigate, and Transfer. "Ignore" is not a formal risk response strategy and leaves an organization unaware and exposed.',
    difficulty: 'easy',
    domain: 'security_program_management',
  },
  {
    id: 'q412',
    question: 'What is the key difference between qualitative and quantitative risk analysis?',
    options: [
      'Qualitative analysis uses numerical dollar values; quantitative uses descriptive ratings',
      'Qualitative analysis uses descriptive ratings (e.g., high/medium/low); quantitative analysis uses numerical and monetary values',
      'They produce identical results',
      'Quantitative analysis is always faster to perform',
    ],
    correctAnswer: 1,
    explanation:
      'Qualitative risk analysis ranks risks using descriptive scales like high/medium/low, while quantitative analysis assigns numerical and monetary values, such as calculating Annualized Loss Expectancy.',
    difficulty: 'medium',
    domain: 'security_program_management',
  },
  {
    id: 'q413',
    question: 'Given a Single Loss Expectancy (SLE) of $10,000 and an Annualized Rate of Occurrence (ARO) of 2, what is the Annualized Loss Expectancy (ALE)?',
    options: ['$5,000', '$10,000', '$20,000', '$2,000'],
    correctAnswer: 2,
    explanation:
      'ALE = SLE x ARO, so $10,000 x 2 = $20,000. This represents the expected yearly monetary loss from a given risk.',
    difficulty: 'hard',
    domain: 'security_program_management',
  },
  {
    id: 'q414',
    question: 'Why is third-party (vendor) risk management important?',
    options: [
      'Vendors are never a source of security risk',
      'External vendors and suppliers can introduce risk to an organization through their own security weaknesses',
      'It is only relevant for financial audits',
      'It replaces the need for internal security controls',
    ],
    correctAnswer: 1,
    explanation:
      'Vendors and suppliers often have access to systems or data, so weaknesses in their security posture can directly translate into risk for the organization that relies on them.',
    difficulty: 'medium',
    domain: 'security_program_management',
  },
  {
    id: 'q415',
    question: 'What is the primary purpose of security awareness training for employees?',
    options: [
      'To satisfy a one-time legal requirement only',
      'To reduce human-related risk by teaching employees to recognize and respond to security threats',
      'To replace the need for technical controls entirely',
      'To train only IT staff on security topics',
    ],
    correctAnswer: 1,
    explanation:
      'Security awareness training reduces the human element of risk by teaching all employees to recognize phishing, social engineering, and other threats and respond appropriately.',
    difficulty: 'easy',
    domain: 'security_program_management',
  },
  {
    id: 'q416',
    question: 'What is the correct hierarchy from most to least authoritative: policy, standard, procedure, guideline?',
    options: [
      'Guideline, Procedure, Standard, Policy',
      'Policy, Standard, Procedure, Guideline',
      'Standard, Policy, Guideline, Procedure',
      'Procedure, Guideline, Policy, Standard',
    ],
    correctAnswer: 1,
    explanation:
      'A policy sets high-level mandatory direction, standards define specific mandatory requirements supporting policy, procedures give step-by-step instructions, and guidelines offer recommended (non-mandatory) best practices.',
    difficulty: 'hard',
    domain: 'security_program_management',
  },
  {
    id: 'q417',
    question: 'In data governance, what is the primary responsibility of a data owner?',
    options: [
      'Performing daily backups of the data',
      'Making decisions about data classification, access, and acceptable use, and bearing ultimate accountability for it',
      'Physically storing the data on servers',
      'Writing the application code that processes the data',
    ],
    correctAnswer: 1,
    explanation:
      'A data owner (typically a business leader) is accountable for a data set, deciding its classification, who can access it, and how it should be protected and used.',
    difficulty: 'medium',
    domain: 'security_program_management',
  },
  {
    id: 'q418',
    question: 'What is the key distinction between privacy and security in the context of personal data?',
    options: [
      'They are identical concepts',
      'Security protects data from unauthorized access; privacy governs how personal data is collected, used, and shared appropriately',
      'Privacy only applies to government agencies',
      'Security is a subset of privacy law',
    ],
    correctAnswer: 1,
    explanation:
      'Security focuses on protecting data confidentiality, integrity, and availability from unauthorized access, while privacy concerns the appropriate collection, use, and disclosure of personal information.',
    difficulty: 'medium',
    domain: 'security_program_management',
  },
  {
    id: 'q419',
    question: 'What does the "right to be forgotten" under regulations like GDPR allow individuals to do?',
    options: [
      'Permanently delete an organization\'s backups',
      'Request that an organization erase their personal data under certain conditions',
      'Forget their own account password without consequence',
      'Prevent any company from ever collecting data about them',
    ],
    correctAnswer: 1,
    explanation:
      'The "right to be forgotten" (right to erasure) allows individuals to request that an organization delete their personal data when it is no longer needed or consent is withdrawn, subject to legal exceptions.',
    difficulty: 'medium',
    domain: 'security_program_management',
  },
  {
    id: 'q420',
    question: 'What is the difference between due diligence and due care?',
    options: [
      'They mean exactly the same thing',
      'Due diligence is researching and understanding risk; due care is taking reasonable action to address it',
      'Due care only applies to financial audits',
      'Due diligence is a legal term with no security relevance',
    ],
    correctAnswer: 1,
    explanation:
      'Due diligence refers to the research and investigation to understand risks, while due care refers to the reasonable steps taken to address and mitigate those identified risks.',
    difficulty: 'hard',
    domain: 'security_program_management',
  },
  {
    id: 'q421',
    question: 'What type of agreement establishes the expected performance level (e.g., uptime, response time) between a service provider and a customer?',
    options: ['NDA', 'MOU', 'Service Level Agreement (SLA)', 'BPA'],
    correctAnswer: 2,
    explanation:
      'A Service Level Agreement (SLA) formally defines the expected performance metrics, such as uptime and response times, that a service provider commits to delivering.',
    difficulty: 'easy',
    domain: 'security_program_management',
  },
  {
    id: 'q422',
    question: 'What is the purpose of a Non-Disclosure Agreement (NDA)?',
    options: [
      'To define uptime guarantees for a service',
      'To legally bind parties to keep specified information confidential',
      'To outline a business partnership\'s revenue split',
      'To specify technical security controls required by law',
    ],
    correctAnswer: 1,
    explanation:
      'An NDA is a legal contract that obligates the parties involved to keep specified information confidential and not disclose it to unauthorized parties.',
    difficulty: 'easy',
    domain: 'security_program_management',
  },
  {
    id: 'q423',
    question: 'Why do security programs track metrics and key performance indicators (KPIs)?',
    options: [
      'To satisfy marketing requirements',
      'To measure the effectiveness of controls and demonstrate progress or gaps to leadership',
      'Metrics are not useful in security programs',
      'To eliminate the need for audits',
    ],
    correctAnswer: 1,
    explanation:
      'Security metrics and KPIs (e.g., mean time to detect/respond, patch compliance rate) allow a program to measure control effectiveness and communicate risk posture and progress to leadership.',
    difficulty: 'medium',
    domain: 'security_program_management',
  },
  {
    id: 'q424',
    question: 'What is the role of a Change Advisory Board (CAB) in security program management?',
    options: [
      'To approve employee vacation requests',
      'To review and approve proposed changes to systems to ensure risk is assessed before implementation',
      'To perform annual financial audits',
      'To manage the organization\'s marketing budget',
    ],
    correctAnswer: 1,
    explanation:
      'A Change Advisory Board reviews proposed changes to production systems, assessing risk and impact before granting approval, as part of a formal change management process.',
    difficulty: 'medium',
    domain: 'security_program_management',
  },
  {
    id: 'q425',
    question: 'What is the difference between PII and PHI?',
    options: [
      'They are the same category of data',
      'PII is any data that can identify an individual; PHI is a subset specifically related to health information',
      'PHI applies only to financial records',
      'PII only refers to biometric data',
    ],
    correctAnswer: 1,
    explanation:
      'Personally Identifiable Information (PII) is any data that can identify a specific individual, while Protected Health Information (PHI) is a subset of PII specifically covering health-related records, often regulated under laws like HIPAA.',
    difficulty: 'medium',
    domain: 'security_program_management',
  },
];
