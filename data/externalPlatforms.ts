import { ExternalPlatform } from '../types';

export const EXTERNAL_PLATFORMS: ExternalPlatform[] = [
  {
    id: 'tryhackme',
    name: 'TryHackMe',
    icon: '🎯',
    color: '#ff6b6b',
    url: 'https://tryhackme.com',
    description: 'Free online platform for learning cyber security, using hands-on labs and games.',
    features: ['Free rooms', 'Learning paths', 'CTF challenges', 'Active community', 'Beginner-friendly'],
  },
  {
    id: 'hackthebox',
    name: 'Hack The Box',
    icon: '📦',
    color: '#9fef00',
    url: 'https://hackthebox.com',
    description: 'Penetration testing lab with machines of varying difficulty levels.',
    features: ['Real-world scenarios', 'Ranked challenges', 'Pro labs', 'Certifications', 'Competitive'],
  },
  {
    id: 'letsdefend',
    name: 'LetsDefend',
    icon: '🛡️',
    color: '#4d96ff',
    url: 'https://letsdefend.io',
    description: 'Blue team training platform with realistic incident response scenarios.',
    features: ['SOC simulations', 'Incident response', 'Threat hunting', 'Forensics', 'Career paths'],
  },
  {
    id: 'portswigger',
    name: 'PortSwigger Academy',
    icon: '🌐',
    color: '#ff9f43',
    url: 'https://portswigger.net/web-security',
    description: 'Free web security training by the creators of Burp Suite.',
    features: ['Web security', 'Burp Suite', 'Free labs', 'Certifications', 'Industry standard'],
  },
  {
    id: 'overthewire',
    name: 'OverTheWire',
    icon: '🔌',
    color: '#a55eea',
    url: 'https://overthewire.org',
    description: 'Wargames to learn security concepts through hands-on challenges.',
    features: ['Free wargames', 'SSH access', 'Linux skills', 'Cryptography', 'Networking'],
  },
];
