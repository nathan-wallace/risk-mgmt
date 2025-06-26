import { promises as fs } from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { RiskInput, RiskStatus, Risk } from '@/types/risk';
import { tmpdir } from 'os';
import { mkdtempSync } from 'fs';
import { jest } from '@jest/globals';

describe('API risk handlers', () => {
  let cwd: string;
  let dataDir: string;
  let dataPath: string;

  beforeEach(async () => {
    cwd = process.cwd();
    dataDir = mkdtempSync(path.join(tmpdir(), 'risk-test-'));
    dataPath = path.join(dataDir, 'data');
    await fs.mkdir(dataPath);
    await fs.writeFile(path.join(dataPath, 'risks.json'), '[]');
    process.chdir(dataDir);
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  test('POST /api/risks creates risk with status history', async () => {
    const mod = await import('../src/pages/api/risks/index');
    const req = {
      method: 'POST',
      body: {
        title: 'Test Risk',
        description: 'desc',
        category: 'cat',
        probability: 2,
        impact: 3,
        owner: 'me',
        mitigation: 'none',
        priority: 'High',
        response: 'Mitigate',
        status: 'Open' as RiskStatus,
        dateIdentified: '2020-01-01',
        dateResolved: '',
      } satisfies RiskInput,
    } as unknown as NextApiRequest;
    const json = jest.fn();
    const res = { status: (c: number) => ({ json }) } as unknown as NextApiResponse;
    await mod.default(req, res);
    expect(json).toHaveBeenCalled();
    const arg = json.mock.calls[0][0] as Risk;
    expect(arg.statusHistory.length).toBe(1);
    const saved = JSON.parse(await fs.readFile(path.join(dataPath,'risks.json'),'utf8'));
    expect(saved.length).toBe(1);
  });

  test('PUT /api/risks/[id] updates status history', async () => {
    const initial: Risk = {
      id: '1',
      lastReviewed: new Date().toISOString(),
      title: 'A',
      description: 'd',
      category: 'c',
      probability: 1,
      impact: 1,
      owner: 'o',
      mitigation: 'm',
      priority: 'Medium',
      status: 'Open',
      response: 'Avoid',
      statusHistory: [{ date: '2020-01-01', status: 'Open', note: '' }],
      dateIdentified: '2020-01-01',
      dateResolved: '',
    };
    await fs.writeFile(path.join(dataPath,'risks.json'), JSON.stringify([initial]));
    const mod = await import('../src/pages/api/risks/[id]');
    const req = {
      method: 'PUT',
      query: { id: '1' },
      body: { status: 'Mitigated', statusNote: 'done' },
    } as unknown as NextApiRequest;
    const json = jest.fn();
    const res = { status: (c: number) => ({ json }) } as unknown as NextApiResponse;
    await mod.default(req, res);
    const updated = json.mock.calls[0][0] as Risk;
    expect(updated.status).toBe('Mitigated');
    expect(updated.statusHistory.length).toBe(2);
    const saved: Risk[] = JSON.parse(await fs.readFile(path.join(dataPath,'risks.json'),'utf8'));
    expect(saved[0].statusHistory.length).toBe(2);
  });
});
