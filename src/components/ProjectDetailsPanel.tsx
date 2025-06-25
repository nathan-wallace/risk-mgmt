import React from 'react';
import { ProjectMeta } from '@/types/project';

import Link from 'next/link';

interface Props {
  meta: ProjectMeta;
  pid?: string;
}

export default function ProjectDetailsPanel({ meta, pid }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Project Details</h2>
        {pid && (
          <Link
            href={`/project/${pid}/settings`}
            aria-label="Edit project details"
            className="text-gray-600 hover:text-black"
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17.414 2.586a2 2 0 0 0-2.828 0l-8.5 8.5a1 1 0 0 0-.263.45l-1.5 4.5a1 1 0 0 0 1.263 1.263l4.5-1.5a1 1 0 0 0 .45-.263l8.5-8.5a2 2 0 0 0 0-2.828l-1.622-1.622ZM15 3l2 2-8.25 8.25-2.12.707.707-2.121L15 3Z" />
            </svg>
          </Link>
        )}
      </div>
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
