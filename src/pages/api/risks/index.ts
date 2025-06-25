import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { Risk, RiskInput } from '@/types/risk';

const dataPath = path.join(process.cwd(), 'data', 'risks.json');

async function readRisks(): Promise<Risk[]> {
  const data = await fs.readFile(dataPath, 'utf8');
  return JSON.parse(data) as Risk[];
}

async function writeRisks(risks: Risk[]) {
  await fs.writeFile(dataPath, JSON.stringify(risks, null, 2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const risks = await readRisks();
      res.status(200).json(risks);
      break;
    }
    case 'POST': {
      const input = req.body as RiskInput;
      const risks = await readRisks();
      const newRisk: Risk = {
        id: Date.now().toString(),
        lastReviewed: new Date().toISOString(),
        ...input,
        statusHistory: [
          {
            date: new Date().toISOString(),
            status: input.status,
            note: '',
          },
        ],
      };
      risks.push(newRisk);
      await writeRisks(risks);
      res.status(201).json(newRisk);
      break;
    }
    default:
      res.status(405).end();
  }
}
