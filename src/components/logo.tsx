import React from 'react';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 12a8 8 0 0 1 8-8 8 8 0 0 1 8 8v8H4v-8z" />
      <path d="M12 4V2" />
      <path d="M18 12h2" />
      <path d="M4 12H2" />
      <path d="M10 12v8" />
      <path d="M14 12v8" />
      <path d="M8 20h8" />
    </svg>
  );
}
