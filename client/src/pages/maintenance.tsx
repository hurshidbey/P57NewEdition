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
        
        <div className="mb-8">
          <img 
            src="/maintenance-robot.png" 
            alt="Protokol 57 Robot"
            className="mx-auto max-w-md w-full"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>
        
        <p className="text-lg text-muted-foreground mb-8">
          Tez orada qaytamiz. Sabringiz uchun rahmat!
        </p>
        
        <div className="text-sm text-muted-foreground">
          <p>Savol va takliflar uchun:</p>
          <p className="font-mono">info@protokol57.uz</p>
        </div>
      </div>
    </div>
  );
}