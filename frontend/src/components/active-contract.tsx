import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { IconAlertTriangleFilled, IconRefresh } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card"; // Example UI components
import { Skeleton } from "@/components/ui/skeleton";
import { ContractCard } from "./contract-card";

type Airport = {
  icao: string;
  name: string;
  cover_image_url: string | null;
};

type Aircraft = {
  type: string;
  tail_number: string;
  cover_image_url: string | null;
};

type Contract = {
  id: string;
  from_airport: Airport;
  to_airport: Airport;
  aircraft_id: Aircraft;
  payload: string;
  payout: number;
  deadline: string;
  status: string;
  name: string;
  description: string;
};

type Props = {
  userId: string;
};

export default function ActiveContract({ userId }: Props) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveContract = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("contracts")
        .select("*, from_airport(*), to_airport(*), aircraft_id(*)")
        .eq("assigned_to", userId)
        .eq("status", "assigned")
        .limit(1)
        .single();

      if (error) throw new Error(error.message);
      setContract(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
      setContract(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveContract();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="border-2 border-yellow-600 p-4 rounded-lg text-yellow-600 flex items-center justify-between">
        <div className="flex items-center">
          <IconAlertTriangleFilled className="text-xl mr-3" />
          <div>
            <p className="font-semibold text-xl">No active contract found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please go to the dashboard and assign an active contract to start your flight.
            </p>
          </div>
        </div>
        <button
          onClick={fetchActiveContract}
          className="ml-4 p-2 text-xl text-primary hover:text-primary/90 transition-all cursor-pointer"
        >
          <IconRefresh />
        </button>
      </div>
    );
  }

  return (
    <ContractCard contract={contract} onRefresh={fetchActiveContract} />
  );
}
