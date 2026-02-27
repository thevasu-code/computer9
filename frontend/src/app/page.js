

import { ShoppingCart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-zinc-100 to-primary/20 dark:from-zinc-900 dark:via-black dark:to-primary/10 font-sans">
      <div className="bg-white/90 dark:bg-zinc-900/90 rounded-2xl shadow-2xl p-12 max-w-xl w-full text-center border border-primary/10 relative overflow-hidden">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary shadow-lg animate-bounce-slow">
            <ShoppingCart className="w-12 h-12" />
          </span>
        </div>
        <h1 className="text-5xl font-extrabold text-primary mb-4 drop-shadow-lg tracking-tight">Coming Soon</h1>
        <p className="text-lg text-zinc-700 dark:text-zinc-200 mb-4 font-medium">A new era of computer & hardware shopping is on the way.</p>
        <div className="mb-6">
          <span className="inline-block bg-primary/10 text-primary font-bold px-4 py-2 rounded-full text-lg shadow-sm">
            Stay connected: <a href="tel:9751978686" className="hover:underline">9751978686</a>
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-zinc-500 dark:text-zinc-400 text-sm">Follow us for updates and exclusive launch offers!</span>
          <button className="mt-2 px-6 py-2 bg-primary text-white rounded-full font-semibold shadow hover:bg-primary/90 transition-colors">Notify Me</button>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl opacity-40 pointer-events-none" />
      </div>
    </div>
  );
}
