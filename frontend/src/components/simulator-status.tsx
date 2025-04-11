import { useSimulatorStatus } from "@/hooks/use-simulator-status";
import { Contract } from "@/types/contract";
import StatusAlert from "./status-card";
import { IconGasStation, IconMapPinOff, IconPlugConnectedX, IconPropeller } from "@tabler/icons-react";
import FlightSummaryCard from "./flight-summary-card";
import { User } from "@supabase/supabase-js";
import { useFlightActions } from "@/hooks/use-flight-actions";
import { useState } from "react";

type Props = {
  contract: Contract;
  user: User | null;
};

export default function SimulatorStatusCard({ contract, user }: Props) {
  const {
    connected,
    aircraft,
    lastFlight,
    withinRange,
    isTracking,
    refetch,
  } = useSimulatorStatus(contract);
  const [error, setError] = useState<string | null>(null);
  const { handleFinish, handleAbort } = useFlightActions(contract, lastFlight, user, refetch, setError);
  const readyToStart = connected && withinRange && !isTracking;

  const fuelMismatch = aircraft && Math.abs(aircraft.fuel_liters - contract.aircraft_id.fuel_liters) > 5;

  return (
    <div className="border rounded-xl p-4 space-y-4">
      <h2 className="text-xl font-bold">Simulator Status</h2>

      {!connected && (
        <StatusAlert
          icon={<IconPlugConnectedX className="text-xl" />}
          color="red"
          title="Simulator not connected"
          message="Please launch MSFS and load into your aircraft."
        />
      )}

      {connected && aircraft && !withinRange && (
        <StatusAlert
          icon={<IconMapPinOff className="text-xl" />}
          color="yellow"
          title="Aircraft is too far from departure airport"
          message="Distance must be within 30km to begin a contract flight."
        />
      )}

      {connected && !isTracking && !lastFlight && aircraft && fuelMismatch && (
        <StatusAlert
          icon={<IconGasStation className="text-xl" />}
          color="yellow"
          title="Fuel mismatch detected"
          message="The aircraft fuel level does not match with that of the simulator."
        />
      )}

      {readyToStart && !lastFlight && !fuelMismatch && (
        <StatusAlert
          icon={<IconPropeller className="text-xl" />}
          color="green"
          title="✅ Ready to start engines"
          message="You are within range. Start your aircraft to begin the flight."
        />
      )}

      {isTracking && aircraft?.rpm > 100 && (
        <StatusAlert
          icon={<IconPropeller className="text-xl animate-spin" />}
          color="blue"
          title="✈️ Flight in progress"
          message="Tracking block time and fuel usage."
        />
      )}

      {!isTracking && lastFlight && (
        <FlightSummaryCard
          blockTime={lastFlight.block_time}
          blockOut={lastFlight.block_out}
          blockIn={lastFlight.block_in}
          fuelUsed={lastFlight.fuel_used}
          onFinish={handleFinish}
          onAbort={handleAbort}
          errorMessage={error || undefined}
        />
      )}
    </div>
  );
}
