const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-8 p-8" style={{ background: '#0d0d0d' }}>
      <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 700 }}>Admin Panel</h1>
      <div style={{ width: 900, height: 700, borderRadius: 16, overflow: 'hidden', border: '1px solid #222', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <iframe
          src="/admin_panel/public/index.html"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Admin Panel"
        />
      </div>
    </div>
  );
};

export default Index;
