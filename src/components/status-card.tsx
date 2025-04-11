import { ReactNode } from "react";

type StatusAlertProps = {
  icon?: ReactNode;
  color: "green" | "yellow" | "red" | "blue";
  title: string;
  message?: string;
  children?: ReactNode;
};

export default function StatusAlert({
  icon,
  color,
  title,
  message,
  children,
}: StatusAlertProps) {
  const borderClass = `border-${color}-600`;
  const textClass = `text-${color}-600`;

  return (
    <div
      className={`border-2 ${borderClass} p-4 rounded-lg ${textClass} flex items-start justify-between`}
    >
      <div className="flex items-start space-x-3">
        {icon && <div className="mt-1">{icon}</div>}
        <div>
          <p className="font-semibold text-xl">{title}</p>
          {message && (
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          )}
        </div>
      </div>

      {children && <div className="ml-4">{children}</div>}
    </div>
  );
}
