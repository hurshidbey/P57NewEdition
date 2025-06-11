import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Protocol, Category, insertProtocolSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import AppHeader from "@/components/app-header";
import AppFooter from "@/components/app-footer";

type FormData = {
  number: number;
  title: string;
  description: string;
  badExample: string;
  goodExample: string;
  categoryId: number;
  notes?: string;
  problemStatement?: string;
  whyExplanation?: string;
  solutionApproach?: string;
  difficultyLevel?: string;
  levelOrder?: number;
};

export default function Admin() {
  const { user } = useAuth();
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // CRITICAL SECURITY CHECK: Only hurshidbey@gmail.com can access admin
  if (user?.email !== 'hurshidbey@gmail.com') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-red-600 mb-4">Ruxsat berilmagan</h1>
          <p className="text-muted-foreground mb-4">Bu sahifaga kirish huquqingiz yo'q.</p>
          <p className="text-sm text-muted-foreground/70">Faqat admin foydalanuvchi kira oladi.</p>
        </div>
      </div>
    );
  }

  const { data: protocols } = useQuery<Protocol[]>({
    queryKey: ["/api/protocols", { limit: 1000 }],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(insertProtocolSchema.extend({
      badExample: insertProtocolSchema.shape.badExample.optional(),
      goodExample: insertProtocolSchema.shape.goodExample.optional(),
    })),
    defaultValues: {
      number: 1,
      title: "",
      description: "",
      badExample: "",
      goodExample: "",
      categoryId: 1,
      notes: "",
      problemStatement: "",
      whyExplanation: "",
      solutionApproach: "",
      difficultyLevel: "",
      levelOrder: 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/protocols", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocols"] });
      toast({ title: "Protokol muvaffaqiyatli yaratildi" });
      form.reset();
    },
    onError: () => {
      toast({ title: "Protokol yaratishda xatolik", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apiRequest("PUT", `/api/protocols/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocols"] });
      toast({ title: "Protokol muvaffaqiyatli yangilandi" });
      setEditingProtocol(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Protokolni yangilashda xatolik", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/protocols/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocols"] });
      toast({ title: "Protokol muvaffaqiyatli o'chirildi" });
    },
    onError: () => {
      toast({ title: "Protokolni o'chirishda xatolik", variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => {
    if (editingProtocol) {
      updateMutation.mutate({ id: editingProtocol.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (protocol: Protocol) => {
    setEditingProtocol(protocol);
    form.reset({
      number: protocol.number,
      title: protocol.title,
      description: protocol.description,
      badExample: protocol.badExample || "",
      goodExample: protocol.goodExample || "",
      categoryId: protocol.categoryId,
      notes: protocol.notes || "",
      problemStatement: protocol.problemStatement || "",
      whyExplanation: protocol.whyExplanation || "",
      solutionApproach: protocol.solutionApproach || "",
      difficultyLevel: protocol.difficultyLevel || "",
      levelOrder: protocol.levelOrder || 1,
    });
  };

  const handleCancelEdit = () => {
    setEditingProtocol(null);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground mb-2">Boshqaruv paneli</h1>
          <p className="text-muted-foreground">Protokollar va kategoriyalarni boshqaring</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Protocol Form */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                {editingProtocol ? "Protokolni tahrirlash" : "Yangi protokol qo'shish"}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protokol raqami</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sarlavha</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tavsif</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="badExample"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yomon misol</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="goodExample"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yaxshi misol</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategoriya</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eslatmalar (ixtiyoriy)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="problemStatement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Muammo bayoni (ixtiyoriy)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whyExplanation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nima uchun tushuntirish (ixtiyoriy)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="solutionApproach"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yechim yondashuvi (ixtiyoriy)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficultyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qiyinchilik darajasi (ixtiyoriy)</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Daraja tanlang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Boshlang'ich">🟢 Boshlang'ich</SelectItem>
                            <SelectItem value="O'rta daraja">🟡 O'rta daraja</SelectItem>
                            <SelectItem value="Yuqori daraja">🔴 Yuqori daraja</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="levelOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daraja tartibi (ixtiyoriy)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingProtocol ? "Protokolni yangilash" : "Protokol yaratish"}
                    </Button>
                    {editingProtocol && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Bekor qilish
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Protocols List */}
          <Card>
            <CardHeader>
              <CardTitle>Mavjud protokollar</CardTitle>
            </CardHeader>
            <CardContent className="h-[600px] overflow-hidden">
              <div className="space-y-4 h-full overflow-y-auto pr-2">
                {protocols?.map((protocol) => (
                  <div key={protocol.id} className="flex items-start justify-between p-4 border rounded-lg min-h-[120px]">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center space-x-2 mb-2 flex-wrap">
                        <span className="w-8 h-8 bg-accent text-accent-foreground rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {protocol.number}
                        </span>
                        <h3 className="font-semibold truncate">{protocol.title}</h3>
                        {/* Difficulty Level Badge */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          protocol.number >= 1 && protocol.number <= 20
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : protocol.number >= 21 && protocol.number <= 40
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {protocol.number >= 1 && protocol.number <= 20
                            ? '🟢 Boshlang\'ich'
                            : protocol.number >= 21 && protocol.number <= 40
                            ? '🟡 O\'rta daraja'
                            : '🔴 Yuqori daraja'
                          }
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {protocol.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="bg-muted px-2 py-1 rounded">Kategoriya: {categories?.find(c => c.id === protocol.categoryId)?.name}</span>
                        {protocol.difficultyLevel && <span className="bg-muted px-2 py-1 rounded">Daraja: {protocol.difficultyLevel}</span>}
                        {protocol.levelOrder && <span className="bg-muted px-2 py-1 rounded">Tartib: {protocol.levelOrder}</span>}
                        {protocol.notes && <span className="bg-muted px-2 py-1 rounded">Eslatma: {protocol.notes.substring(0, 20)}...</span>}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(protocol)}
                        className="w-10 h-10 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(protocol.id)}
                        disabled={deleteMutation.isPending}
                        className="w-10 h-10 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
