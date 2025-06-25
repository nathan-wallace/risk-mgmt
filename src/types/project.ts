import { Risk } from './risk';

export interface ProjectMeta {
  projectName: string;
  projectManager: string;
  sponsor: string;
  startDate: string; // ISO
  endDate: string; // ISO
  riskPlan: string;
}

export interface Project {
  id: string;
  meta: ProjectMeta;
  risks: Risk[];
}
