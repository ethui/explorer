import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$url/index")({
  component: UrlRouteComponent,
});

function UrlRouteComponent() {
  const { url } = Route.useParams();
  
  // Convert the formatted URL back to its original form
  const originalUrl = url.replace(/-/g, (match, offset) => {
    // Determine if this should be a colon or slash based on context
    if (offset > 0 && url[offset-1].match(/[a-zA-Z0-9]/)) {
      return ":"; // Likely a port number
    }
    return "/"; // Likely a path separator
  });
  
  return (
    <div>
      <h1>URL Route</h1>
      <p>Formatted URL parameter: {url}</p>
      <p>Original URL (best guess): {originalUrl}</p>
    </div>
  );
}
