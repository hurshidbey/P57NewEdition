import React from 'react'
import { Link } from 'wouter'
import { Button } from '@/components/ui/button'
import { HeroHeader } from "@/components/header"
import PromptComparison from '@/components/prompt-comparison'

export default function HeroSection() {
    return (
        <div className="min-h-screen bg-black text-white">
            <HeroHeader />
            <main>
                <section className="pt-32 pb-16">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center">
                            {/* Headline */}
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8" style={{ letterSpacing: '0.0em' }}>
                                Sun'iy Intellektdan professional foydalanishni o'rganing. Hech nima bilmasangiz ham.
                            </h1>
                            
                            {/* Sub-headline */}
                            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
                                O'zbek tilida birinchi va yagona AI prompting kursi.
                            </p>

                            {/* Prompt Comparison Component */}
                            <PromptComparison />

                            {/* CTA Button */}
                            <Button
                                asChild
                                size="lg"
                                className="bg-[#FF4F30] hover:bg-[#E63E20] text-white font-bold px-12 py-6 text-xl rounded-xl">
                                <Link href="/auth">
                                    HOZIROQ BOSHLASH
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}