import { Link } from "wouter";

export default function AppFooter() {
  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Link href="/">
              <div className="flex items-center gap-3 mb-4 group cursor-pointer">
                <img 
                  src="https://bazptglwzqstppwlvmvb.supabase.co/storage/v1/object/public/assets/protokol57-logo.svg" 
                  alt="Protokol 57 Logo" 
                  className="h-10 w-auto transition-transform group-hover:scale-105"
                />
                <div className="flex flex-col">
                  <h2 className="text-2xl font-black text-foreground leading-tight">Protokol 57</h2>
                  <span className="text-sm text-muted-foreground leading-tight">AI Protokollarini O'rganish</span>
                </div>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              ChatGPT va boshqa AI vositalari bilan professional darajada ishlashni o'rganish uchun 
              57 ta amaliy protokol va strategiyalar to'plami.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">O'rganish</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/onboarding">
                  <span className="text-muted-foreground hover:text-accent transition-colors cursor-pointer">
                    Boshlang'ich qo'llanma
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <span className="text-muted-foreground hover:text-accent transition-colors cursor-pointer">
                    57 Protokol
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/admin">
                  <span className="text-muted-foreground hover:text-accent transition-colors cursor-pointer">
                    Admin Panel
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Bog'lanish</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://t.me/birfoizbilim" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Telegram
                </a>
              </li>
              <li>
                <span className="text-muted-foreground">
                  Muallif: Xurshid Mo'roziqov
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Protokol 57. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="text-muted-foreground text-sm">
              AI bilan professional ishlash platformasi
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}