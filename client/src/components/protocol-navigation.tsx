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
      className="mt-16 mb-12"
    >
      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center justify-between gap-4">
        {/* Previous Protocol */}
        {previousProtocol ? (
          <Link href={`/protocols/${previousProtocol.id}`} className="flex-1 max-w-[280px]">
            <Button 
              variant="outline" 
              className="w-full h-[48px] px-6 py-2 border-2 border-theme bg-background dark:bg-accent hover:bg-secondary dark:hover:bg-accent/90 text-foreground dark:text-black transition-all touch-manipulation hover:shadow-brutal flex items-center justify-start gap-3 text-left"
            >
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <div className="overflow-hidden">
                <div className="text-xs font-bold uppercase text-muted-foreground dark:text-black/70">OLDINGI</div>
                <div className="font-bold text-sm uppercase truncate">{previousProtocol.number.toString().padStart(2, '0')}. {previousProtocol.title}</div>
              </div>
            </Button>
          </Link>
        ) : (
          <div className="flex-1 max-w-[280px]" />
        )}

        {/* Progress Indicator - Centered */}
        <div className="flex-shrink-0">
          <div className="px-6 py-3 bg-card border-2 border-theme">
            <span className="text-base font-bold text-foreground">{currentIndex} / {totalProtocols}</span>
          </div>
        </div>

        {/* Next Protocol */}
        {nextProtocol ? (
          <Link href={`/protocols/${nextProtocol.id}`} className="flex-1 max-w-[280px]">
            <Button 
              variant="outline" 
              className="w-full h-[48px] px-6 py-2 border-2 border-theme bg-background dark:bg-accent hover:bg-secondary dark:hover:bg-accent/90 text-foreground dark:text-black transition-all touch-manipulation hover:shadow-brutal flex items-center justify-end gap-3 text-right"
            >
              <div className="overflow-hidden">
                <div className="text-xs font-bold uppercase text-muted-foreground dark:text-black/70">KEYINGI</div>
                <div className="font-bold text-sm uppercase truncate">{nextProtocol.number.toString().padStart(2, '0')}. {nextProtocol.title}</div>
              </div>
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            </Button>
          </Link>
        ) : (
          <div className="flex-1 max-w-[280px]" />
        )}
      </div>

      {/* Mobile Layout - Stacked */}
      <div className="sm:hidden flex flex-col gap-3">
        {/* Progress Indicator - Top */}
        <div className="text-center mb-2">
          <div className="inline-block px-6 py-3 bg-card border-2 border-theme">
            <span className="text-base font-bold text-foreground">{currentIndex} / {totalProtocols}</span>
          </div>
        </div>

        {/* Navigation Buttons - Horizontal */}
        <div className="flex gap-3">
          {/* Previous Protocol */}
          {previousProtocol ? (
            <Link href={`/protocols/${previousProtocol.id}`} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full h-[48px] px-4 py-2 border-2 border-theme bg-background dark:bg-accent hover:bg-secondary dark:hover:bg-accent/90 text-foreground dark:text-black transition-all touch-manipulation flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-bold uppercase">OLDINGI</span>
              </Button>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {/* Next Protocol */}
          {nextProtocol ? (
            <Link href={`/protocols/${nextProtocol.id}`} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full h-[48px] px-4 py-2 border-2 border-theme bg-background dark:bg-accent hover:bg-secondary dark:hover:bg-accent/90 text-foreground dark:text-black transition-all touch-manipulation flex items-center justify-center gap-2"
              >
                <span className="text-xs font-bold uppercase">KEYINGI</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </Button>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </motion.section>
  );
}