// useActiveContract.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Contract } from "@/types/contract";

export function useActiveContract(userId: string) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContract = async () => {
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
    fetchContract();
  }, [userId]);

  return {
    contract,
    loading,
    error,
    refresh: fetchContract,
  };
}
