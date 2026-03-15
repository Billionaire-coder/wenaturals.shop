import Link from "next/link";
import { ArrowLeft, ShoppingBag, Home } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-mesh flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />

            <div className="relative z-10 max-w-2xl w-full text-center">
                <div className="mb-8 overflow-hidden inline-block">
                    <span className="text-[12vw] md:text-[8rem] font-black tracking-tighter text-gradient leading-none block">
                        404
                    </span>
                </div>

                <h1 className="text-2xl md:text-4xl font-bold mb-6 tracking-tight text-white">
                    This essence has dissipated.
                </h1>

                <p className="text-zinc-400 text-lg mb-12 max-w-md mx-auto">
                    The path you followed seems to have vanished into the mist. Let us guide you back to clarity.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/shop" className="group">
                        <GlassCard className="p-6 h-full flex flex-col items-center justify-center border-white/5 hover:border-blue-500/30 transition-all duration-500 bg-white/5">
                            <ShoppingBag className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-white mb-2">Explore Shop</h2>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Natural Alchemical Goods</p>
                        </GlassCard>
                    </Link>

                    <Link href="/" className="group">
                        <GlassCard className="p-6 h-full flex flex-col items-center justify-center border-white/5 hover:border-emerald-500/30 transition-all duration-500 bg-white/5">
                            <Home className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-white mb-2">Return Home</h2>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Back to the Beginning</p>
                        </GlassCard>
                    </Link>
                </div>

                <div className="mt-12">
                    <Link
                        href="javascript:history.back()"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retrograde Navigation
                    </Link>
                </div>
            </div>
        </main>
    );
}
