import { Loader2 } from "lucide-react";

function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="animate-spin text-red-500 w-10 h-10" />
    </div>
  );
}

export default Loading;