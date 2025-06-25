export type RiskStatus = 'Open' | 'In-Progress' | 'Mitigated' | 'Accepted';

export interface StatusChange {
  date: string; // ISO timestamp
  status: RiskStatus;
  note: string;
}

export interface Risk {
  id: string;
  description: string;
  category: string;
  probability: number; // 1-5
  impact: number; // 1-5
  owner: string;
  mitigation: string;
  status: RiskStatus;
  response: 'Avoid' | 'Mitigate' | 'Transfer' | 'Accept';
  statusHistory: StatusChange[];
  dateIdentified: string; // ISO
  dateResolved?: string; // ISO
  lastReviewed: string; // ISO
}

export type RiskInput = Omit<Risk, 'id' | 'lastReviewed' | 'statusHistory'>;
