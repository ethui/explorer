import type { SVGProps } from "react";

interface LoadingSpinnerProps extends SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

const LoadingSpinner = ({
  size = 48,
  color = "#222222",
  ...props
}: LoadingSpinnerProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className="animate-spin"
    {...props}
  >
    <title>Loading spinner</title>
    <g clipPath="url(#loading-spinner-clip)">
      <path
        fill="#DEDEDE"
        fillRule="evenodd"
        d="M24 4.8C13.396 4.8 4.8 13.396 4.8 24S13.396 43.2 24 43.2 43.2 34.604 43.2 24 34.604 4.8 24 4.8ZM0 24C0 10.745 10.745 0 24 0s24 10.745 24 24-10.745 24-24 24S0 37.255 0 24Z"
        clipRule="evenodd"
      />
      <path
        fill="#D9D9D9"
        d="M48 24A24 24 0 0 0 24 0v4.8A19.2 19.2 0 0 1 43.2 24H48Z"
      />
      <path
        fill={color}
        fillRule="evenodd"
        d="M24 4.8A19.2 19.2 0 0 1 43.2 24H48A23.997 23.997 0 0 0 24 0v4.8Z"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="loading-spinner-clip">
        <path fill="#fff" d="M0 0h48v48H0z" />
      </clipPath>
    </defs>
  </svg>
);

export default LoadingSpinner;
