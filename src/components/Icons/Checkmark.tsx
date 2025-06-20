import type { SVGProps } from "react";
const Checkmark = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={32}
    fill="none"
    {...props}
  >
    <title>Checkmark</title>
    <path
      d="M0 0h32v32H0z"
      style={{
        mixBlendMode: "multiply",
      }}
    />
    <path
      fill="#222"
      d="m13 24-9-9 1.414-1.414L13 21.17 26.586 7.586 28 9 13 24Z"
    />
  </svg>
);
export default Checkmark;
