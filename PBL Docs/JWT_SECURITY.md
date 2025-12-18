# JWT Security Guidelines

## Overview
This document outlines the security measures implemented for JWT (JSON Web Token) handling in the PBL Medical System.

## Vulnerabilities Fixed

### 1. **Algorithm Confusion Attack Prevention**
- **Issue**: Accepting multiple algorithms or allowing weak algorithms like `none`
- **Fix**: Explicitly specify `HS256` algorithm only
- **Implementation**: `jwt.verify()` with `algorithms: ['HS256']` option

### 2. **Weak Secret Key**
- **Issue**: Using default or weak secret keys
- **Fix**: Enforce minimum 32-character secret keys
- **Implementation**: 
  - Validation at application startup
  - Environment variable requirement with minimum length check
  - Error thrown if JWT_SECRET is missing or too weak

### 3. **Missing Token Claims Validation**
- **Issue**: Not validating critical token claims
- **Fix**: Added `audience` and `issuer` validation
- **Implementation**:
  - `JWT_AUDIENCE`: Identifies intended recipient of token
  - `JWT_ISSUER`: Identifies who issued the token
  - `subject`: Links token to user ID

### 4. **Insufficient Logging**
- **Issue**: No visibility into JWT failures
- **Fix**: Added comprehensive logging
- **Implementation**: 
  - Log JWT validation failures (invalid, expired, malformed)
  - Include IP address for suspicious activity tracking
  - Distinguish between different error types

### 5. **Token Expiry Not Enforced**
- **Issue**: No explicit age limit on tokens
- **Fix**: Added `maxAge` validation
- **Implementation**: `maxAge: '7d'` in verify options

## Configuration

### Environment Variables

```env
# Required: At least 32 characters
JWT_SECRET=your-super-secret-jwt-key-change-this-to-32-chars-minimum

# Optional: Defaults shown
JWT_EXPIRES_IN=7d
JWT_AUDIENCE=pbl-medical-system
JWT_ISSUER=pbl-auth-service
```

### Generate Strong Secret Key

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

## JWT Structure

### Payload Claims

```json
{
  "userId": "user-id-uuid",
  "aud": "pbl-medical-system",
  "iss": "pbl-auth-service",
  "sub": "user-id-uuid",
  "exp": 1703001600,
  "iat": 1702916400
}
```

### Verification Options

```typescript
jwt.verify(token, JWT_SECRET, {
  algorithms: ['HS256'],      // Only accept HS256
  audience: JWT_AUDIENCE,     // Verify audience claim
  issuer: JWT_ISSUER,         // Verify issuer claim
  maxAge: '7d'                // Token must not be older than 7 days
})
```

## Best Practices

### 1. **Token Storage**
- Never store JWT in localStorage (XSS vulnerable)
- Use httpOnly cookies with secure flag for web browsers
- Use secure token storage in mobile apps

### 2. **Token Transmission**
- Always use HTTPS/TLS
- Include token in `Authorization` header: `Bearer <token>`
- Never include sensitive data in token payload (it's base64 encoded, not encrypted)

### 3. **Secret Management**
- Store JWT_SECRET in secure vault (not in code/git)
- Rotate secrets regularly
- Use different secrets for different environments
- Never use hardcoded defaults

### 4. **Monitoring**
- Log all authentication failures
- Alert on suspicious patterns (multiple failures from same IP)
- Monitor for token tampering attempts

## Monitoring & Alerts

### Suspicious Activities
- Multiple failed authentication attempts
- Expired tokens being used
- Invalid algorithm attempts
- Missing or malformed tokens

### Logging Examples

```
[WARN] Invalid JWT - error: invalid signature, ip: 192.168.1.1
[WARN] Expired JWT - expiredAt: 2024-01-01T00:00:00Z, ip: 192.168.1.1
[ERROR] JWT verification failed - error: unable to verify token, ip: 192.168.1.1
```

## Testing

### Valid Token
```bash
curl -H "Authorization: Bearer <valid_token>" http://localhost:3000/api/flashcards
```

### Invalid Token
```bash
# Missing Bearer prefix
curl -H "Authorization: <token>" http://localhost:3000/api/flashcards
# Result: 401 Unauthorized

# Expired token
curl -H "Authorization: Bearer <expired_token>" http://localhost:3000/api/flashcards
# Result: 401 Unauthorized

# Tampered token
curl -H "Authorization: Bearer <tampered_token>" http://localhost:3000/api/flashcards
# Result: 401 Unauthorized
```

## References

- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [OWASP: JSON Web Token](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Auth0: JWT Security](https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/)

## Migration Guide

If you have existing tokens using old configuration:

1. Update `.env` with new `JWT_AUDIENCE` and `JWT_ISSUER`
2. Force all users to re-login to get new tokens
3. Monitor for failed authentication attempts during transition
4. Update all client applications with new configuration

---

**Last Updated**: December 17, 2025  
**Status**: ✅ Implementation Complete
