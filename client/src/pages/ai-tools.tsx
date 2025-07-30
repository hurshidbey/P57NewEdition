import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, ThumbsUp, ThumbsDown, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";
import type { AiTool, AiToolVote } from "@shared/schema";

interface AiToolWithVote extends AiTool {
  userVote?: 'up' | 'down' | null;
}

export default function AiToolsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch AI tools
  const { data: tools = [], isLoading: toolsLoading } = useQuery({
    queryKey: ['ai-tools'],
    queryFn: async () => {
      const response = await fetch('/api/ai-tools');
      if (!response.ok) throw new Error('Failed to fetch AI tools');
      return response.json() as Promise<AiTool[]>;
    }
  });

  // Fetch user votes
  const { data: userVotes = [] } = useQuery({
    queryKey: ['ai-tools-user-votes'],
    queryFn: async () => {
      const token = localStorage.getItem('protokol57-token');
      const response = await fetch('/api/ai-tools/user-votes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch user votes');
      return response.json() as Promise<AiToolVote[]>;
    },
    enabled: !!user
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ toolId, voteType }: { toolId: number; voteType: 'up' | 'down' }) => {
      const token = localStorage.getItem('protokol57-token');
      const response = await fetch(`/api/ai-tools/${toolId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voteType })
      });
      if (!response.ok) throw new Error('Failed to vote');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-tools'] });
      queryClient.invalidateQueries({ queryKey: ['ai-tools-user-votes'] });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Ovoz berishda xatolik yuz berdi",
        variant: "destructive"
      });
    }
  });

  // Remove vote mutation
  const removeVoteMutation = useMutation({
    mutationFn: async (toolId: number) => {
      const token = localStorage.getItem('protokol57-token');
      const response = await fetch(`/api/ai-tools/${toolId}/vote`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to remove vote');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-tools'] });
      queryClient.invalidateQueries({ queryKey: ['ai-tools-user-votes'] });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Ovozni o'chirishda xatolik yuz berdi",
        variant: "destructive"
      });
    }
  });

  // Combine tools with user votes
  const toolsWithVotes: AiToolWithVote[] = tools.map(tool => {
    const userVote = userVotes.find(v => v.toolId === tool.id);
    return {
      ...tool,
      userVote: userVote ? userVote.voteType as 'up' | 'down' : null
    };
  });

  // Filter tools based on search
  const filteredTools = toolsWithVotes.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVote = (toolId: number, voteType: 'up' | 'down', currentVote?: 'up' | 'down' | null) => {
    if (!user) {
      toast({
        title: "Ro'yxatdan o'tish kerak",
        description: "Ovoz berish uchun avval tizimga kiring",
        variant: "destructive"
      });
      return;
    }

    if (currentVote === voteType) {
      // Remove vote if clicking the same vote type
      removeVoteMutation.mutate(toolId);
    } else {
      // Vote or change vote
      voteMutation.mutate({ toolId, voteType });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold mb-4">AI Toollar</h1>
          <p className="text-muted-foreground mb-6">
            Foydali AI vositalari ro'yxati - ovoz bering va o'z sevimli asboblaringizni toping
          </p>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Toollarni qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tools Table */}
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium">Nomi</th>
                  <th className="text-left px-6 py-3 text-sm font-medium">Tavsifi</th>
                  <th className="text-left px-6 py-3 text-sm font-medium">Havola</th>
                  <th className="text-center px-6 py-3 text-sm font-medium">Ovozlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {toolsLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : filteredTools.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      Hech qanday asbob topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredTools.map((tool) => (
                    <tr key={tool.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium">{tool.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-muted-foreground max-w-md">
                          {tool.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={tool.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-accent hover:underline"
                        >
                          Ko'rish
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-4">
                          {/* Upvote button */}
                          <button
                            onClick={() => handleVote(tool.id, 'up', tool.userVote)}
                            className={`flex items-center gap-1 transition-colors ${
                              tool.userVote === 'up'
                                ? 'text-green-600'
                                : 'text-muted-foreground hover:text-green-600'
                            }`}
                            disabled={voteMutation.isPending || removeVoteMutation.isPending}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span className="font-medium">{tool.upvotes}</span>
                          </button>
                          
                          {/* Downvote button */}
                          <button
                            onClick={() => handleVote(tool.id, 'down', tool.userVote)}
                            className={`flex items-center gap-1 transition-colors ${
                              tool.userVote === 'down'
                                ? 'text-red-600'
                                : 'text-muted-foreground hover:text-red-600'
                            }`}
                            disabled={voteMutation.isPending || removeVoteMutation.isPending}
                          >
                            <ThumbsDown className="h-4 w-4" />
                            <span className="font-medium">{tool.downvotes}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
}