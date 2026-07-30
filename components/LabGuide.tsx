import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADII, SPACING } from '../constants/theme';

const STEPS: string[] = [
  'Get a hypervisor. Install a free virtualization tool — VirtualBox or VMware Workstation Player — so you can run virtual machines without touching your real operating system.',
  "Isolate your lab network. Configure your VMs on a host-only or internal network mode, so they can talk to each other but can't reach your home network or the internet by accident. This is the safety boundary that makes the rest of this responsible.",
  'Add a target machine. Download an intentionally vulnerable VM built for learning, like Metasploitable2 or OWASP Juice Shop, to have something legal and safe to practice against.',
  'Add an analyst toolkit. Kali Linux is a free, prebuilt VM loaded with tools like Nmap (network scanning), Wireshark (packet analysis), and Burp Suite (web app testing) — tools referenced across multiple Security+ domains.',
  'Add a defensive side. Set up something like Security Onion or a free-tier Splunk instance to practice the blue-team side: log analysis, intrusion detection, and incident response, which map directly onto the Security Operations domain.',
  'Run a full scenario. Scan the vulnerable VM with Nmap, try a documented exploit against it in your isolated network, then switch to the defensive side and find that same activity in the logs. This single loop touches almost every domain at once.',
];

export const LabGuide: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>🧪</Text>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Build Your Own Lab</Text>
          <Text style={styles.freeTag}>Free</Text>
        </View>
      </View>
      <Text style={styles.intro}>
        Reading about security concepts only goes so far — a home lab lets you actually practice,
        safely and legally, in an environment you fully control.
      </Text>

      {STEPS.map((step, index) => (
        <View key={index} style={styles.stepRow}>
          <View style={styles.stepNumberWrap}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 22,
    marginRight: SPACING.md,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans,
    flex: 1,
  },
  freeTag: {
    backgroundColor: 'rgba(0, 217, 232, 0.15)',
    color: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADII.sm,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
  },
  intro: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans,
    lineHeight: 19,
    marginBottom: SPACING.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  stepNumberWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginTop: 1,
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    fontFamily: FONTS.mono,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sans,
    lineHeight: 19,
  },
});
