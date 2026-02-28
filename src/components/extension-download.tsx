import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Chrome } from "lucide-react";

export function ExtensionDownload() {
  const handleDownload = () => {
    window.location.href = '/extension.zip';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Chrome className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Extensão Chrome</CardTitle>
            <CardDescription>Baixe a extensão para integrar o bot diretamente no WhatsApp Web</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A extensão permite que você use todas as ferramentas do GroqBot (Painel, Atalhos, Contatos) diretamente dentro da interface do WhatsApp Web.
          </p>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="text-sm font-medium">Como instalar:</h4>
            <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
              <li>Baixe o arquivo da extensão clicando no botão abaixo.</li>
              <li>Extraia o arquivo (clique com o botão direito > Extrair tudo).</li>
              <li>Abra o Chrome e acesse <code className="bg-background px-1 rounded">chrome://extensions</code>.</li>
              <li>Ative o "Modo do desenvolvedor" no canto superior direito.</li>
              <li>Clique em "Carregar sem compactação" e selecione a <strong>pasta</strong> extraída (onde está o manifest.json).</li>
            </ol>
          </div>
          <Button onClick={handleDownload} className="w-full gap-2">
            <Download className="h-4 w-4" />
            Baixar Extensão (.zip)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
