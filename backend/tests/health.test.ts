import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app';
describe('health endpoints', () => { it('returns health', async () => { const response = await request(app).get('/health'); expect(response.status).toBe(200); expect(response.body.data.status).toBe('ok'); }); it('blocks protected auth route without token', async () => { const response = await request(app).get('/api/v1/auth/me'); expect(response.status).toBe(401); }); });
