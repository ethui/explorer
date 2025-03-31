import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_l")({
  component: RouteComponent,
});

function RouteComponent() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      // Format the URL by replacing colons and slashes with hyphens
      const formattedUrl = url.replace(/[:\/]/g, "-");
      navigate({ to: `/${formattedUrl}/index` });
    }
  };

  return (
    <div>
      <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL (e.g. localhost:8545)"
            style={{ 
              padding: "8px", 
              width: "300px", 
              marginRight: "10px" 
            }}
          />
          <button 
            type="submit"
            style={{
              padding: "8px 16px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Go
          </button>
        </form>
      </div>
      <div style={{ padding: "20px" }}>
        <h2>Layout Content</h2>
        <p>Enter a URL above to navigate to its corresponding route.</p>
      </div>
    </div>
  );
}
