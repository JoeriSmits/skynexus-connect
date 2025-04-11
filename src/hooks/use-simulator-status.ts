import { useEffect, useState, useCallback } from "react";
import { Contract } from "@/types/contract";

export type SimAircraftData = {
  lat: number;
  lon: number;
  rpm: number;
  fuel_liters: number;
  block_time: number;
  fuel_used: number;
  block_out?: string;
  block_in?: string;
  maintenance_state: {
    [key: string]: number | string | undefined;
  },
  maintenance_used: {
    [key: string]: number | string | undefined;
  },
};

type SimulatorStatus = {
  connected: boolean;
  aircraft: SimAircraftData | null;
  last_completed_aircraft: SimAircraftData | null;
  tracking_active: boolean;
};

export function useSimulatorStatus(contract: Contract) {
  const [connected, setConnected] = useState(false);
  const [aircraft, setAircraft] = useState<SimAircraftData | null>(null);
  const [lastFlight, setLastFlight] = useState<SimAircraftData | null>(null);
  const [withinRange, setWithinRange] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [hasSetFuel, setHasSetFuel] = useState(false);
  const [hasSetMaintenance, setHasSetMaintenance] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5051/simulator-status");
      const data: SimulatorStatus = await res.json();

      setConnected(data.connected);
      setAircraft(data.aircraft);
      setLastFlight(data.last_completed_aircraft);
      setIsTracking(data.tracking_active);

      if (data.aircraft) {
        const distance = getDistanceFromLatLonInKm(
          contract.from_airport.lat,
          contract.from_airport.lon,
          data.aircraft.lat,
          data.aircraft.lon
        );
        setWithinRange(distance < 30);

        // Fuel sync
        if (!lastFlight && !isTracking && !hasSetFuel && data.connected) {
          const expectedFuel = contract.aircraft_id.fuel_liters;
          const delta = Math.abs(data.aircraft.fuel_liters - expectedFuel);
          if (delta > 5) {
            await setFuelInSim(expectedFuel);
            setHasSetFuel(true);
          }
        }

        // Maintenance sync
        const maintenance = contract.aircraft_id.aircraft_maintenance_state;

        if (
          !lastFlight &&
          !isTracking &&
          !hasSetMaintenance &&
          data.connected &&
          maintenance &&
          typeof maintenance === "object"
        ) {
          let didSetAny = false;

          for (const [key, expected] of Object.entries(maintenance)) {
            const current = data.aircraft.maintenance_state[key];
            if (typeof expected === "number" && typeof current === "number") {
              const delta = Math.abs(current - expected);
              if (delta > 0.01) {
                await setSimVar(key, expected);
                didSetAny = true;
              }
            }
          }

          if (didSetAny) setHasSetMaintenance(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch simulator status:", err);
      setConnected(false);
    }
  }, [contract, hasSetFuel, hasSetMaintenance, isTracking, lastFlight]);

  useEffect(() => {
    setHasSetFuel(false);
    setHasSetMaintenance(false);
  }, [
    contract.id,
    contract.aircraft_id.fuel_liters,
    contract.aircraft_id.aircraft_maintenance_state,
    aircraft?.fuel_liters,
  ]);

  useEffect(() => {
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    connected,
    aircraft,
    lastFlight,
    withinRange,
    isTracking,
    refetch: fetchStatus,
  };
}

async function setFuelInSim(liters: number) {
  const gallons = liters / 3.78541;
  try {
    await fetch("http://localhost:5051/set-simvar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ var: "A:FUEL TANK LEFT MAIN QUANTITY,Gallons", value: gallons / 2 }),
    });

    await fetch("http://localhost:5051/set-simvar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ var: "A:FUEL TANK RIGHT MAIN QUANTITY,Gallons", value: gallons / 2 }),
    });

    console.log(`✅ Set fuel to ${liters.toFixed(1)} L in sim`);
  } catch (err) {
    console.error("❌ Failed to set fuel in sim:", err);
  }
}

async function setSimVar(variable: string, value: number) {
  try {
    await fetch("http://localhost:5051/set-simvar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ var: variable, value }),
    });
    console.log(`✅ Set ${variable} to ${value}`);
  } catch (err) {
    console.error(`❌ Failed to set ${variable}:`, err);
  }
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
