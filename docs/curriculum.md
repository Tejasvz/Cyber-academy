# AETHER: The Neural Veil - Story & Curriculum Manual

## Premise
Humanity's minds were uploaded into a shared digital-biological network called the **Neural Veil** after the physical world became unlivable. You wake up with no memory, called **'Fragment'** by the system that revives you. You are, in fact, the original architect of the Veil's security -- **Operator 404** -- and every cybersecurity lesson you relearn is a piece of yourself you're stealing back.

---

## 👥 Character Cast

- **Handler AURELIA**: Your guide and handler, an AI stitched together from the memory of Dr. Sable Chen (your late mentor). In Act IV you learn she was harvested against her will by the Aether Continuity Directorate.
- **DR. HESPER**: Director of the Aether Continuity Directorate. Believes unlocking full human memory inside the Veil will cause mass psychological collapse.
- **KAEL VESS**: Your partner before the Shatter Event. Reappears in Act III as a senior operative of the Syndicate ('the Void').
- **RHEA ORTIZ**: OSINT specialist, your first real friend in the Veil. Sharp-tongued and loyal.
- **MILO TANAKA**: Network engineer and crew comic relief. Sacrifices himself in Act IV (`A4-05`) to cover the crew's escape from a Directorate raid.

---

## 📜 5-Act Syllabus Overview

### ACT I - AWAKENING
Fragment wakes with no memory. Aurelia teaches survival basics inside the Veil shell while Rhea and Milo recruit you.

| ID | Title | Technique | Lab / Objective | Flag |
| :--- | :--- | :--- | :--- | :--- |
| **A1-01** | Operation First Light | Linux CLI & Filesystem | `ls -la`, `cd archives`, `cat .flag.txt` | `flag{ls_la_and_hidden_files}` |
| **A1-02** | Operation Open Door | Networking & Port Scanning | `nmap -sS -sV` port banner inspection | `flag{nmap_service_recon}` |
| **A1-03** | Operation Quiet Signal | OSINT & Passive Recon | `whois`, `dig TXT` DNS record lookup | `flag{osint_dns_txt_recon}` |
| **A1-04** | Operation Deep Index | Google Dorking | Search engine cache & index auditing | `flag{google_dork_exposure}` |
| **A1-05** | Operation Black Echo | Cleartext Packet Sniffing | PCAP HTTP POST credentials capture | `flag{pcap_sniff_success}` |
| **A1-06** | Operation Glass House | Source Code Auditing | DevTools HTML comment secret inspection | `flag{view_source_secrets}` |
| **A1-07** | Operation Eclipse | Cryptography & Encoding | Base64 and XOR layered decoding | `flag{encoding_is_not_encryption}` |

---

### ACT II - THE FRACTURE
The crew hits Directorate infrastructure. Aurelia questions your instinctive knowledge.

| ID | Title | Technique | Lab / Objective | Flag |
| :--- | :--- | :--- | :--- | :--- |
| **A2-01** | Operation Portal Bypass | SQLi Auth Bypass | UNION-based SQL injection on login | `flag{union_sqli_auth_bypass}` |
| **A2-02** | Operation Blind Exfiltration | Blind & Time SQLi | Boolean / SLEEP(5) time-based extraction | `flag{blind_time_based_sqli}` |
| **A2-03** | Operation Echo Injection | Cross-Site Scripting | Stored XSS trigger on admin bot | `flag{stored_xss_admin_bot}` |
| **A2-04** | Operation Forged Trust | CSRF | Auto-submitting cross-origin form | `flag{csrf_privilege_grant}` |
| **A2-05** | Operation Wrong Door | IDOR | Direct object reference manipulation | `flag{idor_broken_access_control}` |
| **A2-06** | Operation Cloud Pivot | SSRF Metadata Pivot | Metadata endpoint (`169.254.169.254`) exfil | `flag{ssrf_cloud_metadata_pivot}` |
| **A2-07** | Operation Hollow Vessel | XXE Injection | XML external entity file disclosure | `flag{xxe_local_file_disclosure}` |
| **A2-08** | Operation Puppeteer | SSTI | Jinja2 template RCE expression execution | `flag{ssti_jinja2_rce}` |
| **A2-09** | Operation Trojan Upload | Insecure File Upload | Web shell upload and remote execution | `flag{insecure_upload_webshell_rce}` |

---

### ACT III - GHOSTS IN THE WIRE
Deep network and identity attacks lead into Syndicate territory. You find Kael alive and learn you are Operator 404.

| ID | Title | Technique | Lab / Objective | Flag |
| :--- | :--- | :--- | :--- | :--- |
| **A3-01** | Operation Man-in-the-Middle | ARP Spoofing | MITM packet capture via arpspoof | `flag{arp_spoof_mitm_capture}` |
| **A3-02** | Operation Swarm Force | Brute Force & Stuffing | Hydra dictionary attack on SSH gateway | `flag{hydra_ssh_bruteforce}` |
| **A3-03** | Operation Rainbow Break | Hash Cracking | Hashcat / John raw MD5 offline cracking | `flag{hashcat_md5_crack}` |
| **A3-04** | Operation Counterfeit Key | JWT Attacks | Token forging via `alg: none` header | `flag{jwt_none_algorithm_forge}` |
| **A3-05** | Operation Ticket Harvest | Kerberoasting | TGS ticket harvesting (`GetUserSPNs.py`) | `flag{kerberoasting_svc_account}` |
| **A3-06** | Operation Borrowed Face | Pass-the-Hash | NTLM hash passing for lateral movement | `flag{pass_the_hash_lateral_move}` |
| **A3-07** | Operation Root Breakout | Linux PrivEsc (SUID) | SUID binary & sudo shell escape | `flag{suid_sudo_privesc_root}` |
| **A3-08** | Operation Broken Crown | Windows PrivEsc | Unquoted service binary path hijack | `flag{unquoted_service_path_privesc}` |

---

### ACT IV - THE SHATTER POINT
The Directorate retaliates. Milo sacrifices himself in `A4-05`. Aurelia's digital harvesting is exposed.

| ID | Title | Technique | Lab / Objective | Flag |
| :--- | :--- | :--- | :--- | :--- |
| **A4-01** | Operation Return Address | Stack Buffer Overflow | Legacy C binary EIP overwrite | `flag{stack_buffer_overflow_shell}` |
| **A4-02** | Operation Remote Code Execution | OS Command Injection | Shell metacharacter chaining in ping tool | `flag{command_injection_rce}` |
| **A4-03** | Operation Open Bucket | Cloud Misconfiguration | Public S3 bucket backup file extraction | `flag{public_s3_bucket_exposure}` |
| **A4-04** | Operation Broken Cell | Docker Escape | Mounted Docker socket host escape | `flag{docker_socket_host_escape}` |
| **A4-05** | Operation Signature Veil | EDR Evasion | Payload obfuscation & in-memory execution | `flag{av_bypass_in_memory}` |
| **A4-06** | Operation False Object | Insecure Deserialization| Python pickle cookie deserialization RCE | `flag{insecure_deserialization_rce}` |
| **A4-07** | Operation Familiar Voice | Social Engineering | Pretext phishing & credential harvest | `flag{phishing_credential_harvest}` |

---

### ACT V - THE REASSEMBLY
Forensics, incident reconstruction, and the final chained assault on Aether Core.

| ID | Title | Technique | Lab / Objective | Flag |
| :--- | :--- | :--- | :--- | :--- |
| **A5-01** | Operation Last Known Position | Digital Forensics | Cross-log incident timeline correlation | `flag{log_timeline_correlation}` |
| **A5-02** | Operation Hidden Frame | Steganography & Memory | LSB extraction & RAM dump inspection | `flag{steganography_memory_forensics}` |
| **A5-03** | Operation Long Shadow | Post-Exploitation Web Shell| Obfuscated PHP backdoor discovery | `flag{webshell_persistence_discovered}` |
| **A5-04** | Operation Filtered Truth | WAF Filter Bypass | Case-folding and comment WAF evasion | `flag{waf_encoding_bypass}` |
| **A5-05** | Operation Reassembly | Chained Kill Chain | Chain SQLi, SSRF, RCE, and AV Evasion | `flag{aether_core_reassembled}` |
