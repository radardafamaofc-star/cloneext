import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Chrome } from "lucide-react";
import { useState } from "react";
import JSZip from "jszip";

const EXTENSION_FILES = [
  "manifest.json",
  "popup.html",
  "popup.js",
  "content.js",
  "content.css",
  "style.css",
  "background.js",
  "icon16.png",
  "icon48.png",
  "icon128.png",
];

export function ExtensionDownload() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("groqbot-extension")!;

      await Promise.all(
        EXTENSION_FILES.map(async (file) => {
          const res = await fetch(`/extension/${file}`);
          const blob = await res.blob();
          folder.file(file, blob);
        })
      );

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "groqbot-extension.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Erro ao gerar zip:", e);
    } finally {
      setLoading(false);
    }
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
              <li>Extraia o arquivo (clique com o botão direito e selecione "Extrair tudo").</li>
              <li>Abra o Chrome e acesse <code className="bg-background px-1 rounded">chrome://extensions</code>.</li>
              <li>Ative o "Modo do desenvolvedor" no canto superior direito.</li>
              <li>Clique em "Carregar sem compactação" e selecione a <strong>pasta</strong> extraída (onde está o manifest.json).</li>
            </ol>
          </div>
          <Button onClick={handleDownload} disabled={loading} className="w-full gap-2">
            <Download className="h-4 w-4" />
            {loading ? "Gerando..." : "Baixar Extensão (.zip)"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
