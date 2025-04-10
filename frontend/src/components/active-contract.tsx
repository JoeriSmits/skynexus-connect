// active-contract.tsx
import { IconAlertTriangleFilled, IconRefresh } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractCard } from "./contract-card";
import { Contract } from "@/types/contract";

type Props = {
  contract: Contract | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

export default function ActiveContract({ contract, loading, error, onRefresh }: Props) {
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
          onClick={onRefresh}
          className="ml-4 p-2 text-xl text-primary hover:text-primary/90 transition-all cursor-pointer"
        >
          <IconRefresh />
        </button>
      </div>
    );
  }

  return <ContractCard contract={contract} onRefresh={onRefresh} />;
}
