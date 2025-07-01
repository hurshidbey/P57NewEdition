import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useProtocolNavigation } from "@/hooks/use-protocol-navigation";
import { motion } from "framer-motion";

interface ProtocolNavigationProps {
  currentProtocolId: number;
}

export default function ProtocolNavigation({ currentProtocolId }: ProtocolNavigationProps) {
  const { previousProtocol, nextProtocol, currentIndex, totalProtocols } = useProtocolNavigation(currentProtocolId);

  if (!previousProtocol && !nextProtocol) {
    return null; // Don't render if no navigation available
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Previous Protocol */}
        {previousProtocol ? (
          <Link href={`/protocols/${previousProtocol.id}`} className="flex-1 max-w-[280px]">
            <Button 
              variant="outline" 
              className="w-full h-[48px] px-6 py-2 border-2 border-black bg-white hover:bg-gray-100 transition-all touch-manipulation hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-start gap-3 text-left"
            >
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <div className="overflow-hidden">
                <div className="text-xs font-bold uppercase text-gray-600">OLDINGI</div>
                <div className="font-bold text-sm uppercase truncate">{previousProtocol.number.toString().padStart(2, '0')}. {previousProtocol.title}</div>
              </div>
            </Button>
          </Link>
        ) : (
          <div className="flex-1 max-w-[280px]" />
        )}

        {/* Progress Indicator - Centered */}
        <div className="flex-shrink-0">
          <div className="px-6 py-3 bg-white border-2 border-black">
            <span className="text-base font-bold text-black">{currentIndex} / {totalProtocols}</span>
          </div>
        </div>

        {/* Next Protocol */}
        {nextProtocol ? (
          <Link href={`/protocols/${nextProtocol.id}`} className="flex-1 max-w-[280px]">
            <Button 
              variant="outline" 
              className="w-full h-[48px] px-6 py-2 border-2 border-black bg-white hover:bg-gray-100 transition-all touch-manipulation hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-end gap-3 text-right"
            >
              <div className="overflow-hidden">
                <div className="text-xs font-bold uppercase text-gray-600">KEYINGI</div>
                <div className="font-bold text-sm uppercase truncate">{nextProtocol.number.toString().padStart(2, '0')}. {nextProtocol.title}</div>
              </div>
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            </Button>
          </Link>
        ) : (
          <div className="flex-1 max-w-[280px]" />
        )}
      </div>
    </motion.section>
  );
}