# Rules of Engagement

Fill in every field below and get explicit sign-off **before** running any task in
`network-security-check-plan.md` beyond Task 1. No scan (Nmap, Nessus/OpenVAS, ZAP, Prowler,
testssl.sh) may run against any host that isn't listed as in-scope here.

- **Authorized scope (IP ranges / hostnames / cloud accounts):** <fill in>
- **Explicitly out of scope:** <fill in — e.g. third-party SaaS, partner networks>
- **Authorization owner / sign-off:** <name, date>
- **Testing window:** <e.g. business hours OK / maintenance window only>
- **Emergency contact if something breaks:** <name, phone>
- **Scan intensity allowed:** <e.g. safe scripts only vs. full vuln scripts>

## Applicable domains for this audit

- [ ] Perimeter / firewall (Task 3)
- [ ] Internal host & service discovery (Task 4)
- [ ] Vulnerability scanning (Task 5)
- [ ] TLS/encryption review (Task 6)
- [ ] Access control & auth review (Task 7)
- [ ] Logging & monitoring review (Task 8)
- [ ] Cloud posture (Task 9) — only if cloud accounts in scope
- [ ] Web application layer (Task 10) — only if web apps in scope
