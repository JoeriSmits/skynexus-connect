import { useSimulatorStatus } from "@/hooks/use-simulator-status";
import { Contract } from "@/types/contract";
import StatusAlert from "./status-card";
import { IconGasStation, IconLoader2, IconMapPinOff, IconPlugConnectedX, IconPropeller } from "@tabler/icons-react";
import FlightSummaryCard from "./flight-summary-card";
import { User } from "@supabase/supabase-js";
import { useFlightActions } from "@/hooks/use-flight-actions";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  const [isSettingValues, setIsSettingValues] = useState(false);
  const { handleFinish, handleAbort } = useFlightActions(contract, lastFlight, user, refetch, setError);
  const readyToStart = connected && withinRange && !isTracking;

  const fuelMismatch = aircraft && Math.abs(aircraft.fuel_liters - contract.aircraft_id.fuel_liters) > 5;

  // Inside your SimulatorStatusCard component, after defining hooks
  useEffect(() => {
    const updateFlyingState = async () => {
      const { error } = await supabase
        .from("contracts")
        .update({ is_flying: isTracking })
        .eq("id", contract.id);

      if (error) {
        console.error("❌ Failed to update is_flying:", error.message);
      }
    };

    updateFlyingState();
  }, [isTracking, contract.id]);

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

      {connected && aircraft && !isTracking && !lastFlight && !withinRange && (
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

      {isTracking && aircraft && aircraft?.rpm > 100 && (
        <StatusAlert
          icon={<IconPropeller className="text-xl animate-spin" />}
          color="blue"
          title="✈️ Flight in progress"
          message="Tracking block time and fuel usage. The flight will complete when you stop your engines."
        />
      )}

{!isTracking && lastFlight && (
  <>
    <FlightSummaryCard
      blockTime={lastFlight.block_time}
      blockOut={lastFlight.block_out}
      blockIn={lastFlight.block_in}
      fuelUsed={lastFlight.fuel_used}
      onFinish={handleFinish}
      onAbort={handleAbort}
      errorMessage={error || undefined}
    />

    <div className="space-y-1 mt-4">
      <button
        onClick={async () => {
          if (!connected || isSettingValues) return;
          setIsSettingValues(true);
          try {
            await refetch();
            await fetch("http://localhost:5051/abort-flight", { method: "POST" });
          } catch (err) {
            console.error("❌ Failed to set values for next flight:", err);
          } finally {
            setTimeout(() => {
              setIsSettingValues(false);
            }, 2000);
          }
        }}
        disabled={isSettingValues}
        className="inline-flex items-center justify-center w-full rounded-md border border-primary text-primary hover:bg-primary/10 px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSettingValues ? (
          <>
            <IconLoader2 className="animate-spin mr-2" size={18} />
            Setting values...
          </>
        ) : (
          <>✨ Set values in simulator for next flight</>
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        Only use this if you completed the contract in the web app.
      </p>
    </div>
  </>
)}
    </div>
  );
}
