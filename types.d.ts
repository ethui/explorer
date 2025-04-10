declare module "@ethui/ui/tailwind.css?url";
declare module "@rainbow-me/rainbowkit/styles.css?url";
declare module "*.css?url" {
  const content: string;
  export default content;
}
