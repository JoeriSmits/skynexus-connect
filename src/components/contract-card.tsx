import { Card, CardContent } from "@/components/ui/card";
import { Contract } from "@/types/contract";
import { IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { format, intervalToDuration } from "date-fns";
import { cn } from "@/lib/utils"; // Tailwind class merge util

function formatDeadlineDisplay(deadline: string | Date) {
  const date = new Date(deadline);
  const now = new Date();
  const formattedDate = format(date, "dd-MM-yyyy HH:mm");

  const duration = intervalToDuration({ start: now, end: date });
  const parts: string[] = [];

  if (duration.hours) parts.push(`${duration.hours}h`);
  if (duration.minutes) parts.push(`${duration.minutes}m`);

  const relative = parts.length > 0 ? `(${parts.join(" and ")})` : "";

  return `${formattedDate} ${relative}`;
}

function getDeadlineClass(deadline: string | Date) {
  const date = new Date(deadline);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);

  if (diffInHours < 1) return "text-red-600 font-semibold";
  if (diffInHours < 6) return "text-yellow-600 font-semibold";
  if (diffInHours < 24) return "text-orange-600";
  return "text-muted-foreground";
}

export function ContractCard({
  contract,
  onRefresh,
}: {
  contract: Contract;
  onRefresh: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center justify-between gap-6">
        {/* Left Side: Route info */}
        <div className="flex items-center gap-4 flex-1">
          {contract.from_airport.cover_image_url && (
            <img
              src={contract.from_airport.cover_image_url}
              alt={contract.from_airport.name}
              className="w-16 h-16 object-cover rounded-md shadow"
            />
          )}
          <div>
            <p className="text-sm text-muted-foreground">Active Contract</p>
            <p className="text-xl font-semibold">
              {contract.from_airport.icao} → {contract.to_airport.icao}
            </p>
            <p className="text-sm text-muted-foreground">
              {contract.aircraft_id.type} • {contract.aircraft_id.tail_number}
            </p>
          </div>
        </div>

        {/* Middle: payout + deadline */}
        <div className="flex flex-col items-end gap-1 text-right">
          <p className="text-lg font-bold text-green-600">
            €{contract.payout.toLocaleString()}
          </p>
          <p className={cn("text-sm", getDeadlineClass(contract.deadline))}>
            Due {formatDeadlineDisplay(contract.deadline)}
          </p>
        </div>

        {/* Right: large refresh button */}
        <div>
          <Button
            variant="outline"
            onClick={onRefresh}
            title="Refresh contract"
            className="w-14 h-14 p-0 rounded-xl flex items-center justify-center hover:bg-muted transition cursor-pointer"
          >
            <IconRefresh />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
