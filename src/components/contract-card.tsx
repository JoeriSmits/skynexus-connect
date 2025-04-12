import { Card, CardContent } from "@/components/ui/card";
import { Contract } from "@/types/contract";
import { IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

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
          <p className="text-sm text-muted-foreground">
            Due {new Date(contract.deadline).toLocaleDateString()}
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
