import { Protocol } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle, RotateCw } from "lucide-react";
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
    <Card className={`bg-white border-2 transition-all group h-full ${
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
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
              isCompleted 
                ? 'bg-green-100 text-green-700' 
                : 'bg-accent text-white'
            }`}>
              {protocol.number.toString().padStart(2, '0')}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {!isCompleted && <ChevronRight className="w-5 h-5 text-accent" />}
              {isCompleted && <RotateCw className="w-5 h-5 text-green-600" />}
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-black mb-3 leading-tight pr-10">
            {protocol.title}
          </h3>
          
          <p className="text-gray-600 leading-relaxed line-clamp-3 mb-4">
            {protocol.description}
          </p>
        </Link>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-4">
          {!isCompleted ? (
            <Button 
              onClick={handleMarkCompleted}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              O'rgandim
            </Button>
          ) : (
            <Button 
              onClick={handleMarkCompleted}
              size="sm"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Qayta mashq qilish
            </Button>
          )}
          
          <Link href={`/protocols/${protocol.id}`}>
            <Button size="sm" variant="outline">
              Ko'rish
            </Button>
          </Link>
        </div>
        
      </CardContent>
    </Card>
  );
}
