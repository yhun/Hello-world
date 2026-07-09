# Network Security Check Implementation Plan

> **For agentic workers:** This is an audit/assessment plan, not a code-implementation plan. Each task is a checkable audit action producing a findings entry, not a code change. Execute sequentially; each task's deliverable feeds the final report.

**Goal:** Produce a structured, evidence-based network security assessment covering perimeter, internal network, access control, encryption, monitoring, and (optionally) cloud/web layers — ending in a prioritized findings report.

**Architecture:** A single running Markdown report file (`docs/security/network-audit-<date>.md`) is appended to after each task. Each task = one audit domain, with recommended tools, exact commands, what "pass/fail" looks like, and where findings get logged. Tasks are ordered from scoping → discovery → deep checks → reporting, matching how a real assessment flows (you can't scan what you haven't scoped).

**Tech Stack:** Nmap, OpenVAS/Nessus (or Greenbone Community Edition), testssl.sh, Nikto/OWASP ZAP (optional, web layer), ScoutSuite/Prowler (optional, cloud layer). All free/open-source except Nessus (has a free "Essentials" tier for ≤16 hosts).

## Global Constraints

- **Authorization first:** Do not run any active scan (Nmap SYN/vuln scans, OpenVAS, ZAP active scan) against any host without documented written authorization for that specific IP range/domain. This plan assumes you are auditing systems you own or are explicitly authorized to test.
- **Non-destructive by default:** Use scan modes that avoid DoS risk (e.g., avoid `--script vuln` categories known to crash services on fragile legacy devices; avoid intrusive brute-force modules) unless a maintenance window and rollback plan exist.
- **Evidence-based findings only:** Every entry in the report must cite the exact command run and its output (or a summary + saved raw output file) — no findings by assumption.
- **Scope is currently undefined ("ทั้งหมด/ยังไม่แน่ใจ"):** Task 1 exists specifically to fix this before any scanning happens. Do not skip it.

---

### Task 1: Define Scope & Rules of Engagement

**Files:**
- Create: `docs/security/network-audit-<date>.md` (the running report)
- Create: `docs/security/rules-of-engagement.md`

**Interfaces:**
- Produces: `docs/security/rules-of-engagement.md` — the authorized IP ranges/domains/systems list that every later task's commands must be scoped to. Later tasks read this file to know what's in-scope.

- [ ] **Step 1: Create the report skeleton**

- [ ] **Step 2: Fill in Rules of Engagement** (authorized scope, out-of-scope systems, sign-off owner, testing window, emergency contact, allowed scan intensity)

If you don't yet have a written scope, stop here and get one — everything downstream depends on this. Do not run Task 2+ against a range you don't have explicit sign-off for, even on your own home/office network, if others share it.

- [ ] **Step 3: Confirm scope covers which domains apply** — mark which of Tasks 3–10 apply (skip cloud/web tasks if no cloud accounts or web apps are in scope).

- [ ] **Step 4: Save** (no commit needed for this step alone).

---

### Task 2: Install & Verify Tooling

**Files:** Modify: `docs/security/network-audit-<date>.md` (append "Tooling" section)

**Interfaces:** Produces confirmation that Nmap, OpenVAS/Nessus, and testssl.sh are installed and runnable — Tasks 4–6 assume these binaries exist on PATH.

- [ ] Install Nmap (`winget install Insecure.Nmap` or https://nmap.org/download.html) and verify with `nmap --version`.
- [ ] Install a vulnerability scanner — Nessus Essentials (free, ≤16 IPs, https://www.tenable.com/products/nessus/nessus-essentials) or Greenbone/OpenVAS via Docker.
- [ ] Install testssl.sh: `git clone --depth 1 https://github.com/drwetter/testssl.sh.git ~/tools/testssl.sh` and verify with `~/tools/testssl.sh/testssl.sh --version`.
- [ ] Log tooling versions to the report.

---

### Task 3: Perimeter & Firewall Review

**Files:** Modify: `docs/security/network-audit-<date>.md` (append "Perimeter & Firewall" section)

**Interfaces:** Consumes `docs/security/rules-of-engagement.md` scope list. Produces list of externally-reachable open ports per in-scope host — Task 5 (vuln scanning) targets these same hosts/ports.

- [ ] External port scan of in-scope perimeter hosts:
  ```bash
  nmap -Pn -sS -p- --top-ports 1000 -oN perimeter_scan.txt <in-scope-ip-or-range>
  ```
- [ ] Interpret results — pass: only intentionally published services appear open; fail: any unexpected port open (RDP, SSH, MySQL, VNC exposed with no business justification).
- [ ] Cross-check open ports against the actual firewall/ACL rule export — any open port with no matching documented allow rule is a misconfiguration or shadow IT.
- [ ] Log findings (command, open ports, unjustified ports, firewall cross-check result).

---

### Task 4: Internal Host & Service Discovery

**Files:** Modify: `docs/security/network-audit-<date>.md` (append "Internal Discovery" section)

**Interfaces:** Consumes `docs/security/rules-of-engagement.md` internal scope. Produces live host inventory + open-service list — feeds Task 5 (vuln scan targets) and Task 7 (default-credential checks).

- [ ] Host discovery sweep: `nmap -sn <internal-subnet-cidr> -oN internal_hosts.txt`
- [ ] Service/version detection: `nmap -sV -sC -O -iL internal_hosts.txt -oN internal_services.txt`
- [ ] Interpret — pass: every live host is a known, inventoried asset with services matching its role; fail: unknown/rogue hosts, or services reachable beyond their intended segment.
- [ ] Check network segmentation by attempting cross-segment access: `nmap -Pn -p 22,80,443,3389,3306,445 <host-in-other-segment>` — pass: blocked/filtered; fail: reachable across segments that should be isolated.
- [ ] Log findings (live host count, unknown/rogue hosts, segmentation result).

---

### Task 5: Vulnerability Scanning

**Files:** Modify: `docs/security/network-audit-<date>.md` (append "Vulnerability Scan" section)

**Interfaces:** Consumes host list from Task 3 (perimeter) and Task 4 (`internal_hosts.txt`). Produces CVE/severity-rated findings list — feeds the final prioritized remediation summary (Task 11).

- [ ] Configure scan targets in Nessus/OpenVAS using a Basic Network Scan template against the combined host list.
- [ ] Run the scan and wait for completion.
- [ ] Interpret — pass: no Critical/High findings without a documented compensating control; fail: any unpatched Critical/High CVE on an internet-facing host, or any match against CISA's Known Exploited Vulnerabilities catalog.
- [ ] Export the report as CSV and summarize (scanner, date, critical/high counts, top findings, export path) into the report.

---

### Task 6: TLS/Encryption Review

**Files:** Modify: `docs/security/network-audit-<date>.md` (append "TLS/Encryption" section)

**Interfaces:** Consumes TLS-terminating endpoints (ports 443, 993, 636, etc.) from Task 3/4 service detection. Produces cipher/protocol grade per endpoint.

- [ ] Run testssl against each endpoint: `~/tools/testssl.sh/testssl.sh --quiet -oN tls_<hostname>.txt <hostname>:<port>`
- [ ] Interpret — pass: TLS 1.2+ only, no weak ciphers (RC4/3DES/NULL), valid non-expired certificate, HSTS present on web endpoints; fail: any weak protocol/cipher, or certificate expiring within 30 days.
- [ ] Log findings (endpoints checked, weak protocol/cipher findings, certificate issues).

---

### Task 7: Access Control & Authentication Review

**Files:** Modify: `docs/security/network-audit-<date>.md` (append "Access Control" section)

**Interfaces:** Consumes host/service inventory from Task 4. Produces default-credential and MFA-gap findings.

- [ ] Check for default credentials on discovered management interfaces (routers, switches, printers, IoT) — one documented default-credential attempt per device, not brute-force.
- [ ] Review remote-access authentication (VPN, RDP, SSH, admin portals) by checking config directly for MFA enforcement.
- [ ] Interpret — pass: no default creds work, MFA enforced on all remote-access paths; fail: any device on default creds, any password-only remote-access path.
- [ ] Log findings (devices tested, default creds still active, per-method MFA status).

---

### Task 8: Logging & Monitoring Review

**Files:** Modify: `docs/security/network-audit-<date>.md` (append "Logging & Monitoring" section)

**Interfaces:** Produces detection-capability gap list — informs remediation priority in Task 11 (a missing-logging finding often outranks a single unpatched CVE).

- [ ] Confirm firewall/VPN/critical server logs are shipped to a central SIEM/syslog/cloud log service rather than living only on each device.
- [ ] Generate a controlled, benign trigger (e.g. an intentional failed login on a test account) and confirm it appears centrally within a reasonable time (e.g. 5 minutes).
- [ ] Confirm log retention meets compliance/business requirements (commonly 90 days minimum).
- [ ] Log findings (central collection pass/fail + gaps, alert test result, retention value vs. requirement).

---

### Task 9 (Optional — only if cloud accounts are in scope): Cloud Security Posture

**Files:** Modify: `docs/security/network-audit-<date>.md` (append "Cloud Posture" section)

**Interfaces:** Consumes cloud account IDs from Rules of Engagement. Produces misconfiguration findings (public storage, over-permissive security groups, etc.)

- [ ] Install Prowler (`pip install prowler`) or ScoutSuite.
- [ ] Run against the in-scope account with **read-only credentials only**: `prowler aws --profile <in-scope-readonly-profile>`
- [ ] Interpret — pass: no public storage with sensitive data, no security groups open to 0.0.0.0/0 on sensitive ports, MFA enforced for root/admin; fail: any of the above present.
- [ ] Log findings (provider/account, critical misconfiguration count + list).

---

### Task 10 (Optional — only if web applications are in scope): Web Application Layer

**Files:** Modify: `docs/security/network-audit-<date>.md` (append "Web Application Layer" section)

**Interfaces:** Consumes web endpoints from Task 3/4 discovery. Produces OWASP-category findings (injection, XSS, missing security headers).

- [ ] Run OWASP ZAP baseline scan (passive, non-destructive):
  ```bash
  docker run -t zaproxy/zap-stable zap-baseline.py -t https://<in-scope-app-url> -r zap_report.html
  ```
- [ ] Interpret — pass: critical security headers present (CSP, X-Frame-Options, HSTS), no reflected input observed; fail: missing headers, or any Medium+ alert.
- [ ] Log findings (URLs tested, Medium+ alert count/summary, report path).

---

### Task 11: Consolidate Findings & Prioritize Remediation

**Files:** Modify: `docs/security/network-audit-<date>.md` (append final "Summary & Prioritized Remediation" section)

**Interfaces:** Consumes every "Findings" section written by Tasks 3–10. Produces the final deliverable — a ranked action list handed to whoever owns remediation.

- [ ] Pull every finding into one table: `Domain | Finding | Severity (Critical/High/Med/Low) | Affected asset | Recommended fix`.
- [ ] Rank by severity, then by exposure — internet-facing + Critical/High ranks above internal-only findings of the same severity.
- [ ] Write the summary table with Owner and Target date columns.
- [ ] Save the completed report as the final deliverable. Optionally `git init && git add docs/security/ && git commit` if version history of future re-audits is wanted.

---

## Verification

Since this is an assessment plan rather than a code change, "verification" means confirming the audit was actually performed and evidenced, not just checklisted:

1. Open `docs/security/network-audit-<date>.md` and confirm every applicable section (per Task 1 Step 3's checklist) has an entry with an actual command + actual output/summary — not a placeholder.
2. Confirm `docs/security/rules-of-engagement.md` has real values filled in (not `<fill in>`) before any scan task was executed.
3. Spot-check one finding per domain against its raw tool output file (e.g. `perimeter_scan.txt`, the Nessus CSV export) to confirm the report accurately reflects the tool's actual output.
4. Confirm the final Summary table in Task 11 has no empty severity/owner cells for Critical or High findings.
