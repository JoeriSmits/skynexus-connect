import { IconArrowBarToLeft, IconArrowBarToRight, IconClockHour4, IconGasStation } from "@tabler/icons-react";

interface FlightSummaryProps {
  blockTime: number;
  blockOut?: string;
  blockIn?: string;
  fuelUsed: number;
  onFinish: () => void;
  onAbort?: () => void;
  showAbort?: boolean;
  errorMessage?: string;
}

export default function FlightSummaryCard({
  blockTime,
  blockOut,
  blockIn,
  fuelUsed,
  onFinish,
  onAbort,
  showAbort = true,
  errorMessage,
}: FlightSummaryProps) {
  const formatTime = (iso?: string) =>
    iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit"}) : "";

  return (
    <div className="border-2 border-green-600 p-5 rounded-xl flex flex-col md:flex-row md:items-start md:justify-between text-green-700 space-y-4 md:space-y-0">
        <div>
          <p className="text-lg font-bold">Flight completed</p>
          <div className="mt-2 text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <IconClockHour4 className="w-4 h-4 text-muted-foreground" />
              <span className="w-28">Block time:</span>
              <span className="font-medium text-foreground">{blockTime.toFixed(2)} hours</span>
            </div>

            <div className="flex items-center gap-2">
              <IconGasStation className="w-4 h-4 text-muted-foreground" />
              <span className="w-28">Fuel used:</span>
              <span className="font-medium text-foreground">{fuelUsed.toFixed(2)} L</span>
            </div>

            {blockOut && (
              <div className="flex items-center gap-2">
                <IconArrowBarToRight className="w-4 h-4 text-muted-foreground" />
                <span className="w-28">Block OUT:</span>
                <span className="font-mono text-foreground">{formatTime(blockOut)}</span>
              </div>
            )}

            {blockIn && (
              <div className="flex items-center gap-2">
                <IconArrowBarToLeft className="w-4 h-4 text-muted-foreground" />
                <span className="w-28">Block IN:</span>
                <span className="font-mono text-foreground">{formatTime(blockIn)}</span>
              </div>
            )}
          </div>
      </div>

      {/* Wrap this whole right section */}
      <div className="flex flex-col md:flex-col items-start md:items-end gap-2 md:ml-6 mt-2 md:mt-0">
        {errorMessage && (
          <div className="text-sm text-red-600 font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-2">
          <button
            onClick={onFinish}
            className="inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium transition cursor-pointer"
          >
            Finish Flight & Complete Contract
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

    </div>
  );
}
