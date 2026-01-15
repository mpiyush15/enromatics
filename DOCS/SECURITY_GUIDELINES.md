# 🔒 Security Guidelines

## ⚠️ NEVER COMMIT THESE FILES:

### ❌ Absolutely Forbidden:
- `.env` files (any environment variables)
- Conversation logs or chat history
- Files containing API keys, passwords, or tokens
- Database credentials
- AWS/Cloud provider credentials
- Payment gateway secrets

## ✅ Protection Measures in Place:

### 1. Enhanced .gitignore
All sensitive file patterns are blocked:
```
.env
.env.*
*.env
*conversation*.md
*credentials*.json
*secrets*.json
```

### 2. Pre-commit Hook
Automatically blocks commits containing:
- Any `.env` files
- Conversation/chat logs
- Hardcoded credentials in code
- Credential/secret JSON files

### 3. Safe Files (Can be committed):
- `.env.example` - Template files without real values
- Documentation (README.md)
- Source code (without hardcoded secrets)

## 🛡️ Best Practices:

1. **Always use environment variables** for sensitive data
2. **Never hardcode** API keys, passwords, or tokens in code
3. **Use .env.example** files as templates
4. **Rotate credentials** immediately if exposed
5. **Review changes** before committing

## 🚨 If Credentials Are Exposed:

1. **Revoke/Rotate** all exposed credentials immediately
2. **Check git history**: `git log --all --full-history -- "**/.env"`
3. **Remove from history** if found (contact team lead)
4. **Update** with new credentials

## 📋 Current Protected Services:
- MongoDB Database
- Zeptomail/SMTP Email
- Cashfree Payment Gateway
- AWS S3 Storage
- Facebook/Meta APIs
- WhatsApp Business API

---
**Remember**: If you're unsure whether a file should be committed, ask first!
