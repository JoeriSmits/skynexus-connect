import { useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Contract } from "@/types/contract";
import { User } from "@supabase/supabase-js";
import { SimAircraftData } from "./use-simulator-status";

export function useFlightActions(
  contract: Contract,
  lastFlight: SimAircraftData | null,
  user: User | null,
  refetch: () => void,
  setError: (msg: string | null) => void
) {
  // Keeps track of the last inserted flight
  const lastSavedKey = useRef<string | null>(null);

  const handleAbort = useCallback(async () => {
    await fetch("http://localhost:5051/abort-flight", { method: "POST" });
    setError(null);
    refetch();
    lastSavedKey.current = null;
  }, [refetch, setError]);

  const handleFinish = useCallback(async () => {
    if (!lastFlight || !user) return;

    // Create a unique key for this flight
    const currentFlightKey = `${lastFlight.block_out}-${lastFlight.block_in}`;

    const distance = getDistanceFromLatLonInKm(
      contract.to_airport.lat,
      contract.to_airport.lon,
      lastFlight.lat,
      lastFlight.lon
    );

    if (distance > 30) {
      setError("You must be within 30km of the arrival airport to complete the flight.");
      return;
    }

    if (lastFlight.maintenance_used) {
      const repairedKeys = Object.entries(lastFlight.maintenance_used).filter(
        ([_, value]) => typeof value === "number" && value < 0
      );
      if (repairedKeys.length > 0) {
        setError("Detected repairs during flight. You cannot decrease wear during a mission.");
        return;
      }
    }

    if (lastSavedKey.current !== currentFlightKey) {
      await supabase.from("flights").insert({
        user_id: user.id,
        aircraft_id: contract.aircraft_id.id,
        date: lastFlight.block_out?.slice(0, 10),
        departure_icao: contract.from_airport.icao,
        arrival_icao: contract.to_airport.icao,
        block_out: lastFlight.block_out,
        block_in: lastFlight.block_in,
        block_time: lastFlight.block_time,
        fuel_used: lastFlight.fuel_used,
        maintenance: lastFlight.maintenance_used,
        status: "draft",
      });
    }

    lastSavedKey.current = currentFlightKey;
    setError(null);
    refetch();

    const frontendUrl = import.meta.env.VITE_SKYNEXUS_FRONTEND_URL;
    if (frontendUrl) {
      window.open(`${frontendUrl}/dashboard/contracts/${contract.id}`, "_blank");
    }
  }, [contract, lastFlight, user, refetch, setError]);

  return { handleFinish, handleAbort };
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
