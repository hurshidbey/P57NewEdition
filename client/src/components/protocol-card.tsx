import { Protocol } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useProgress } from "@/hooks/use-progress";

interface ProtocolCardProps {
  protocol: Protocol;
}

export default function ProtocolCard({ protocol }: ProtocolCardProps) {
  const { isProtocolCompleted, getProtocolProgress, markProtocolCompleted } = useProgress();
  const isCompleted = isProtocolCompleted(protocol.id);
  const progress = getProtocolProgress(protocol.id);

  const handleMarkCompleted = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markProtocolCompleted(protocol.id, 70);
  };
  
  return (
    <Card className={`bg-white border-2 transition-all duration-200 group h-full ${
      isCompleted 
        ? 'border-green-400 hover:border-green-500 shadow-sm' 
        : 'border-gray-200 hover:border-accent hover:shadow-lg'
    }`}>
      <CardContent className="p-6 relative">
        {/* Progress indicator */}
        {isCompleted && (
          <div className="absolute top-4 right-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        )}
        
        <Link href={`/protocols/${protocol.id}`} className="block">
          {/* Protocol Number */}
          <div className="mb-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg shadow-sm ${
              isCompleted 
                ? 'bg-green-100 text-green-700' 
                : 'bg-accent text-white'
            }`}>
              {protocol.number.toString().padStart(2, '0')}
            </div>
          </div>
          
          {/* Title - 8pt grid spacing */}
          <h3 className="text-lg font-bold text-black mb-3 leading-tight pr-6 line-height-[1.4]">
            {protocol.title}
          </h3>
          
          {/* Description - 8pt grid spacing */}
          <p className="text-gray-600 leading-relaxed line-clamp-3 mb-4 text-sm line-height-[1.5]">
            {protocol.description}
          </p>
        </Link>
        
        {/* Action buttons - 8pt grid spacing */}
        <div className="flex items-center gap-2 pt-2">
          {!isCompleted ? (
            <Button 
              onClick={handleMarkCompleted}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 h-7 text-xs font-medium"
            >
              O'rgandim
            </Button>
          ) : (
            <Button 
              onClick={handleMarkCompleted}
              size="sm"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 px-3 py-1.5 h-7 text-xs font-medium"
            >
              Qayta mashq qilish
            </Button>
          )}
          
          <Link href={`/protocols/${protocol.id}`}>
            <Button size="sm" variant="outline" className="px-3 py-1.5 h-7 text-xs font-medium">
              Ko'rish
            </Button>
          </Link>
        </div>
        
      </CardContent>
    </Card>
  );
}
