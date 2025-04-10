import { IconCircleCheck } from "@tabler/icons-react";

interface FlightSummaryProps {
  blockTime: number;
  blockOut?: string;
  blockIn?: string;
  fuelUsed: number;
  onFinish: () => void;
  onAbort?: () => void;
  showAbort?: boolean;
}

export default function FlightSummaryCard({
  blockTime,
  blockOut,
  blockIn,
  fuelUsed,
  onFinish,
  onAbort,
  showAbort = true,
}: FlightSummaryProps) {
  const formatTime = (iso?: string) =>
    iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) : "";

  return (
    <div className="border-2 border-green-600 p-5 rounded-xl flex flex-col md:flex-row md:items-start md:justify-between text-green-700 space-y-4 md:space-y-0">
      <div className="flex items-start space-x-4">
        <IconCircleCheck className="text-green-600 text-3xl mt-1" />
        <div>
          <p className="text-lg font-bold">Flight completed</p>
          <div className="mt-2 text-sm text-muted-foreground space-y-1">
            <p>
              ⏱️ Block time:{" "}
              <span className="font-medium text-foreground">
                {blockTime.toFixed(2)} hours
              </span>
            </p>
            <p>
              ⛽ Fuel used:{" "}
              <span className="font-medium text-foreground">
                {fuelUsed.toFixed(2)} L
              </span>
            </p>
            {blockOut && (
              <p>
                📤 Block OUT:{" "}
                <span className="font-mono text-foreground">{formatTime(blockOut)}</span>
              </p>
            )}
            {blockIn && (
              <p>
                📥 Block IN:{" "}
                <span className="font-mono text-foreground">{formatTime(blockIn)}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 md:ml-6 mt-2 md:mt-0">
        <button
          onClick={onFinish}
          className="inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium transition cursor-pointer"
        >
          Finish Flight
        </button>
        {showAbort && onAbort && (
          <button
            onClick={onAbort}
            className="inline-flex items-center justify-center rounded-md border border-red-600 text-red-600 hover:bg-red-50 px-4 py-2 text-sm font-medium transition cursor-pointer"
          >
            Abort Flight
          </button>
        )}
      </div>
    </div>
  );
}
