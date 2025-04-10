import { Contract } from "@/types/contract";
import { useState, useEffect } from "react";

type Props = {
    contract: Contract;
  };
  
  export default function SimulatorStatusCard({ contract }: Props) {
    const [simConnected, setSimConnected] = useState(false);
    const [withinRange, setWithinRange] = useState(false);
    const [aircraftData, setAircraftData] = useState<SimAircraftData | null>(null);
    const [flightStarted, setFlightStarted] = useState(false);
    const [monitoring, setMonitoring] = useState(false);
  
    // Fetch simulator data — this will come from your Python connector
    useEffect(() => {
      const interval = setInterval(async () => {
        const res = await fetch("/api/simulator-status"); // or WebSocket/polling
        const data = await res.json();
  
        setSimConnected(data.connected);
        setAircraftData(data.aircraft);
  
        const distance = getDistanceFromLatLonInKm(
          contract.from_airport.lat,
          contract.from_airport.lon,
          data.aircraft.lat,
          data.aircraft.lon
        );
  
        setWithinRange(distance < 30);
      }, 2000);
  
      return () => clearInterval(interval);
    }, [contract.from_airport]);
  
    function startFlight() {
      if (!aircraftData) return;
  
      setFlightStarted(true);
  
      // Optionally call API to set aircraft state (fuel, wear)
      fetch("/api/set-initial-state", {
        method: "POST",
        body: JSON.stringify({
          aircraft_id: contract.aircraft_id,
          fuel: aircraftData.fuel_liters,
          engine_wear: aircraftData.engine_wear,
        }),
      });
    }
  
    function finishFlight() {
      // Send final flight data (block time, fuel used)
      fetch("/api/complete-flight", {
        method: "POST",
        body: JSON.stringify({
          contract_id: contract.id,
          fuel_used: aircraftData?.fuel_used,
          block_time: aircraftData?.block_time,
        }),
      });
  
      setFlightStarted(false);
    }
  
    return (
      <div className="border rounded-xl p-4 space-y-4">
        <h2 className="text-xl font-bold">Simulator Status</h2>
  
        {!simConnected && <p className="text-red-500">Simulator not connected</p>}
  
        {simConnected && (
          <div>
            <p className="text-sm text-muted-foreground">Aircraft: {aircraftData?.model}</p>
            <p>Location: {aircraftData?.lat}, {aircraftData?.lon}</p>
            <p>Distance from airport: {withinRange ? "✅ Within 30km" : "❌ Too far"}</p>
            <p>RPM: {aircraftData?.rpm}</p>
            <p>Fuel: {aircraftData?.fuel_liters} L</p>
          </div>
        )}
  
        {simConnected && withinRange && !flightStarted && (
          <button onClick={startFlight} className="btn btn-primary">Start Flight</button>
        )}
  
        {flightStarted && aircraftData?.rpm > 100 && !monitoring && (
          <p>✈️ Flight in progress… tracking block time</p>
        )}
  
        {flightStarted && aircraftData?.rpm <= 100 && (
          <button onClick={finishFlight} className="btn btn-success">Finish Flight</button>
        )}
      </div>
    );
  }
  