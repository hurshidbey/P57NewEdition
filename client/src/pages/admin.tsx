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
};

export default function Admin() {
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    });
  };

  const handleCancelEdit = () => {
    setEditingProtocol(null);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black mb-2">Boshqaruv paneli</h1>
          <p className="text-gray-600">Protokollar va kategoriyalarni boshqaring</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Protocol Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                {editingProtocol ? "Protokolni tahrirlash" : "Yangi protokol qo'shish"}
              </CardTitle>
            </CardHeader>
            <CardContent>
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

                  <div className="flex space-x-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-accent text-white hover:bg-accent/90"
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
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {protocols?.map((protocol) => (
                  <div key={protocol.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="w-8 h-8 bg-accent text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          {protocol.number}
                        </span>
                        <h3 className="font-semibold">{protocol.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {protocol.description}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(protocol)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(protocol.id)}
                        disabled={deleteMutation.isPending}
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
