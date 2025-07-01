import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Protocol } from "@shared/types";
import { useProgress } from "@/hooks/use-progress";

interface ProtocolCardProps {
  protocol: Protocol;
}

export default function ProtocolCard({ protocol }: ProtocolCardProps) {
  const { isProtocolCompleted, toggleProtocolCompleted } = useProgress();
  const isCompleted = isProtocolCompleted(protocol.id);

  const handleToggleCompleted = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleProtocolCompleted(protocol.id, 70);
  };

  return (
    <Card className="group bg-card border-2 border-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden">
      <CardContent className="p-6">
        <Link href={`/protocol/${protocol.id}`} className="block">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className={`w-16 h-16 flex items-center justify-center font-black text-xl border-2 border-black ${
                isCompleted 
                  ? 'bg-accent text-foreground' 
                  : 'bg-card text-foreground'
              }`}>
                {protocol.number.toString().padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-foreground uppercase leading-tight mb-2 group-hover:text-foreground transition-colors">
                  {protocol.title}
                </h3>
                <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                  {protocol.description}
                </p>
              </div>
            </div>
            
            {/* Toggle Button */}
            <button
              onClick={handleToggleCompleted}
              className={`w-12 h-12 border-2 border-black transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center ${
                isCompleted 
                  ? 'bg-accent text-black' 
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
              style={{ backgroundColor: isCompleted ? '#1bffbb' : '#ffffff' }}
            >
              {isCompleted ? (
                <CheckCircle className="w-8 h-8 text-black" />
              ) : (
                <div className="w-6 h-6 border-2 border-black bg-white"></div>
              )}
            </button>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
