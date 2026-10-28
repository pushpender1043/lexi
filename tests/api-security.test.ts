import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000';

describe('Server API & Security Hardening Tests', () => {
  it('GET /api/health returns 200 OK with OWASP security headers', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.ok(data.timestamp, 'Timestamp must be present');
    assert.ok(data.systemMetrics && typeof data.systemMetrics.rssMb === 'number', 'systemMetrics.rssMb must be present');
    assert.ok(data.environment && typeof data.environment.geminiConfigured === 'boolean', 'environment.geminiConfigured must be present');

    // Security Headers check
    const csp = res.headers.get('content-security-policy');
    assert.ok(csp, 'Content-Security-Policy header must be present');
    assert.ok(csp.includes("default-src 'self'"));

    const frameOptions = res.headers.get('x-frame-options');
    assert.equal(frameOptions, 'SAMEORIGIN');

    const nosniff = res.headers.get('x-content-type-options');
    assert.equal(nosniff, 'nosniff');

    const referrerPolicy = res.headers.get('referrer-policy');
    assert.equal(referrerPolicy, 'strict-origin-when-cross-origin');
  });

  describe('Payload Body Size Limit (256KB cap)', () => {
    it('rejects oversized payloads (>256KB) with HTTP 413', async () => {
      // 300KB payload
      const hugeString = 'A'.repeat(300 * 1024);
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: hugeString }),
      });

      assert.equal(res.status, 413, 'Oversized body must trigger 413 Payload Too Large');
    });
  });

  describe('Zod Schema & Input Validation', () => {
    it('rejects chat request with empty message with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '' }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.error, 'Invalid request payload');
      assert.ok(Array.isArray(data.details));
    });

    it('rejects request with invalid enum values with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello',
          userProfile: {
            partnerTone: 'invalid_robotic_tone', // Invalid PartnerTone enum
          },
        }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.error, 'Invalid request payload');
    });

    it('rejects proactive request with missing/invalid type with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/proactive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'invalid_type_event',
        }),
      });

      assert.equal(res.status, 400);
    });
  });

  describe('IDOR & Token Protection', () => {
    it('blocks request when token UID does not match requested userProfile.userId (IDOR protection)', async () => {
      // Craft a mock token payload with sub: 'attacker_uid'
      const projectId = 'poetic-receiver-qcbh2';
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({
          aud: projectId,
          iss: `https://securetoken.google.com/${projectId}`,
          sub: 'attacker_uid_123',
          exp: Math.floor(Date.now() / 1000) + 3600,
        })
      ).toString('base64url');
      const token = `${header}.${payload}.signature`;

      // Request attempting to access or modify data for 'victim_uid_456'
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: 'Hello Lexi',
          userProfile: {
            userId: 'victim_uid_456',
          },
        }),
      });

      assert.equal(res.status, 403, 'Mismatch between authenticated UID and requested userId must return 403 Forbidden');
      const data = await res.json();
      assert.equal(data.error, 'Forbidden: Cross-user profile access rejected.');
    });
  });
});
