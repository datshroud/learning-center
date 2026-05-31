import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { isTimeOverlap } from '../lib/date.js';

describe('health endpoint', () => {
  it('returns API status', async () => {
    const response = await request(createApp()).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('time overlap helper', () => {
  it('detects overlapping schedules', () => {
    expect(isTimeOverlap('18:00', '20:00', '19:00', '21:00')).toBe(true);
    expect(isTimeOverlap('18:00', '20:00', '20:00', '22:00')).toBe(false);
  });
});

