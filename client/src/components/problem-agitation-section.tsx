import { AlertCircle, RefreshCw, HelpCircle } from 'lucide-react'
import React from 'react'

export default function ProblemAgitationSection() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">ChatGPT sizga umumiy javoblar berayaptimi?</h2>
                <div className="relative">
                    <div className="relative z-10 space-y-4 md:w-1/2">
                        <p className="text-body">
                            Bir xil savolga har safar boshqacha javob olayapsizmi? <span className="text-title font-medium">AI dan professional natijalar olish sirini bilmayapsizmi?</span>
                        </p>
                        <p>Ko'pchilik ChatGPT dan foydalanayotganda bir xil muammolarga duch kelishadi va bu sizning ham muammoingiz bo'lishi mumkin.</p>

                        <div className="grid grid-cols-2 gap-3 pt-6 sm:gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="size-4" />
                                    <h3 className="text-sm font-medium">Marketing strategiyasi</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">Marketing strategiyasi so'rasangiz - 2 sahifa umumiy matn beradi</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="size-4" />
                                    <h3 className="text-sm font-medium">Biznes rejasi</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">Biznes rejasi kerak bo'lsa - "Shablon javoblar" beradi</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <HelpCircle className="size-4" />
                                    <h3 className="text-sm font-medium">Kreativ g'oyalar</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">Kreativ g'oyalar so'rasangiz - internetdagi kopiyalar</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 h-fit md:absolute md:-inset-y-12 md:inset-x-0 md:mt-0">
                        <div aria-hidden className="bg-gradient-to-l z-1 to-background absolute inset-0 hidden from-transparent to-55% md:block"></div>
                        <div className="border-border/50 relative rounded-2xl border border-dotted p-2">
                            <div className="relative bg-black rounded-[12px] p-8 h-[400px] overflow-hidden">
                                {/* Chart Header */}
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                    <div className="text-xs text-gray-400">View Code</div>
                                    <div className="text-xs text-gray-400 border border-gray-600 rounded px-2 py-1">Last 3 months</div>
                                </div>
                                
                                {/* Animated Chart */}
                                <div className="absolute bottom-8 left-8 right-8">
                                    <svg className="w-full h-48" viewBox="0 0 400 120">
                                        {/* Grid lines */}
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#1e40af" />
                                                <stop offset="50%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#06b6d4" />
                                            </linearGradient>
                                        </defs>
                                        
                                        {/* Animated line chart */}
                                        <path
                                            d="M20,100 L60,85 L100,70 L140,60 L180,45 L220,35 L260,25 L300,15 L340,10 L380,5"
                                            fill="none"
                                            stroke="url(#gradient)"
                                            strokeWidth="2"
                                            className="animate-pulse"
                                        />
                                        
                                        {/* Data points */}
                                        {[20,60,100,140,180,220,260,300,340,380].map((x, i) => {
                                            const y = 100 - (i * 10);
                                            return (
                                                <circle
                                                    key={i}
                                                    cx={x}
                                                    cy={y}
                                                    r="3"
                                                    fill="url(#gradient)"
                                                    className="animate-pulse"
                                                    style={{ animationDelay: `${i * 0.1}s` }}
                                                />
                                            );
                                        })}
                                    </svg>
                                    
                                    {/* Chart labels */}
                                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                                        <span>Apr 3</span>
                                        <span>Apr 10</span>
                                        <span>Apr 17</span>
                                        <span>Apr 24</span>
                                        <span>May 1</span>
                                        <span>May 8</span>
                                        <span>May 15</span>
                                        <span>May 22</span>
                                        <span>May 29</span>
                                        <span>Jun 5</span>
                                    </div>
                                </div>
                                
                                {/* Chart legend */}
                                <div className="absolute bottom-2 left-8 text-xs text-gray-500">
                                    Savollar sifati
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}