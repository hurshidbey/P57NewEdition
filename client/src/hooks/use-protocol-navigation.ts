import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Protocol {
  id: number;
  number: number;
  title: string;  
  levelOrder: number;
}

export function useProtocolNavigation(currentProtocolId: number) {
  // Fetch all protocols for navigation
  const { data: allProtocols = [] } = useQuery<Protocol[]>({
    queryKey: ['/api/protocols/all'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/protocols?limit=100');
      const data = await response.json();
      return data.protocols || [];
    },
  });

  // Sort protocols by number for consistent navigation
  const sortedProtocols = [...allProtocols].sort((a, b) => a.number - b.number);
  
  // Find current protocol index
  const currentIndex = sortedProtocols.findIndex(p => p.id === currentProtocolId);
  
  // Get previous and next protocols
  const previousProtocol = currentIndex > 0 ? sortedProtocols[currentIndex - 1] : null;
  const nextProtocol = currentIndex < sortedProtocols.length - 1 ? sortedProtocols[currentIndex + 1] : null;
  
  return {
    previousProtocol,
    nextProtocol,
    currentIndex: currentIndex + 1, // 1-based for display
    totalProtocols: sortedProtocols.length,
    allProtocols: sortedProtocols,
  };
}