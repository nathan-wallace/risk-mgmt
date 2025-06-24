import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { Risk } from '@/types/risk';

const dataPath = path.join(process.cwd(), 'data', 'risks.json');

async function readRisks(): Promise<Risk[]> {
  const data = await fs.readFile(dataPath, 'utf8');
  return JSON.parse(data) as Risk[];
}

async function writeRisks(risks: Risk[]) {
  await fs.writeFile(dataPath, JSON.stringify(risks, null, 2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) return res.status(400).end();

  const risks = await readRisks();
  const index = risks.findIndex((r) => r.id === id);
  if (index === -1) return res.status(404).end();

  switch (req.method) {
    case 'PUT': {
      const updated = { ...risks[index], ...req.body, lastReviewed: new Date().toISOString() };
      risks[index] = updated;
      await writeRisks(risks);
      res.status(200).json(updated);
      break;
    }
    case 'DELETE': {
      risks.splice(index, 1);
      await writeRisks(risks);
      res.status(204).end();
      break;
    }
    default:
      res.status(405).end();
  }
}
