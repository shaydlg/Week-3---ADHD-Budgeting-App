---
name: secure-coding
description: Use for ANY code that handles user input, authentication, sessions, passwords, file uploads, database queries, API calls, secrets, or third-party dependencies. Apply secure coding practices to prevent common attacks (injection, broken auth, data exposure). Trigger on words like login, password, auth, token, input, form, query, upload, API key, secret, SQL, or on any code that accepts data from a user or an outside system.
---

# Secure Coding Basics

## Why this exists

Most breaches do not come from genius hackers. They come from ordinary mistakes: trusting user input,
leaving secrets in code, or weak password handling. A single gap can expose every user's data. Security
is not a feature you add at the end. It is a habit you apply to every line that touches data.

## The main idea

Never trust input, never expose secrets, and always assume someone will try to misuse your code. Build
defensively by default.

## The standard to follow

Follow the **OWASP Top 10** (the ten most critical web application security risks, published by the Open
Worldwide Application Security Project) and, where feasible, the **OWASP Application Security Verification
Standard (ASVS)**. For each change, name the specific risk you are defending against (for example, A01
Broken Access Control, A03 Injection, A07 Identification and Authentication Failures). "Secure" is
concrete when it points at a named risk and the control that stops it.

## The checklist

1. **Validate and sanitize input.** Treat all user input as untrusted. Check type, length, and format.
   Reject anything unexpected.
2. **Prevent injection.** Use parameterized queries for databases, never build queries by gluing
   strings together with user input.
3. **Protect secrets.** Keep API keys, passwords, and tokens out of your code and out of GitHub. Use
   environment variables and a `.gitignore`.
4. **Handle passwords safely.** Never store passwords as plain text. Hash them with a strong, modern
   algorithm (like bcrypt or Argon2).
5. **Least privilege.** Give every user, service, and token the minimum access it needs, nothing more.
6. **Keep dependencies updated.** Outdated libraries are a top source of known vulnerabilities. Check
   and patch them regularly.

## How to prove it

For each change, name what input it touches, what could go wrong (the threat), and how this code
defends against it. If you cannot name the threat, you have not thought about security yet.
