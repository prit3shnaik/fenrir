export interface MitreTechnique {
  id: string        // T1071
  name: string      // Application Layer Protocol
  tactic: string    // command-and-control
  url: string
}

// Tag → MITRE ATT&CK technique mapping
const TAG_TO_TECHNIQUE: Record<string, MitreTechnique[]> = {
  // Network / C2
  'c2':                 [{ id: 'T1071', name: 'Application Layer Protocol', tactic: 'command-and-control', url: 'https://attack.mitre.org/techniques/T1071/' }],
  'c&c':                [{ id: 'T1071', name: 'Application Layer Protocol', tactic: 'command-and-control', url: 'https://attack.mitre.org/techniques/T1071/' }],
  'botnet':             [{ id: 'T1583', name: 'Acquire Infrastructure', tactic: 'resource-development', url: 'https://attack.mitre.org/techniques/T1583/' }],
  'tor':                [{ id: 'T1090', name: 'Proxy', tactic: 'command-and-control', url: 'https://attack.mitre.org/techniques/T1090/' }],
  'tor-exit-node':      [{ id: 'T1090', name: 'Proxy', tactic: 'command-and-control', url: 'https://attack.mitre.org/techniques/T1090/' }],
  'proxy':              [{ id: 'T1090', name: 'Proxy', tactic: 'command-and-control', url: 'https://attack.mitre.org/techniques/T1090/' }],
  'vpn':                [{ id: 'T1090', name: 'Proxy', tactic: 'command-and-control', url: 'https://attack.mitre.org/techniques/T1090/' }],
  'anonymization':      [{ id: 'T1090', name: 'Proxy', tactic: 'command-and-control', url: 'https://attack.mitre.org/techniques/T1090/' }],

  // Phishing
  'phishing':           [{ id: 'T1566', name: 'Phishing', tactic: 'initial-access', url: 'https://attack.mitre.org/techniques/T1566/' }],
  'phish':              [{ id: 'T1566', name: 'Phishing', tactic: 'initial-access', url: 'https://attack.mitre.org/techniques/T1566/' }],
  'verified-phish':     [{ id: 'T1566', name: 'Phishing', tactic: 'initial-access', url: 'https://attack.mitre.org/techniques/T1566/' }],
  'spearphishing':      [{ id: 'T1566.001', name: 'Spearphishing Attachment', tactic: 'initial-access', url: 'https://attack.mitre.org/techniques/T1566/001/' }],
  'credential-phishing':[{ id: 'T1056', name: 'Input Capture', tactic: 'collection', url: 'https://attack.mitre.org/techniques/T1056/' }],

  // Malware types
  'ransomware':         [{ id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'impact', url: 'https://attack.mitre.org/techniques/T1486/' }],
  'trojan':             [{ id: 'T1204', name: 'User Execution', tactic: 'execution', url: 'https://attack.mitre.org/techniques/T1204/' }],
  'rat':                [{ id: 'T1219', name: 'Remote Access Software', tactic: 'command-and-control', url: 'https://attack.mitre.org/techniques/T1219/' }],
  'remote-access-trojan':[{ id: 'T1219', name: 'Remote Access Software', tactic: 'command-and-control', url: 'https://attack.mitre.org/techniques/T1219/' }],
  'keylogger':          [{ id: 'T1056.001', name: 'Keylogging', tactic: 'collection', url: 'https://attack.mitre.org/techniques/T1056/001/' }],
  'infostealer':        [{ id: 'T1555', name: 'Credentials from Password Stores', tactic: 'credential-access', url: 'https://attack.mitre.org/techniques/T1555/' }],
  'stealer':            [{ id: 'T1555', name: 'Credentials from Password Stores', tactic: 'credential-access', url: 'https://attack.mitre.org/techniques/T1555/' }],
  'spyware':            [{ id: 'T1125', name: 'Video Capture', tactic: 'collection', url: 'https://attack.mitre.org/techniques/T1125/' }],
  'backdoor':           [{ id: 'T1543', name: 'Create or Modify System Process', tactic: 'persistence', url: 'https://attack.mitre.org/techniques/T1543/' }],
  'rootkit':            [{ id: 'T1014', name: 'Rootkit', tactic: 'defense-evasion', url: 'https://attack.mitre.org/techniques/T1014/' }],
  'worm':               [{ id: 'T1091', name: 'Replication Through Removable Media', tactic: 'lateral-movement', url: 'https://attack.mitre.org/techniques/T1091/' }],
  'dropper':            [{ id: 'T1105', name: 'Ingress Tool Transfer', tactic: 'command-and-control', url: 'https://attack.mitre.org/techniques/T1105/' }],
  'loader':             [{ id: 'T1105', name: 'Ingress Tool Transfer', tactic: 'command-and-control', url: 'https://attack.mitre.org/techniques/T1105/' }],
  'downloader':         [{ id: 'T1105', name: 'Ingress Tool Transfer', tactic: 'command-and-control', url: 'https://attack.mitre.org/techniques/T1105/' }],
  'cryptominer':        [{ id: 'T1496', name: 'Resource Hijacking', tactic: 'impact', url: 'https://attack.mitre.org/techniques/T1496/' }],
  'miner':              [{ id: 'T1496', name: 'Resource Hijacking', tactic: 'impact', url: 'https://attack.mitre.org/techniques/T1496/' }],
  'coinminer':          [{ id: 'T1496', name: 'Resource Hijacking', tactic: 'impact', url: 'https://attack.mitre.org/techniques/T1496/' }],
  'ddos':               [{ id: 'T1498', name: 'Network Denial of Service', tactic: 'impact', url: 'https://attack.mitre.org/techniques/T1498/' }],
  'banker':             [{ id: 'T1185', name: 'Browser Session Hijacking', tactic: 'collection', url: 'https://attack.mitre.org/techniques/T1185/' }],

  // Infrastructure
  'hosting-provider':   [{ id: 'T1583.003', name: 'Virtual Private Server', tactic: 'resource-development', url: 'https://attack.mitre.org/techniques/T1583/003/' }],
  'bulletproof':        [{ id: 'T1583.003', name: 'Virtual Private Server', tactic: 'resource-development', url: 'https://attack.mitre.org/techniques/T1583/003/' }],
  'fast-flux':          [{ id: 'T1568', name: 'Dynamic Resolution', tactic: 'command-and-control', url: 'https://attack.mitre.org/techniques/T1568/' }],
  'dga':                [{ id: 'T1568.002', name: 'Domain Generation Algorithms', tactic: 'command-and-control', url: 'https://attack.mitre.org/techniques/T1568/002/' }],

  // Exploits / Vulnerabilities
  'exploit':            [{ id: 'T1203', name: 'Exploitation for Client Execution', tactic: 'execution', url: 'https://attack.mitre.org/techniques/T1203/' }],
  'cve':                [{ id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'initial-access', url: 'https://attack.mitre.org/techniques/T1190/' }],
  'rce':                [{ id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'initial-access', url: 'https://attack.mitre.org/techniques/T1190/' }],
  'sqli':               [{ id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'initial-access', url: 'https://attack.mitre.org/techniques/T1190/' }],
  'xss':                [{ id: 'T1059.007', name: 'JavaScript', tactic: 'execution', url: 'https://attack.mitre.org/techniques/T1059/007/' }],

  // Credential attacks
  'bruteforce':         [{ id: 'T1110', name: 'Brute Force', tactic: 'credential-access', url: 'https://attack.mitre.org/techniques/T1110/' }],
  'brute-force':        [{ id: 'T1110', name: 'Brute Force', tactic: 'credential-access', url: 'https://attack.mitre.org/techniques/T1110/' }],
  'credential-stuffing':[{ id: 'T1110.004', name: 'Credential Stuffing', tactic: 'credential-access', url: 'https://attack.mitre.org/techniques/T1110/004/' }],
  'scanner':            [{ id: 'T1595', name: 'Active Scanning', tactic: 'reconnaissance', url: 'https://attack.mitre.org/techniques/T1595/' }],
  'port-scan':          [{ id: 'T1595.001', name: 'Scanning IP Blocks', tactic: 'reconnaissance', url: 'https://attack.mitre.org/techniques/T1595/001/' }],

  // Data
  'exfiltration':       [{ id: 'T1041', name: 'Exfiltration Over C2 Channel', tactic: 'exfiltration', url: 'https://attack.mitre.org/techniques/T1041/' }],
  'data-theft':         [{ id: 'T1041', name: 'Exfiltration Over C2 Channel', tactic: 'exfiltration', url: 'https://attack.mitre.org/techniques/T1041/' }],
}

const TACTIC_COLORS: Record<string, string> = {
  'reconnaissance':       '#6366f1',
  'resource-development': '#8b5cf6',
  'initial-access':       '#f59e0b',
  'execution':            '#ef4444',
  'persistence':          '#f97316',
  'privilege-escalation': '#dc2626',
  'defense-evasion':      '#7c3aed',
  'credential-access':    '#db2777',
  'discovery':            '#0891b2',
  'lateral-movement':     '#059669',
  'collection':           '#0284c7',
  'command-and-control':  '#7c3aed',
  'exfiltration':         '#b45309',
  'impact':               '#991b1b',
}

export function getAttackTechniques(tags: string[]): MitreTechnique[] {
  const seen = new Set<string>()
  const result: MitreTechnique[] = []

  tags.forEach(tag => {
    const normalised = tag.toLowerCase().trim().replace(/\s+/g, '-')
    const matches = TAG_TO_TECHNIQUE[normalised] ?? []
    matches.forEach(t => {
      if (!seen.has(t.id)) {
        seen.add(t.id)
        result.push(t)
      }
    })
  })

  return result
}

export function tacticColor(tactic: string): string {
  return TACTIC_COLORS[tactic] ?? '#6b7280'
}

export function tacticBg(tactic: string): string {
  const color = tacticColor(tactic)
  return color + '20'
}