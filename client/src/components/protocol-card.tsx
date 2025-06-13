import { Protocol } from "@shared/types";
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
    <Card className={`bg-card border-2 transition-all duration-200 group h-full ${
      isCompleted 
        ? 'border-green-400 hover:border-green-500 shadow-sm dark:border-green-500/50 dark:hover:border-green-400' 
        : 'border-border hover:border-accent hover:shadow-lg'
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
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-accent text-accent-foreground'
            }`}>
              {protocol.number.toString().padStart(2, '0')}
            </div>
          </div>
          
          {/* Difficulty Level Badge */}
          {protocol.difficultyLevel && (
            <div className="mb-2">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                protocol.difficultyLevel === 'BEGINNER' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : protocol.difficultyLevel === 'O\'RTA DARAJA'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {protocol.difficultyLevel === 'BEGINNER' ? 'Boshlang\'ich' : 
                 protocol.difficultyLevel === 'O\'RTA DARAJA' ? 'O\'rta daraja' : 'Yuqori daraja'}
              </span>
            </div>
          )}
          
          {/* Title - 8pt grid spacing */}
          <h3 className="text-lg font-bold text-foreground mb-3 leading-tight pr-6 line-height-[1.4]">
            {protocol.title}
          </h3>
          
          {/* Problem Statement - 8pt grid spacing */}
          <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-4 text-sm line-height-[1.5]">
            {protocol.problemStatement || protocol.description}
          </p>
        </Link>
        
        {/* Action buttons - 8pt grid spacing */}
        <div className="flex items-center gap-2 pt-2">
          {!isCompleted ? (
            <Button 
              onClick={handleMarkCompleted}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600 px-3 py-1.5 h-7 text-xs font-medium"
            >
              O'rgandim
            </Button>
          ) : (
            <Button 
              onClick={handleMarkCompleted}
              size="sm"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900/20 px-3 py-1.5 h-7 text-xs font-medium"
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
