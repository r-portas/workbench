import type { SVGProps } from "react";

/**
 * The Workbench app mark: a spanner. Uses `currentColor` so it inherits
 * text color, matching the public/favicon.svg tile version.
 */
function WorkbenchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M 19.68 8.13 A 4.2 4.2 0 1 1 15.87 4.32 L 15.67 6.51 A 2.0 2.0 0 1 0 17.49 8.33 Z"
        fill="currentColor"
      />
      <line
        x1="12.53"
        y1="11.47"
        x2="6.6"
        y2="18"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <circle cx="6.3" cy="18.3" r="2" fill="currentColor" />
    </svg>
  );
}

export { WorkbenchIcon };
