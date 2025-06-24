export interface Risk {
  id: string;
  description: string;
  category: string;
  probability: number; // 1-5
  impact: number; // 1-5
  owner: string;
  mitigation: string;
  status: 'Open' | 'In-Progress' | 'Mitigated' | 'Accepted';
  dateIdentified: string; // ISO
  lastReviewed: string; // ISO
}

export type RiskInput = Omit<Risk, 'id' | 'lastReviewed'>;
