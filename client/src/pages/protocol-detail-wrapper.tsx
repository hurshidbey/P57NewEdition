import { ProgressProvider } from "@/contexts/progress-context";
import { ProtocolsProvider } from "@/contexts/protocols-context";
import ProtocolDetail from "./protocol-detail";

export default function ProtocolDetailWrapper() {
  return (
    <ProgressProvider>
      <ProtocolsProvider>
        <ProtocolDetail />
      </ProtocolsProvider>
    </ProgressProvider>
  );
}