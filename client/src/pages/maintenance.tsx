import { useEffect } from "react";

export default function MaintenancePage() {
  useEffect(() => {
    document.title = "Protokol 57 - Texnik ishlar";
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-black mb-8 text-foreground">
          Saytni yanayam yaxshilayapmiz.
        </h1>
        
        <div className="mb-8 flex justify-center">
          <img 
            src="/attached_assets/Ai Icon Set/006-robot-14.svg"
            alt="Protokol 57 Robot"
            width="200"
            height="200"
            className="opacity-80"
          />
        </div>
        
        <p className="text-lg text-muted-foreground mb-8">
          Tez orada qaytamiz. Sabringiz uchun rahmat!
        </p>
        
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Savol va takliflar uchun:</p>
          <a 
            href="https://t.me/birfoizbilim" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent hover:underline inline-flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
            </svg>
            @birfoizbilim
          </a>
        </div>
      </div>
    </div>
  );
}