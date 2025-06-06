import { Protocol } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, CheckCircle, RotateCw } from "lucide-react";
import { Link } from "wouter";
import { useProgress } from "@/hooks/use-progress";

interface ProtocolCardProps {
  protocol: Protocol;
}

export default function ProtocolCard({ protocol }: ProtocolCardProps) {
  const { isProtocolCompleted, getProtocolProgress } = useProgress();
  const isCompleted = isProtocolCompleted(protocol.id);
  const progress = getProtocolProgress(protocol.id);
  
  return (
    <Link href={`/protocols/${protocol.id}`}>
      <Card className={`bg-white border-2 transition-all cursor-pointer group h-full ${
        isCompleted 
          ? 'border-green-400 hover:border-green-500 shadow-sm' 
          : 'border-gray-200 hover:border-accent hover:shadow-lg'
      }`}>
        <CardContent className="p-6 relative">
          {/* Progress indicator */}
          {isCompleted && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-5 h-5 text-green-600" />
                {progress && progress.practiceCount > 1 && (
                  <span className="text-xs text-green-600 font-semibold">
                    {progress.practiceCount}x
                  </span>
                )}
              </div>
            </div>
          )}
          
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
          
          <p className="text-gray-600 leading-relaxed line-clamp-3">
            {protocol.description}
          </p>
          
          {/* Progress bar for multiple practices */}
          {progress && progress.practiceCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Mashq qilindi</span>
                <span className="font-medium">{progress.practiceCount} marta</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
