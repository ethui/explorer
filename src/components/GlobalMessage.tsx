type MessageType = "error" | "success" | "info";

interface GlobalMessageProps {
  title: string;
  description: string;
  type?: MessageType;
}

const messageConfig = {
  error: {
    titleColor: "text-red-500",
  },
  success: {
    titleColor: "text-green-500",
  },
  info: {
    titleColor: "text-blue-500",
  },
} as const;

export function GlobalMessage({
  title,
  description,
  type = "info",
}: GlobalMessageProps) {
  const config = messageConfig[type];

  return (
    <div className="space-y-4 text-center">
      <h1 className={`font-bold text-2xl ${config.titleColor}`}>{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
