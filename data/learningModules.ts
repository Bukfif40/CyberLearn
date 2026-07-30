import { LearningModule } from '../types';

export const LEARNING_MODULE_IDS = [
  'threats-vulnerabilities-mitigations',
  'security-operations',
] as const;

export const LEARNING_MODULES: Record<string, LearningModule> = {
  'threats-vulnerabilities-mitigations': {
    id: 'threats-vulnerabilities-mitigations',
    domain: 'threats_vulnerabilities_mitigations',
    title: 'Threats, Vulnerabilities & Mitigations',
    description:
      'Who attacks systems, how they get in, and what actually stops them — from threat actors to zero-days to defense-in-depth.',
    icon: '⚠️',
    lessons: [
      {
        id: 'threat-actors-attack-surface',
        title: 'Threat Actors & Attack Surface',
        summary: 'Who you\'re defending against, and where they can get in.',
        sections: [
          {
            id: 'threat-actors',
            heading: 'Threat Actors',
            body: 'Threat actors range from unsophisticated "script kiddies" using pre-built tools, to organized crime motivated by financial gain, to nation-state actors with the most resources and patience, to insider threats who already have legitimate access. Insider threats are especially dangerous precisely because they don\'t need to break in — they\'re already on the inside.',
          },
          {
            id: 'attack-surface',
            heading: 'Attack Surface',
            body: 'Attack surface is every point where an attacker could get in — every open port, every user account, every piece of software running. Reducing it (closing unused ports, removing unused accounts, patching software) is one of the cheapest, highest-impact defenses available, because it removes opportunities before an attacker ever shows up.',
          },
        ],
        checkpointQuestionIds: ['q119', 'q121'],
        estimatedMinutes: 5,
      },
      {
        id: 'attack-types-malware',
        title: 'Attack Types & Malware',
        summary: 'The common ways attackers trick people and the malware they deploy once they\'re in.',
        sections: [
          {
            id: 'social-engineering',
            heading: 'Phishing, Spear Phishing & Whaling',
            body: 'Phishing is a broad, untargeted fraudulent message sent to as many people as possible. Spear phishing narrows that down to a specific person, using personal details to make the message convincing. Whaling narrows it further still, targeting executives specifically because of the access and authority they hold.',
          },
          {
            id: 'malware-categories',
            heading: 'Malware Categories',
            body: 'Viruses need a host file and spread when that file runs. Worms are self-replicating and need no host at all. Ransomware encrypts a victim\'s data and demands payment to restore it. Trojans disguise themselves as legitimate software to get a user to install them willingly.',
          },
          {
            id: 'network-attacks',
            heading: 'On the Network',
            body: 'A man-in-the-middle attack intercepts communication between two parties who believe they\'re talking directly to each other. A denial-of-service attack overwhelms a system with traffic or requests so legitimate users can\'t use it.',
          },
        ],
        checkpointQuestionIds: ['q102', 'q108'],
        estimatedMinutes: 6,
      },
      {
        id: 'vulnerabilities-mitigations',
        title: 'Vulnerabilities & Mitigations',
        summary: 'Why no single fix is ever enough, and the concrete techniques that actually reduce risk.',
        sections: [
          {
            id: 'zero-days',
            heading: 'Zero-Days & Defense-in-Depth',
            body: 'A zero-day is a flaw with no available patch yet — which is exactly why defense-in-depth (layered controls, not one single fix) matters so much. If one layer misses a zero-day, another layer still has a chance to catch the resulting behavior.',
          },
          {
            id: 'mitigation-techniques',
            heading: 'Mitigation Techniques',
            body: 'Patch management keeps software updated on a predictable schedule. Segmentation isolates systems so a breach in one area doesn\'t automatically spread to another. Least privilege gives every account only the access it strictly needs, nothing more — so a compromised account can only do limited damage.',
          },
        ],
        checkpointQuestionIds: ['q101', 'q105'],
        estimatedMinutes: 5,
      },
    ],
    bossBattle: {
      domain: 'threats_vulnerabilities_mitigations',
      questionCount: 15,
      passThreshold: 70,
    },
  },

  'security-operations': {
    id: 'security-operations',
    domain: 'security_operations',
    title: 'Security Operations',
    description:
      'The day-to-day discipline of running a secure environment: who gets access, how weaknesses get found and fixed, and what happens when something goes wrong.',
    icon: '🛡️',
    lessons: [
      {
        id: 'identity-access-mfa',
        title: 'Identity, Access & MFA',
        summary: 'How accounts are created, what they\'re allowed to do, and how identity actually gets verified.',
        sections: [
          {
            id: 'iam',
            heading: 'Identity and Access Management',
            body: 'IAM covers how accounts get created, what they\'re allowed to do, and — just as importantly — how that access gets revoked when someone leaves. A huge number of real breaches trace back to old accounts that were never deactivated, sitting around as an unnecessary attack surface long after anyone should still be using them.',
          },
          {
            id: 'mfa',
            heading: 'Multi-Factor Authentication',
            body: 'MFA requires proving identity through more than one category: something you know (a password), something you have (a phone or hardware token), or something you are (a fingerprint). Using two factors from the same category — two passwords, say — isn\'t actually multi-factor, since defeating one factor often defeats the other too.',
          },
        ],
        checkpointQuestionIds: ['q329', 'q322'],
        estimatedMinutes: 5,
      },
      {
        id: 'vulnerability-management-cycle',
        title: 'Vulnerability Management Cycle',
        summary: 'Finding weaknesses is an ongoing cycle, not a one-time scan.',
        sections: [
          {
            id: 'the-cycle',
            heading: 'Identify, Prioritize, Remediate, Verify',
            body: 'Vulnerability management is a continuous cycle: identify vulnerabilities with scanning tools, prioritize them (not every finding is equally urgent — a critical flaw on an internet-facing server matters more than a minor one on an isolated internal machine), remediate by patching, reconfiguring, or formally accepting the risk, and finally verify the fix actually worked.',
          },
        ],
        checkpointQuestionIds: ['q305', 'q306'],
        estimatedMinutes: 4,
      },
      {
        id: 'incident-response-lifecycle',
        title: 'Incident Response Lifecycle',
        summary: 'The standard playbook for handling a security incident from start to finish.',
        sections: [
          {
            id: 'ir-phases',
            heading: 'The Six Phases',
            body: 'Incident response follows a standard lifecycle: preparation (having a plan before anything happens), detection and analysis (figuring out something is actually wrong), containment (stopping it from spreading further), eradication (removing the actual cause), recovery (getting systems back to normal safely), and lessons learned (updating the plan so the same thing is handled better next time).',
          },
          {
            id: 'logging-monitoring',
            heading: 'Logging & Monitoring',
            body: 'Logging and monitoring — typically via a SIEM (security information and event management system) — is what makes detection possible in the first place. You can\'t respond to an incident you never noticed, which is why this phase underpins all the others.',
          },
        ],
        checkpointQuestionIds: ['q302', 'q311'],
        estimatedMinutes: 6,
      },
    ],
    bossBattle: {
      domain: 'security_operations',
      questionCount: 15,
      passThreshold: 70,
    },
  },
};
