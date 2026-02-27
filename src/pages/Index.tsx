const Index = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-8 p-8">
      <h1 className="text-4xl font-bold text-white tracking-tight">
        Lovable Infinite — Extension Preview
      </h1>
      <p className="text-zinc-400 text-center max-w-xl">
        Os arquivos da extensão estão neste projeto. Modifique os arquivos CSS
        (styles.css, styles_append.css) e HTML (popup.html, auth.html) para alterar o layout.
      </p>
      <div className="border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl" style={{ width: 400, height: 600 }}>
        <iframe
          src="/popup.html"
          className="w-full h-full border-0"
          title="Extension Preview"
        />
      </div>
    </div>
  );
};

export default Index;
