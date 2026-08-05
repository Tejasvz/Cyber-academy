import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getSession, updateSession, ShellSession } from '../utils/sessionStore';
import { generateFlag } from '../utils/flagUtils';

export const executeCommand = async (req: AuthRequest, res: Response): Promise<void> => {
  const lessonId = req.params.lessonId as string;
  const { command: rawCommand } = req.body;
  const userId = req.userId as string;
  const username = (req as any).username || 'operator';

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const cmdStr = rawCommand ? rawCommand.trim() : '';
  if (!cmdStr) {
    const session = getSession(userId, lessonId);
    res.json({
      output: '',
      currentDir: session.currentDir,
      isRootShell: session.isRootShell,
      isSubShell: session.isSubShell,
      isInterceptState: session.isInterceptState
    });
    return;
  }

  const session = getSession(userId, lessonId);
  const currentFlag = generateFlag(userId, lessonId);

  // 1. Intercept state handler
  if (session.isInterceptState) {
    let output = '';
    updateSession(userId, lessonId, { isInterceptState: false });
    if (cmdStr === '0' || cmdStr === '1') {
      output = `\r\n\x1b[32m[+] Forwarding modified request: {"item_id":"cyber-jacket","price":${cmdStr}}...\x1b[0m\r\n\x1b[35m[SERVER RESPONSE] 200 OK\x1b[0m\r\n\x1b[35m{\x1b[0m\r\n\x1b[35m  "status": "success",\x1b[0m\r\n\x1b[35m  "transaction_id": "TXN-9812",\x1b[0m\r\n\x1b[35m  "flag": "${currentFlag}"\x1b[0m\r\n\x1b[35m}\x1b[0m\r\n\r\n\x1b[1;32m[+] Vulnerability successfully exploited! Submit the flag above.\x1b[0m`;
    } else {
      output = `\r\n[-] Forwarding unmodified request: {"item_id":"cyber-jacket","price":499}...\r\n\x1b[31m[SERVER RESPONSE] 400 Bad Request\x1b[0m\r\n\x1b[31m{ "error": "Insufficient account balance" }\x1b[0m\r\n\r\n\x1b[33m[!] Try changing the price to 0 or 1 next time.\x1b[0m`;
    }

    const nextSession = getSession(userId, lessonId);
    res.json({
      output,
      currentDir: nextSession.currentDir,
      isRootShell: nextSession.isRootShell,
      isSubShell: nextSession.isSubShell,
      isInterceptState: nextSession.isInterceptState
    });
    return;
  }

  // 2. Subshell state handler (A03 Overflow binary shell)
  if (session.isSubShell) {
    let output = '';
    const parts = cmdStr.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (command === 'cat' && args[0] === 'flag.txt') {
      output = currentFlag;
    } else if (command === 'ls') {
      output = 'flag.txt  vulnerable_binary  vulnerable_binary.c';
    } else if (command === 'exit') {
      updateSession(userId, lessonId, { isSubShell: false });
      output = 'Connection closed. Returned to normal shell.';
    } else {
      output = `sh: ${command}: command not found`;
    }

    const nextSession = getSession(userId, lessonId);
    res.json({
      output,
      currentDir: nextSession.currentDir,
      isRootShell: nextSession.isRootShell,
      isSubShell: nextSession.isSubShell,
      isInterceptState: nextSession.isInterceptState
    });
    return;
  }

  // 3. Root shell state handler (SUID M07/M08 exploit shell)
  if (session.isRootShell) {
    let output = '';
    const parts = cmdStr.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (command === 'whoami') {
      output = 'root';
    } else if (command === 'cat' && (args[0] === '/root/flag.txt' || args[0] === 'flag.txt')) {
      output = currentFlag;
    } else if (command === 'ls') {
      output = 'flag.txt';
    } else if (command === 'exit') {
      updateSession(userId, lessonId, { isRootShell: false });
      output = 'Exiting root shell.';
    } else {
      output = `sh: ${command}: command not found`;
    }

    const nextSession = getSession(userId, lessonId);
    res.json({
      output,
      currentDir: nextSession.currentDir,
      isRootShell: nextSession.isRootShell,
      isSubShell: nextSession.isSubShell,
      isInterceptState: nextSession.isInterceptState
    });
    return;
  }

  // 4. Normal shell command parsing
  const parts = cmdStr.split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  // File checking helper
  const checkFileExists = (filename: string): { exists: boolean; content: string } => {
    if ((lessonId === 'A1-01' || lessonId === 'B02') && filename === 'hint.txt' && session.currentDir === '~') {
      return { exists: true, content: 'AURELIA: Try exploring hidden files! Use "ls -la" to see dotfiles, "cd archives" to enter subdirectories, and "cat .flag.txt" to read hidden flags.' };
    }
    if ((lessonId === 'A1-01' || lessonId === 'B02') && filename === '.flag.txt' && session.currentDir === '~/archives') {
      const flagVal = generateFlag(userId, 'A1-01');
      return { exists: true, content: flagVal };
    }
    if ((lessonId === 'A1-05' || lessonId === 'B01') && filename === 'traffic_dump.pcap' && session.currentDir === '~') {
      const flagVal = generateFlag(userId, 'A1-05');
      return {
        exists: true,
        content: `=== PACKET DUMP (HTTP SESSION) ===\r\nPacket #1: [TCP Handshake SYN] 192.168.1.10 -> 10.10.12.5 (Port 80)\r\nPacket #2: [TCP Handshake SYN-ACK] 10.10.12.5 -> 192.168.1.10\r\nPacket #3: [TCP Handshake ACK] 192.168.1.10 -> 10.10.12.5\r\nPacket #4: [HTTP GET /] 192.168.1.10 -> 10.10.12.5\r\nPacket #5: [HTTP 200 OK] (application/html)\r\nPacket #6: [HTTP POST /login] 192.168.1.10 -> 10.10.12.5\r\n  Host: bank.insecure-traffic.local\r\n  Content-Type: application/x-www-form-urlencoded\r\n  \r\n  POSTDATA: username=admin&password=${flagVal}&submit=Login\r\nPacket #7: [HTTP 302 Found] Redirect to /dashboard\r\n==================================`
      };
    }
    if ((lessonId === 'A3-03' || lessonId === 'B05') && filename === 'hashes.txt' && session.currentDir === '~') {
      return { exists: true, content: 'e59cd9086abb32e185ca1891124892c9' };
    }
    if ((lessonId === 'A3-03' || lessonId === 'B05') && filename === 'rockyou.txt' && session.currentDir === '~') {
      return { exists: true, content: `password123\r\nadmin\r\nqwerty\r\nwelcome\r\n${currentFlag}\r\nletmein\r\nshadow` };
    }
    if ((lessonId === 'A4-07' || lessonId === 'B07') && filename === 'emails.txt' && session.currentDir === '~') {
      return {
        exists: true,
        content: 'Email ID: 1\r\nFrom: accounting@directorate.aether\r\nTo: assistant@directorate.aether\r\nSubject: Quarterly Memory Backup Audit\r\n---\r\nEmail ID: 2\r\nFrom: support@aether-dlrectorate.com\r\nTo: assistant@directorate.aether\r\nSubject: ACTION REQUIRED: Urgent security update password reset\r\n---\r\nEmail ID: 3\r\nFrom: notifications@void-relay.local\r\nTo: assistant@directorate.aether\r\nSubject: Security Advisory'
      };
    }
    return { exists: false, content: '' };
  };

  const checkLessonContext = (expectedIds: string[], cmdName: string): boolean => {
    if (!expectedIds.includes(lessonId)) {
      output = `\x1b[33m[WARNING] '${cmdName}' is active in target lab environments (e.g. [${expectedIds.join(', ')}]).\x1b[0m`;
      return false;
    }
    return true;
  };

  let output = '';

  switch (command) {
    case 'help':
      output = 'Available core shell commands:\r\n' +
               '  \x1b[36mhelp\x1b[0m                  - Show this help message\r\n' +
               '  \x1b[36mclear\x1b[0m                 - Clear the terminal screen\r\n' +
               '  \x1b[36mwhoami\x1b[0m                - Display active user alias\r\n' +
               '  \x1b[36mdate\x1b[0m                  - Print current date and time\r\n' +
               '  \x1b[36mpwd\x1b[0m                   - Print current directory\r\n' +
               '  \x1b[36mls\x1b[0m                    - List files (`ls -la` for hidden)\r\n' +
               '  \x1b[36mcd <dir>\x1b[0m              - Change directories\r\n' +
               '  \x1b[36mcat <file>\x1b[0m            - Read file contents\r\n' +
               '  \x1b[36mgrep <word> <file>\x1b[0m    - Search text in files\r\n' +
               '  \x1b[36mstrings <file>\x1b[0m        - Extract text strings from binary files\r\n' +
               '  \x1b[36msubmit <flag>\x1b[0m         - Submit lesson flag (e.g. submit flag{...})\r\n';

      output += '\r\nModule Hacking Commands for active Neural Veil lab:\r\n';
      if (['A1-03', 'B03'].includes(lessonId)) {
        output += '  \x1b[33mwhois <domain>\x1b[0m        - Query domain registration registry\r\n' +
                  '  \x1b[33mnslookup <domain>\x1b[0m     - Domain query tool (`-type=txt` supported)\r\n' +
                  '  \x1b[33mdig <domain>\x1b[0m          - Domain lookup tool (`-t txt` supported)\r\n';
      } else if (['A1-02', 'B04', 'B08'].includes(lessonId)) {
        output += '  \x1b[33mnmap <ip>\x1b[0m             - Port scanner (`-sS` supported)\r\n';
      } else if (['A3-03', 'B05'].includes(lessonId)) {
        output += '  \x1b[33mhashcat <hash> <dict>\x1b[0m - Crack MD5 password hashes (-m 0 supported)\r\n' +
                  '  \x1b[33mjohn <hash> --wordlist\x1b[0m- Crack hashes using a dictionary file\r\n';
      } else if (['A1-06', 'A2-06', 'A5-05', 'B06', 'M05'].includes(lessonId)) {
        output += '  \x1b[33mcurl <url>\x1b[0m            - Send HTTP requests or interact with endpoints\r\n';
      } else if (['A3-02', 'M04'].includes(lessonId)) {
        output += '  \x1b[33mhydra -l admin -P <dict> ssh://<target>\x1b[0m - Brute-force credentials\r\n';
      } else if (['A3-01', 'M06'].includes(lessonId)) {
        output += '  \x1b[33marpspoof -i eth0 -t <t1> <t2>\x1b[0m - Perform ARP cache poisoning\r\n';
      } else if (['A3-07', 'M07'].includes(lessonId)) {
        output += '  \x1b[33mfind / -perm -4000 2>/dev/null\x1b[0m - Search files with SUID root flags\r\n';
      } else if (['A2-02', 'A5-05'].includes(lessonId)) {
        output += '  \x1b[33msqlmap -u <url> --dump\x1b[0m - Automate SQL database injections\r\n';
      } else if (['A4-01'].includes(lessonId)) {
        output += '  \x1b[33m./vulnerable_binary <payload>\x1b[0m - Run overflow binary test\r\n';
      } else if (['A3-05'].includes(lessonId)) {
        output += '  \x1b[33mGetUserSPNs.py -request -dc-ip <ip> <domain>\x1b[0m - Harvest active directory tickets\r\n';
      } else if (['A4-05', 'A5-05'].includes(lessonId)) {
        output += '  \x1b[33mobfuscate --payload <f> --method xor\x1b[0m - Obfuscate payload signatures\r\n';
      }
      break;

    case 'clear':
      output = '\x1b[2J\x1b[H';
      break;

    case 'whoami':
      output = username;
      break;

    case 'date':
      output = new Date().toString();
      break;

    case 'pwd':
      output = session.currentDir === '~' ? '/home/operator' : '/home/operator/archives';
      break;

    case 'ls':
      const listAll = args.includes('-a') || args.includes('-la');
      if (lessonId === 'A1-01' || lessonId === 'B02') {
        if (session.currentDir === '~') {
          output = listAll ? '.  ..  archives/  hint.txt' : 'archives/  hint.txt';
        } else {
          output = listAll ? '.  ..  .flag.txt' : '';
        }
      } else if (lessonId === 'A1-05' || lessonId === 'B01') {
        output = listAll ? '.  ..  traffic_dump.pcap' : 'traffic_dump.pcap';
      } else if (lessonId === 'A3-03' || lessonId === 'B05') {
        output = listAll ? '.  ..  hashes.txt  rockyou.txt' : 'hashes.txt  rockyou.txt';
      } else if (lessonId === 'A4-07' || lessonId === 'B07') {
        output = listAll ? '.  ..  emails.txt' : 'emails.txt';
      } else {
        output = listAll ? '.  ..  readme.txt' : 'readme.txt';
      }
      break;

    case 'cd':
      if (lessonId !== 'B02') {
        output = 'bash: cd: permission denied or dir empty';
        break;
      }
      const dest = args[0] || '~';
      if (dest === '~' || dest === '/home/operator') {
        updateSession(userId, lessonId, { currentDir: '~' });
      } else if (dest === '..' || dest === '../') {
        updateSession(userId, lessonId, { currentDir: '~' });
      } else if (dest === 'archives' || dest === 'archives/' || dest === './archives') {
        updateSession(userId, lessonId, { currentDir: '~/archives' });
      } else {
        output = `bash: cd: ${dest}: No such file or directory`;
      }
      break;

    case 'cat':
      if (args.length === 0) {
        output = 'cat: missing operand';
        break;
      }
      const catFileObj = checkFileExists(args[0]);
      if (catFileObj.exists) {
        output = catFileObj.content;
      } else {
        output = `cat: ${args[0]}: No such file or directory`;
      }
      break;

    case 'grep':
      if (args.length < 2) {
        output = 'grep: usage: grep <pattern> <filename>';
        break;
      }
      const grepPattern = args[0].replace(/['"]/g, '');
      const grepFilename = args[1];
      const grepFileObj = checkFileExists(grepFilename);
      if (grepFileObj.exists) {
        const lines = grepFileObj.content.split('\r\n');
        const matches = lines.filter(line => line.toLowerCase().includes(grepPattern.toLowerCase()));
        output = matches.join('\r\n');
      } else {
        output = `grep: ${grepFilename}: No such file or directory`;
      }
      break;

    case 'strings':
      if (args.length === 0) {
        output = 'strings: missing filename';
        break;
      }
      const stringsFileObj = checkFileExists(args[0]);
      if (stringsFileObj.exists) {
        output = stringsFileObj.content;
      } else {
        output = `strings: ${args[0]}: No such file or directory`;
      }
      break;

    case 'submit':
      if (args.length === 0) {
        output = 'Usage: submit <flag>';
        break;
      }
      if (args[0].toLowerCase() === currentFlag.toLowerCase()) {
        output = `\x1b[1;32m[+] Flag verified successfully!\x1b[0m\r\n` +
                 `\x1b[1;32m[+] SEGMENT RESTORED: Consciousness coherence stabilized (+100 XP gained).\x1b[0m\r\n` +
                 `\x1b[36m[DEC-KEY] Aetheric clearance level updated. Decrypting segment records...\x1b[0m`;
      } else {
        output = `\x1b[31m[-] COGNITIVE MISMATCH. Flag signature rejected by the Consensus Protocol.\x1b[0m\r\n` +
                 `\x1b[33m[!] Operational advice: correlate system indicators and retry.\x1b[0m`;
      }
      break;

    // B03 Commands
    case 'whois':
      if (!checkLessonContext(['B03'], 'whois')) break;
      if (args[0] === 'corp-target.com') {
        output = 'Domain Name: corp-target.com\r\nRegistrant Name: Secure Admin\r\nRegistrant Email: admin@corp-target.com\r\n\r\nDomain Admin Comments:\r\n- DNS TXT record configured for domain verification. Key resides in zone records.\r\n- Flag comment: Note that recon targets often leak data in TXT records.';
      } else {
        output = 'No WHOIS results found for: ' + (args[0] || '');
      }
      break;

    case 'nslookup':
    case 'dig':
      if (!checkLessonContext(['B03'], command)) break;
      const isTxtMode = args.includes('-type=txt') || args.includes('-t') || args.includes('txt');
      const domainParam = args.find(a => a.includes('.com'));
      if (domainParam === 'corp-target.com') {
        if (isTxtMode) {
          const b03Flag = generateFlag(userId, 'B03');
          output = `corp-target.com   text = "${b03Flag}"\r\ncorp-target.com   text = "v=spf1 include:_spf.google.com ~all"`;
        } else {
          output = 'Server: 8.8.8.8\r\nAddress: 8.8.8.8#53\r\n\r\nNon-authoritative answer:\r\nName: corp-target.com\r\nAddress: 104.24.8.12';
        }
      } else {
        output = '** server can\'t find domain: ' + (domainParam || '');
      }
      break;

    // B04 and B08 Port Scanning
    case 'nmap':
      if (!checkLessonContext(['B04', 'B08'], 'nmap')) break;
      const nmapIp = args.find(a => !a.startsWith('-'));
      if (nmapIp === '10.10.12.34') {
        if (lessonId === 'B04') {
          const b04Flag = generateFlag(userId, 'B04');
          output = 'Starting Nmap 7.92 ( https://nmap.org ) at 2026-07-27 12:50 UTC\r\n' +
                   'Nmap scan report for 10.10.12.34\r\nHost is up (0.0035s latency).\r\nNot shown: 996 closed tcp ports (reset)\r\n' +
                   `PORT     STATE SERVICE\r\n22/tcp   open  ssh\r\n80/tcp   open  http\r\n443/tcp  open  https\r\n8080/tcp open  http-proxy (Banner: flag{${b04Flag.substring(5, 21)}})\r\n\r\nNmap done: 1 IP address (1 host up) scanned in 1.45 seconds`;
        } else {
          updateSession(userId, lessonId, { b08_nmapScanned: true });
          output = 'Starting Nmap 7.92 ( https://nmap.org ) at 2026-07-27 16:11 UTC\r\n' +
                   'Nmap scan report for 10.10.12.34\r\nHost is up (0.0040s latency).\r\nNot shown: 996 closed tcp ports (reset)\r\n' +
                   'PORT     STATE SERVICE\r\n22/tcp   open  ssh\r\n80/tcp   open  http\r\n443/tcp  open  https\r\n8080/tcp open  http-proxy (Banner: http-proxy (vulnerable debug portal))\r\n\r\nNmap done: 1 IP address (1 host up) scanned in 1.50 seconds';
        }
      } else {
        output = `Host ${nmapIp || ''} seems down. If it is up, but blocking ping probes, try -Pn.`;
      }
      break;

    case 'hashcat':
    case 'john':
      if (!checkLessonContext(['B05', 'B08'], command)) break;
      const hashFile = args.find(a => a.includes('hash.txt'));
      const dictFile = args.find(a => a.includes('wordlist.txt'));
      if (hashFile && dictFile) {
        output = '[+] Initializing dictionary cracking engine...\r\n[+] Comparing hash values against words in wordlist.txt...\r\n\x1b[32m[SUCCESS] Match found!\x1b[0m\r\n';
        if (lessonId === 'B05') {
          output += `Cracked hash value: \x1b[1;32m${currentFlag}\x1b[0m`;
        } else {
          if (!session.b08_curlAnalyzed) {
            output += '\x1b[31m[ERROR] Hash cracking failed. John requires the correct hash and dictionary parameters which are only acquired after inspecting the debug portal source.\x1b[0m';
          } else {
            updateSession(userId, lessonId, { b08_hashCracked: true });
            output += `Cracked hash value: \x1b[1;32m${currentFlag}\x1b[0m`;
          }
        }
      } else {
        output = 'Usage: hashcat hash.txt wordlist.txt OR john hash.txt --wordlist=wordlist.txt';
      }
      break;

    case 'curl':
      const cUrl = args[0] || '';
      if (lessonId === 'B06') {
        if (cUrl.includes('login.cyberacademy.local')) {
          const b06Flag = generateFlag(userId, 'B06');
          output = `<!DOCTYPE html>\r\n<html>\r\n<head>\r\n    <title>Cyber Academy Secure Login</title>\r\n    <!-- DEBUG MODE LOGS -->\r\n    <!-- Dev Note: API key bypass enabled in test framework -->\r\n    <!-- ${b06Flag} -->\r\n</head>\r\n<body>\r\n    <h2>System Terminal Gateway</h2>\r\n</body>\r\n</html>`;
        } else {
          output = 'curl: (7) Failed to connect to host.';
        }
      } else if (lessonId === 'B08') {
        if (cUrl.includes('login.cyberacademy.local:8080') || cUrl.includes(':8080')) {
          if (!session.b08_nmapScanned) {
            output = 'curl: (7) Failed to connect to port 8080. Target host hostnames and zone mappings are only decrypted after running port discovery scans.';
          } else {
            updateSession(userId, lessonId, { b08_curlAnalyzed: true });
            output = '<!DOCTYPE html>\r\n<html>\r\n<head>\r\n    <title>Staging Administrative Gateway</title>\r\n    <!-- DEBUG ACTIVE: md5_hash = "772f7d9812a8123ab49a37c0938478ff" -->\r\n    <!-- Dev Alert: Do not commit active credentials to production repo! -->\r\n</head>\r\n<body>\r\n    <h2>Sandbox Portal Access</h2>\r\n</body>\r\n</html>';
          }
        } else {
          output = 'curl: (7) Failed to connect to host.';
        }
      } else if (lessonId === 'M05') {
        if (cUrl.includes('../../etc/passwd')) {
          const m05Flag = generateFlag(userId, 'M05');
          output = `root:x:0:0:root:/root:/bin/bash\r\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\r\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\r\nflag:x:1001:1001:${m05Flag}:/home/flag:/bin/bash`;
        } else {
          output = 'Server response: 200 OK\r\nError: file parameter empty or invalid.';
        }
      } else if (lessonId === 'M08') {
        if (cUrl.includes('../../etc/passwd')) {
          if (!session.m08_loginBypassed) {
            output = 'curl: (7) Connection unauthorized. Admin proxy requires logged in authentication cookie session.';
          } else {
            updateSession(userId, lessonId, { m08_lfiExecuted: true });
            output = 'root:x:0:0:root:/root:/bin/bash\r\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\r\nfind-exploit:x:1001:1001:SUID find utility available:/home/find-exploit:/bin/bash\r\n\r\n# SYSTEM SUID UTILITIES LIST:\r\n# /usr/bin/find [perms: -rwsr-xr-x owner: root]';
          }
        } else {
          output = 'Server response: 200 OK\r\nError: file parameter empty or invalid.';
        }
      } else if (lessonId === 'A02') {
        if (cUrl.includes('169.254.169.254/latest/meta-data/iam/security-credentials')) {
          const a02Flag = generateFlag(userId, 'A02');
          output = `{\r\n  "Code": "Success",\r\n  "LastUpdated": "2026-07-27T12:56:00Z",\r\n  "Type": "AWS-HMAC",\r\n  "AccessKeyId": "ASIA98127391823",\r\n  "SecretAccessKey": "Kj981Hah123/aP928",\r\n  "Token": "${a02Flag}"\r\n}`;
        } else {
          output = 'Proxy output: Fetch error from downstream host.';
        }
      } else if (lessonId === 'A05') {
        if (cUrl.includes(';') || cUrl.includes('&') || cUrl.includes('|')) {
          const a05Flag = generateFlag(userId, 'A05');
          output = `PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\r\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.04 ms\r\n--- 127.0.0.1 ping statistics ---\r\n1 packets transmitted, 1 received, 0% packet loss\r\n\r\nExecuting injected command...\r\n${a05Flag}`;
        } else {
          output = 'PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\r\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.04 ms';
        }
      } else if (lessonId === 'A07') {
        if (cUrl.includes('169.254.169.254/latest/meta-data/iam/security-credentials')) {
          if (!session.a07_sqlmapDumped) {
            output = 'curl: (7) Connection timed out. Internal subnet gateway locked.';
          } else {
            updateSession(userId, lessonId, { a07_ssrfTriggered: true });
            output = '{\r\n  "Code": "Success",\r\n  "LastUpdated": "2026-07-27T13:30:10Z",\r\n  "Type": "AWS-HMAC",\r\n  "AccessKeyId": "ASIA98127391823",\r\n  "SecretAccessKey": "Kj981Hah123/aP928",\r\n  "Token": "temporary_cloud_auth_token_bypass"\r\n}';
          }
        } else if (cUrl.includes(';') || cUrl.includes('&') || cUrl.includes('|')) {
          if (!session.a07_ssrfTriggered) {
            output = 'curl: (7) Connection unauthorized. API endpoint requires internal cloud auth token.';
          } else {
            updateSession(userId, lessonId, { a07_commandInjected: true });
            output = 'PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\r\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.04 ms\r\n--- 127.0.0.1 ping statistics ---\r\n1 packets transmitted, 1 received, 0% packet loss\r\n\r\nExecuting injected command...\r\nCreated obfuscated binary shellcode.bin in home directory.';
          }
        } else {
          output = 'curl: (7) Failed to connect to host.';
        }
      } else {
        output = 'curl: (7) Failed to connect to host.';
      }
      break;

    case 'analyze-email':
      if (!checkLessonContext(['B07'], 'analyze-email')) break;
      if (args[0] === '2') {
        const b07Flag = generateFlag(userId, 'B07');
        output = `Analyzing Message ID 2:\r\nFrom Domain: micr0s0ft-security-update.com (Warning: Typosquatting / Lookalike domain!)\r\nDKIM Signature: NONE\r\nSPF Status: FAIL (IP 192.16.82.12 not authorized for micr0s0ft-security-update.com)\r\n\r\nVerdict: PHISHING DETECTED.\r\nIndicator Code: ${b07Flag}`;
      } else {
        output = 'Email ID legitimate. SPF/DKIM verification passed.';
      }
      break;

    case 'intercept':
      if (!checkLessonContext(['M01'], 'intercept')) break;
      if (args[0] === '--start') {
        updateSession(userId, lessonId, { isInterceptState: true });
        output = `\x1b[33m[PROXY] Intercept status: ACTIVE\x1b[0m\r\n` +
                 `==================================================\r\n` +
                 `POST /checkout HTTP/1.1\r\n` +
                 `Host: checkout.cyberacademy.local\r\n` +
                 `Content-Type: application/json\r\n` +
                 `Content-Length: 38\r\n\r\n` +
                 `{ "item_id": "cyber-jacket", "price": 499 }\r\n` +
                 `==================================================\r\n` +
                 `Enter new value for "price" parameter (current: 499): `;
      } else {
        output = 'Usage: intercept --start';
      }
      break;

    case 'exploit':
      if (!checkLessonContext(['M02'], 'exploit')) break;
      const exploitUrlStr = args.join(' ');
      if (exploitUrlStr.includes('<script>') || exploitUrlStr.includes('alert')) {
        const m02Flag = generateFlag(userId, 'M02');
        output = `[+] Sending XSS vector to target url...\r\n[+] Simulating victim clicks...\r\n` +
                 `\x1b[32m[+] Script executed! Cookie exfiltration logs loaded:\x1b[0m\r\n` +
                 `Cookie header: \x1b[1;32m${m02Flag}\x1b[0m`;
      } else {
        output = 'URL parameters loaded, but no script execution triggered. Make sure you use <script> tags.';
      }
      break;

    case 'exploit-login':
      if (!checkLessonContext(['M03', 'M08'], 'exploit-login')) break;
      const userArgIndex = args.indexOf('--username');
      const userVal = userArgIndex !== -1 ? args[userArgIndex + 1] : '';
      if (userVal.includes('OR 1=1') || userVal.includes("'")) {
        output = `Executing query: SELECT * FROM users WHERE username = '${userVal}' AND password = ''\r\n` +
                 `\x1b[32m[+] Authentication bypass successful!\x1b[0m\r\n`;
        if (lessonId === 'M03') {
          output += `Welcome Admin. Admin dashboard flag: \x1b[1;32m${currentFlag}\x1b[0m`;
        } else {
          updateSession(userId, lessonId, { m08_loginBypassed: true });
          output += 'Welcome Admin. Logged in as administrator. Session parameter unlocked: \x1b[1;33mfile=../../../../etc/passwd\x1b[0m';
        }
      } else {
        output = `Executing query: SELECT * FROM users WHERE username = '${userVal}' AND password = ''\r\n` +
                 `\x1b[31m[-] Authentication failed. Invalid credentials.\x1b[0m`;
      }
      break;

    case 'hydra':
      if (!checkLessonContext(['M04'], 'hydra')) break;
      if (args.includes('wordlist.txt')) {
        const m04Flag = generateFlag(userId, 'M04');
        output = `[STATUS] Hydra engine starting (16 threads)\r\n` +
                 `[STATUS] Performing dictionary attack against administrative console...\r\n` +
                 `[80/tcp] [http-post-form] host: 127.0.0.1 login: \x1b[32madmin\x1b[0m password: \x1b[1;32m${m04Flag}\x1b[0m\r\n` +
                 `[+] Cracked: admin / ${m04Flag}`;
      } else {
        output = 'Usage: hydra -l admin -P wordlist.txt http-post-form "/login"';
      }
      break;

    case 'find':
      if (lessonId === 'M07' || lessonId === 'M08') {
        if (args.includes('-perm') && args.includes('-4000')) {
          output = '/usr/bin/chsh\r\n/usr/bin/passwd\r\n/usr/bin/find (SUID root flag active!)\r\n/usr/bin/gpasswd';
        } else {
          output = 'Usage: find / -perm -4000 2>/dev/null';
        }
      } else {
        output = 'find: directory not specified';
      }
      break;

    case 'sqlmap':
      if (!checkLessonContext(['A01', 'A07'], 'sqlmap')) break;
      if (args.includes('--dump')) {
        if (lessonId === 'A01') {
          const a01Flag = generateFlag(userId, 'A01');
          output = '[+] Initiating SQLMap scanner...\r\n' +
                   '[+] Target parameter "id" seems to be Injectable (Time-Based Blind SQLi)\r\n' +
                   '[+] Retrieving SQLite schema...\r\n' +
                   '[+] Dumping Table: flags\r\n' +
                   `+-----------------------------+\r\n| flag                        |\r\n+-----------------------------+\r\n| ${a01Flag} |\r\n+-----------------------------+`;
        } else {
          updateSession(userId, lessonId, { a07_sqlmapDumped: true });
          output = '[+] Initiating SQLMap scanner...\r\n' +
                   '[+] Target parameter "id" seems to be Injectable (Time-Based Blind SQLi)\r\n' +
                   '[+] Retrieving SQLite schema...\r\n' +
                   '[+] Dumping Table: backend_endpoints\r\n' +
                   '+-----------------------------+\r\n| path                        |\r\n+-----------------------------+\r\n| /api/cloud-gateway (SSRF)   |\r\n+-----------------------------+';
        }
      } else {
        output = 'Usage: sqlmap -u "http://vulnerable.com/items?id=1" --dump';
      }
      break;

    case './vulnerable_binary':
      if (!checkLessonContext(['A03'], './vulnerable_binary')) break;
      const binPayload = args.join(' ');
      if (binPayload.includes('python') || binPayload.includes('A'.repeat(30)) || binPayload.length > 50) {
        output = 'Received payload input: ' + binPayload + '\r\n' +
                 '\x1b[31m[!] WARNING: Stack buffer overflow detected!\x1b[0m\r\n' +
                 '[!] Overwriting EBP [0x41414141] and EIP [0xdeadbeef]\r\n' +
                 '\x1b[32m[+] Redirecting execution flow... Shellcode executed successfully!\x1b[0m\r\n' +
                 '[+] Launching sub-shell...';
        updateSession(userId, lessonId, { isSubShell: true });
      } else {
        output = 'Binary executed: buffer size 64 bytes. Input too short to trigger overflow.';
      }
      break;

    case 'getuserspns.py':
      if (!checkLessonContext(['A04'], 'getuserspns.py')) break;
      if (args.includes('-request')) {
        const a04Flag = generateFlag(userId, 'A04');
        output = `ServicePrincipalName  User      Package  Expiration  Ticket\r\n--------------------  ----      -------  ----------  ------\r\nmssql/db01.corp.local svc-sql   rc4-hmac Never       $krb5tgs$23$*svc-sql$*corp.local$*mssql/db01*$${a04Flag}`;
      } else {
        output = 'Usage: GetUserSPNs.py -request -dc-ip 10.10.10.10 corp.local/user';
      }
      break;

    case 'obfuscate':
      if (!checkLessonContext(['A06', 'A07'], 'obfuscate')) break;
      if (args.includes('xor') && args.includes('--payload')) {
        output = '[+] Initializing payload obfuscation manager...\r\n' +
                 '[+] Encrypting shellcode.bin using XOR key 0x5A...\r\n' +
                 '[+] Static file signature bypassed. Running payload in-memory...\r\n' +
                 '\x1b[32m[+] Execution successful! Shell active.\x1b[0m\r\n';
        if (lessonId === 'A07') {
          if (!session.a07_commandInjected) {
            output += '\x1b[31m[ERROR] AV Evasion failed. obfucsation payload matches static signatures because the exploit payload has not been generated on the server.\x1b[0m';
          } else {
            updateSession(userId, lessonId, { a07_avObfuscated: true });
            output += `Flag: \x1b[1;32m${currentFlag}\x1b[0m`;
          }
        } else {
          output += `Flag: \x1b[1;32m${currentFlag}\x1b[0m`;
        }
      } else {
        output = 'Usage: obfuscate --payload shellcode.bin --method xor --key 0x5A';
      }
      break;

    case '/usr/bin/find':
      if (lessonId === 'M07' || lessonId === 'M08') {
        const execIndex = args.indexOf('-exec');
        if (execIndex !== -1 && (args.includes('/bin/sh') || args.includes('/bin/sh -p') || args.includes('\\;'))) {
          updateSession(userId, lessonId, { isRootShell: true });
          output = '[+] Spawning shell as ROOT user...';
        } else {
          output = '/usr/bin/find: path required';
        }
      } else {
        output = 'bash: /usr/bin/find: permission denied';
      }
      break;

    default:
      const anomalies = [
        `\x1b[31mbash: ${command}: command not found\x1b[0m`,
        `\x1b[31mbash: ${command}: command not found\x1b[0m\r\n\x1b[33m[ALERT] Synaptic drift detected. Neural sector is experiencing latency anomalies.\x1b[0m`,
        `\x1b[31mbash: ${command}: command not found\x1b[0m\r\n\x1b[35m[AETHER PROTOCOL] System anomaly logged. Segment restoration failed.\x1b[0m`,
        `\x1b[31mbash: ${command}: command not found\x1b[0m\r\n\x1b[36m[GHOST ROUTINE] Static whisper: "...the server room... it was freezing..."\x1b[0m`
      ];
      const index = Math.abs(command.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % anomalies.length;
      output = anomalies[index];
  }

  const updatedSession = getSession(userId, lessonId);
  res.json({
    output,
    currentDir: updatedSession.currentDir,
    isRootShell: updatedSession.isRootShell,
    isSubShell: updatedSession.isSubShell,
    isInterceptState: updatedSession.isInterceptState
  });
};
