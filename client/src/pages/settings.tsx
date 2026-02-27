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
import { Bot, KeyRound, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Use partial schema for form, as all fields can be updated
const formSchema = z.object({
  groqApiKey: z.string().min(1, "API Key is required"),
  systemPrompt: z.string().min(10, "Prompt should be at least 10 characters"),
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
      groqApiKey: "",
      systemPrompt: "",
      isActive: false,
      companyName: "",
      ownerName: "",
      products: "",
      pixKey: "",
      customCommands: "",
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        groqApiKey: settings.groqApiKey || "",
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
          <h1 className="text-3xl font-bold tracking-tight font-display">Configuration</h1>
          <p className="text-muted-foreground mt-1">Manage AI behavior and integration keys.</p>
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-display text-foreground">Configuration</h1>
        <p className="text-muted-foreground mt-1">Manage AI behavior and API connections.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <Bot className="h-5 w-5 text-primary" />
                Bot Behavior
              </CardTitle>
              <CardDescription>
                Customize how your AI sales assistant responds to customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-4 shadow-sm bg-background">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">Enable Auto-replies</FormLabel>
                      <FormDescription>
                        Turn the bot on or off. When off, the bot will not respond to incoming messages.
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
                    <FormLabel className="text-base">System Prompt</FormLabel>
                    <FormDescription>
                      The core instructions for the AI. Tell it how to act, what tone to use, and what information to prioritize.
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

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <KeyRound className="h-5 w-5 text-primary" />
                Integration Keys
              </CardTitle>
              <CardDescription>
                API credentials required for the language model to function.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <FormField
                control={form.control}
                name="groqApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Groq API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="gsk_..."
                        className="font-mono text-sm bg-muted/10 border-border/50 focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Get your API key from the <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-primary hover:underline">Groq Console</a>.
                    </FormDescription>
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
              {isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
