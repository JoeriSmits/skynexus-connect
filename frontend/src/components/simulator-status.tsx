import { useSimulatorStatus } from "@/hooks/use-simulator-status";
import { Contract } from "@/types/contract";
import StatusAlert from "./status-card";
import { IconCircleCheck, IconMapPinOff, IconPlugConnectedX, IconPropeller } from "@tabler/icons-react";
import FlightSummaryCard from "./flight-summary-card";

type Props = {
  contract: Contract;
};

export default function SimulatorStatusCard({ contract }: Props) {
  const {
    connected,
    aircraft,
    lastFlight,
    withinRange,
    isTracking,
  } = useSimulatorStatus(contract);

  const readyToStart = connected && withinRange && !isTracking;

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

      {readyToStart && !lastFlight && (
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
          onFinish={() => console.log("Finish Flight")}
          onAbort={() => console.log("Abort Flight")}
        />
      )}
    </div>
  );
}
