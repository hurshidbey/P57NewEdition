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
      className="py-6 px-4 border-t-2 border-black"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        {/* Navigation Container */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Previous Protocol */}
          {previousProtocol ? (
            <Link href={`/protocols/${previousProtocol.id}`} className="flex-1 sm:flex-initial">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto h-[48px] px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 transition-all touch-manipulation hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center sm:justify-start gap-2"
              >
                <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold uppercase text-gray-600">OLDINGI</div>
                  <div className="font-bold text-sm uppercase">{previousProtocol.number}. {previousProtocol.title.substring(0, 20)}...</div>
                </div>
                <span className="sm:hidden text-xs font-bold uppercase">OLDINGI</span>
              </Button>
            </Link>
          ) : (
            <div className="flex-1 sm:flex-initial sm:w-[200px]" />
          )}

          {/* Progress Indicator - Centered */}
          <div className="flex-shrink-0 order-first sm:order-none">
            <div className="px-4 py-2 bg-white border-2 border-black">
              <span className="text-sm font-bold text-black">{currentIndex} / {totalProtocols}</span>
            </div>
          </div>

          {/* Next Protocol */}
          {nextProtocol ? (
            <Link href={`/protocols/${nextProtocol.id}`} className="flex-1 sm:flex-initial">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto h-[48px] px-4 py-2 border-2 border-black bg-white hover:bg-gray-100 transition-all touch-manipulation hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center sm:justify-start gap-2"
              >
                <span className="sm:hidden text-xs font-bold uppercase">KEYINGI</span>
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold uppercase text-gray-600">KEYINGI</div>
                  <div className="font-bold text-sm uppercase">{nextProtocol.number}. {nextProtocol.title.substring(0, 20)}...</div>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </Button>
            </Link>
          ) : (
            <div className="flex-1 sm:flex-initial sm:w-[200px]" />
          )}
        </div>
      </div>
    </motion.section>
  );
}