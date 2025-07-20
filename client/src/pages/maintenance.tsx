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
          <svg 
            width="200" 
            height="200" 
            viewBox="0 0 512 512" 
            className="text-accent"
            fill="currentColor"
          >
            <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm0 32c97.2 0 176 78.8 176 176s-78.8 176-176 176S80 353.2 80 256 158.8 80 256 80z"/>
            <path d="M352 176c0-26.5-21.5-48-48-48s-48 21.5-48 48 21.5 48 48 48 48-21.5 48-48zm-48 16c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16zM208 128c-26.5 0-48 21.5-48 48s21.5 48 48 48 48-21.5 48-48-21.5-48-48-48zm0 64c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z"/>
            <path d="M256 272c-44.2 0-80 35.8-80 80h160c0-44.2-35.8-80-80-80zm-48 48c0-26.5 21.5-48 48-48s48 21.5 48 48h-96z"/>
            <circle cx="256" cy="150" r="12"/>
            <path d="M256 96v-16M256 432v-16M160 256h-16M368 256h-16"/>
          </svg>
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