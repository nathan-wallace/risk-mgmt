import React from 'react';
import { ProjectMeta } from '@/types/project';

interface Props {
  meta: ProjectMeta;
}

export default function ProjectDetailsPanel({ meta }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="font-semibold mb-2">Project Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <p>
          <span className="font-medium">Name: </span>
          {meta.projectName || 'Untitled Project'}
        </p>
        <p>
          <span className="font-medium">Manager: </span>
          {meta.projectManager || '-'}
        </p>
        <p>
          <span className="font-medium">Sponsor: </span>
          {meta.sponsor || '-'}
        </p>
        <p>
          <span className="font-medium">Start: </span>
          {meta.startDate || '-'}
        </p>
        <p>
          <span className="font-medium">End: </span>
          {meta.endDate || '-'}
        </p>
      </div>
      {meta.riskPlan && (
        <div className="mt-2 text-sm whitespace-pre-wrap">
          <span className="font-medium">Risk Plan:</span> {meta.riskPlan}
        </div>
      )}
    </div>
  );
}
