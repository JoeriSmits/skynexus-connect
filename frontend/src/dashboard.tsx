// dashboard.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Contract } from "@/types/contract";
import ActiveContract from "./components/active-contract";
import UserPanel from "./components/user-panel";

type Props = {
  user: any;
  onLogout: () => void;
};

export default function Dashboard({ user, onLogout }: Props) {
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
        .eq("assigned_to", user.id)
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
  }, [user.id]);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SkyNexus Connector</h1>
            <p className="text-muted-foreground text-sm">
              Monitor your active contract and account status
            </p>
          </div>
          <div className="w-full md:w-auto">
            <UserPanel user={user} onLogout={onLogout} />
          </div>
        </div>

        {/* Contract section */}
        <div>
          <ActiveContract
            contract={contract}
            loading={loading}
            error={error}
            onRefresh={fetchActiveContract}
          />
        </div>

        {/* Other widgets based on contract */}
        {contract && (
          <div>
            {/* Your other widgets go here */}
            <p className="text-green-600">You have an active contract!</p>
          </div>
        )}
      </div>
    </div>
  );
}
