import type { SVGProps } from "react";

const Warning = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    fill="none"
    {...props}
  >
    <title>Warning</title>
    <path
      fill="transparent"
      d="M0 0h40v40H0z"
      style={{
        mixBlendMode: "multiply",
      }}
      transform="translate(.5)"
    />
    <path
      fill="#222"
      d="M20.5 2.5a17.5 17.5 0 1 0 0 35 17.5 17.5 0 0 0 0-35Zm0 32.5a15 15 0 1 1 0-29.998A15 15 0 0 1 20.5 35Z"
    />
    <path
      fill="#222"
      d="M21.75 10h-2.5v13.75h2.5V10ZM20.5 27.5a1.875 1.875 0 1 0 0 3.751 1.875 1.875 0 0 0 0-3.751Z"
    />
  </svg>
);
export default Warning;
