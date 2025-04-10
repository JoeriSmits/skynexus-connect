import { Card, CardContent } from "@/components/ui/card";
import { Contract } from "@/types/contract";
import { IconRefresh } from "@tabler/icons-react";

export function ContractCard({
  contract,
  onRefresh,
}: {
  contract: Contract;
  onRefresh: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex justify-between items-center gap-4">
        {/* Left Side: Airport image + route info */}
        <div className="flex items-center gap-4">
          {contract.from_airport.cover_image_url && (
            <img
              src={contract.from_airport.cover_image_url}
              alt={contract.from_airport.name}
              className="w-16 h-16 object-cover rounded-md"
            />
          )}
          <div>
            <p className="text-sm text-muted-foreground">Active Contract</p>
            <p className="text-lg font-semibold">
              {contract.from_airport.icao} → {contract.to_airport.icao}
            </p>
            <p className="text-xs text-muted-foreground">
              {contract.aircraft_id.type} • {contract.aircraft_id.tail_number}
            </p>
          </div>
        </div>

        {/* Right Side: payout + deadline + refresh */}
        <div className="text-right space-y-1">
          <p className="text-sm font-bold text-green-600">
            €{contract.payout.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Due {new Date(contract.deadline).toLocaleDateString()}
          </p>
          <button
            onClick={onRefresh}
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1 cursor-pointer"
          >
            <IconRefresh size={14} /> Refresh
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
