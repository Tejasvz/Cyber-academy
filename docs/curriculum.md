# Academy Curriculum Database

This document lists all training modules, objectives, techniques, and flag secrets available in the Cyber Academy curriculum database.

---

## 🟢 Beginner Tier
*Focuses on core command-line navigation, networking captures, basic port scanning, and OSINT.*

| ID | Title | Core Technique | Objective | Flag |
| :--- | :--- | :--- | :--- | :--- |
| **B01** | Networking Fundamentals | Network Traffic Analysis | Analyze simulated HTTP pcap session, extract plaintext login credentials. | `flag{pcap_sniff_success}` |
| **B02** | Command Line Basics | Directory Navigation | Learn CLI navigation (`ls`, `cd`, `cat`) to locate hidden folders/files. | `flag{cli_funda_master}` |
| **B03** | Reconnaissance & OSINT | DNS Record Recon | Query targets via domain name registries (`whois`, `nslookup`, `dig`) for verification keys. | `flag{osint_recon_pro}` |
| **B04** | Basic Network Scanning | Port Scanning | Deploy `nmap` scans against active network IP ports to extract banners. | `flag{nmap_syn_stealth}` |
| **B05** | Intro to Cryptography | Password Cracking | Crack Target MD5 hashes utilizing `hashcat` or `john` dictionary wordlists. | `flag{hash_cracked_secret}` |
| **B06** | Web Architecture | Source Analysis | Inspect target web layouts and source codes using `curl` to find debugging comments. | `flag{web_source_leak}` |
| **B07** | Social Engineering Basics | Email Header Validation | Analyze simulated SMTP spools (`analyze-email`) to find phishing signatures. | `flag{phish_header_mismatch}` |
| **B08** | **Boss Challenge** | Gateway Breach | Chain Nmap scans, curl checks, and hash cracking to defeat the Beginner Boss. | `flag{beginner_boss_defeated}` |

---

## 🟡 Mediator Tier
*Focuses on web application vulnerabilities, parameter tampering, local file inclusion, and Linux SUID breakouts.*

| ID | Title | Core Technique | Objective | Flag |
| :--- | :--- | :--- | :--- | :--- |
| **M01** | Web Interception | Parameter Tampering | Run local proxy interceptors (`intercept --start`) to tamper checkout prices. | `flag{proxy_parameter_tampering}` |
| **M02** | Cross-Site Scripting | XSS Cookie Theft | Inject client reflection scripts (`exploit`) to exfiltrate cookies. | `flag{xss_cookie_hijack}` |
| **M03** | SQL Injection (SQLi) | Auth Bypass | Bypass login controls using raw SQL logical injections (`exploit-login`). | `flag{sqli_auth_bypass}` |
| **M04** | Auth Vulnerabilities | Credential Brute-Force | Brute-force credentials using `hydra` and custom wordlists. | `flag{hydra_brute_force}` |
| **M05** | Local File Inclusion | Path Traversal | Execute local file inclusions (`curl`) to read system files (`/etc/passwd`). | `flag{lfi_passwd_leak}` |
| **M06** | Network Spoofing | ARP Spoofing | Conduct ARP redirect/cache poison simulations to capture credentials. | `flag{arpspoof_redirect}` |
| **M07** | Privilege Escalation | Linux SUID Breakout | Search root SUID binaries (`find`) and execute bash escapes to gain root status. | `flag{suid_root_escalation}` |
| **M08** | **Boss Challenge** | Internal Breach | Chain SQL Auth Bypasses, LFI traversals, and SUID find escapes to defeat Mediator Boss. | `flag{mediator_boss_defeated}` |

---

## 🔴 Advanced Tier
*Focuses on binary exploits, Active Directory Kerberoasting, evasive in-memory execution, and time-based blind SQLi.*

| ID | Title | Core Technique | Objective | Flag |
| :--- | :--- | :--- | :--- | :--- |
| **A01** | Advanced SQLi | Time-Based SQLi | Automate data retrieval via blind SQLi databases (`sqlmap`) to dump tables. | `flag{time_based_blind_sqli}` |
| **A02** | Server-Side Request | SSRF Metadata Leak | Exploit SSRF requests to exfiltrate AWS/IAM security tokens. | `flag{ssrf_metadata_exfil}` |
| **A03** | Binary Exploitation | Stack Buffer Overflow | Inject large payloads to hijack execution flow and spawn a subshell. | `flag{stack_overflow_eip_hijack}` |
| **A04** | Active Directory | Kerberoasting | Harvest TGS tickets from Domain Controllers (`GetUserSPNs.py`) to crack offline. | `flag{kerberoast_ad_ticket}` |
| **A05** | Command Injection | OS RCE Execution | Inject shell command separators into ping utilities to spawn shell commands. | `flag{command_injection_rce}` |
| **A06** | Advanced Evasion | Antivirus Evasion | Obfuscate standard payloads (`obfuscate`) to bypass EDR static signatures. | `flag{av_bypass_in_memory}` |

---

## 🔒 Tier Locking & Report Progress Contracts
Tiers are unlocked sequentially to maintain curriculum structure:
- **Beginner Tier**: Unlocked by default upon user registration.
- **Mediator Tier**: Requires completing all 8 Beginner Tier modules AND submitting a verified assessment report.
- **Advanced Tier**: Requires completing all 8 Mediator Tier modules AND submitting a verified assessment report.
