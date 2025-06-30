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
      className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-4 border-t border-border/50"
    >
      {/* Previous Protocol */}
      <div className="flex-1 w-full sm:w-auto">
        {previousProtocol ? (
          <Link href={`/protocols/${previousProtocol.id}`}>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto justify-start gap-2 min-h-[48px] px-4 py-3 rounded-xl border-border/50 hover:border-accent hover:bg-accent/5 transition-all touch-manipulation group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Oldingi</div>
                <div className="font-medium text-sm truncate max-w-[200px]">
                  {previousProtocol.number}. {previousProtocol.title}
                </div>
              </div>
            </Button>
          </Link>
        ) : (
          <div className="invisible w-full sm:w-auto" />
        )}
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
        <span className="text-sm font-medium text-muted-foreground">
          {currentIndex} / {totalProtocols}
        </span>
      </div>

      {/* Next Protocol */}
      <div className="flex-1 w-full sm:w-auto">
        {nextProtocol ? (
          <Link href={`/protocols/${nextProtocol.id}`}>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto justify-end gap-2 min-h-[48px] px-4 py-3 rounded-xl border-border/50 hover:border-accent hover:bg-accent/5 transition-all touch-manipulation group sm:ml-auto"
            >
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Keyingi</div>
                <div className="font-medium text-sm truncate max-w-[200px]">
                  {nextProtocol.number}. {nextProtocol.title}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        ) : (
          <div className="invisible w-full sm:w-auto" />
        )}
      </div>
    </motion.section>
  );
}