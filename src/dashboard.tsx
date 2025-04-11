import ActiveContract from "./components/active-contract";
import SimulatorStatusCard from "./components/simulator-status";
import UserPanel from "./components/user-panel";
import { useActiveContract } from "./hooks/use-active-contract";

type Props = {
  user: any;
  onLogout: () => void;
};

export default function Dashboard({ user, onLogout }: Props) {
  const {
    contract,
    loading,
    error,
    refresh: refreshContract,
  } = useActiveContract(user.id);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
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

        {/* Contract */}
        <div>
          <ActiveContract
            contract={contract}
            loading={loading}
            error={error}
            onRefresh={refreshContract}
          />
        </div>

        {contract && (
          <div>
              <SimulatorStatusCard contract={contract} user={user} />
          </div>
        )}
      </div>
    </div>
  );
}
