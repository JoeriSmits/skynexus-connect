import { useState } from "react";
import {
  IconArrowBarToLeft,
  IconArrowBarToRight,
  IconClockHour4,
  IconGasStation,
  IconCheck,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

interface FlightSummaryProps {
  blockTime: number;
  blockOut?: string;
  blockIn?: string;
  fuelUsed: number;
  onFinish: () => Promise<void> | void;
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
  const [status, setStatus] = useState<"idle" | "loading" | "completed">("idle");
  const [showFinalSummary, setShowFinalSummary] = useState(false);

  const handleFinish = async () => {
    setStatus("loading");
    setShowFinalSummary(false);
    try {
      await onFinish();
    } catch (e) {
      console.error("Error submitting flight:", e);
    } finally {
      setStatus("completed");
      setTimeout(() => setShowFinalSummary(true), 2000);
    }
  };

  const formatTime = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <div className="relative">
      <div className="border-2 border-green-600 p-5 rounded-xl flex flex-col md:flex-row md:items-start md:justify-between text-green-700 space-y-4 md:space-y-0 relative overflow-hidden">
        {/* Loading Overlay */}
        {status === "loading" && (
          <div className="absolute inset-0 bg-green-400/5 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-600 border-opacity-60 mb-3" />
            <p className="text-sm text-green-700 font-medium animate-pulse">Completing flight...</p>
          </div>
        )}

        {/* Complete Animation */}
        <AnimatePresence>
          {status === "completed" && !showFinalSummary && (
            <motion.div
              className={`absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center z-20 ${
                errorMessage ? "bg-red-100/80 text-red-700" : "bg-green-400/5 text-green-700"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`flex items-center justify-center w-16 h-16 rounded-full shadow-md ${
                    errorMessage ? "bg-red-600" : "bg-green-400"
                  }`}
                >
                  {errorMessage ? (
                    <IconX className="w-10 h-10 text-white" />
                  ) : (
                    <IconCheck className="w-10 h-10 text-white" />
                  )}
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg font-semibold text-center px-4"
                >
                  {errorMessage ? "Something went wrong" : "Flight completed!"}
                </motion.p>

                {errorMessage && (
                  <p className="text-sm text-center text-red-700">{errorMessage}</p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Info */}
        <div>
          <p className="text-lg font-bold">Flight completed</p>

          {status === "completed" && !errorMessage && showFinalSummary && (
            <div className="flex items-start gap-2 mt-2 px-3 py-2 border-2 border-yellow-600 rounded-md text-white text-sm">
              <IconInfoCircle className="w-4 h-4 mt-0.5 text-yellow-600" />
              <span>
                Go to the <span className="font-medium">SkyNexus dashboard</span> and open the contract to complete it.
              </span>
            </div>
          )}


          <div className="mt-2 text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <IconClockHour4 className="w-4 h-4 text-muted-foreground" />
              <span className="w-28">Block time:</span>
              <span className="font-medium text-foreground">
                {blockTime.toFixed(2)} hours
              </span>
            </div>

            <div className="flex items-center gap-2">
              <IconGasStation className="w-4 h-4 text-muted-foreground" />
              <span className="w-28">Fuel used:</span>
              <span className="font-medium text-foreground">
                {fuelUsed.toFixed(2)} L
              </span>
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

        {(status === "idle" || errorMessage) && (
          <div className="flex flex-col md:items-end gap-2 md:ml-6 mt-2 md:mt-0 w-full md:w-auto">
            <div className="flex flex-col md:flex-row gap-2">
              <button
                onClick={handleFinish}
                disabled={status === "loading"}
                className="inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                Submit Flight
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
        )}


      </div>
    </div>
  );
}
