import { Protocol } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface ProtocolCardProps {
  protocol: Protocol;
}

export default function ProtocolCard({ protocol }: ProtocolCardProps) {
  return (
    <Link href={`/protocols/${protocol.id}`}>
      <Card className="bg-white border-2 border-gray-200 hover:border-accent hover:shadow-lg transition-all cursor-pointer group h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-accent text-white rounded-xl flex items-center justify-center font-black text-lg">
              {protocol.number.toString().padStart(2, '0')}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-accent" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-black mb-3 leading-tight">
            {protocol.title}
          </h3>
          
          <p className="text-gray-600 leading-relaxed line-clamp-3">
            {protocol.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
