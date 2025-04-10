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

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/simulator-status");
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
      }
    } catch (err) {
      console.error("Failed to fetch simulator status:", err);
      setConnected(false);
    }
  }, [contract.from_airport.lat, contract.from_airport.lon]);

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
    refetch: fetchStatus, // 👈 return it here
  };
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
