import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bot, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  systemPrompt: z.string().min(10, "O prompt deve ter pelo menos 10 caracteres"),
  isActive: z.boolean().default(false),
  companyName: z.string().optional(),
  ownerName: z.string().optional(),
  products: z.string().optional(),
  pixKey: z.string().optional(),
  customCommands: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof formSchema>;

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systemPrompt: "",
      isActive: false,
      companyName: "",
      ownerName: "",
      products: "",
      pixKey: "",
      customCommands: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        systemPrompt: settings.systemPrompt || "",
        isActive: settings.isActive ?? false,
        companyName: settings.companyName || "",
        ownerName: settings.ownerName || "",
        products: settings.products || "",
        pixKey: settings.pixKey || "",
        customCommands: settings.customCommands || "",
      });
    }
  }, [settings, form]);

  const onSubmit = (data: SettingsFormValues) => {
    updateSettings(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display">Configurações</h1>
          <p className="text-muted-foreground mt-1">Gerencie o comportamento da IA e chaves de integração.</p>
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-display text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie o comportamento da IA e conexões.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <Bot className="h-5 w-5 text-primary" />
                Comportamento do Bot
              </CardTitle>
              <CardDescription>
                Personalize como o assistente de vendas responde aos clientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-4 shadow-sm bg-background">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">Ativar Respostas Automáticas</FormLabel>
                      <FormDescription>
                        Ligue ou desligue o bot. Quando desligado, o bot não responderá mensagens recebidas.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Prompt do Sistema</FormLabel>
                    <FormDescription>
                      As instruções principais para a IA. Diga como agir, qual tom usar e quais informações priorizar.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Você é um assistente de vendas útil e amigável..."
                        className="min-h-[150px] resize-y font-mono text-sm bg-muted/10 border-border/50 focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Minha Loja Ltda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seu Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="products"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produtos e Preços</FormLabel>
                    <FormDescription>Liste o que você vende e os valores.</FormDescription>
                    <FormControl>
                      <Textarea placeholder="Camiseta R$ 50,00..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pixKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave PIX</FormLabel>
                    <FormControl>
                      <Input placeholder="CPF, E-mail ou Celular" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customCommands"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comandos e FAQ</FormLabel>
                    <FormDescription>Instruções específicas para perguntas frequentes.</FormDescription>
                    <FormControl>
                      <Textarea placeholder="Se perguntarem sobre entrega: entregamos em 24h..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              disabled={isPending || !form.formState.isDirty}
              className="px-8 shadow-md hover:shadow-lg transition-all"
            >
              <Save className="mr-2 h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
