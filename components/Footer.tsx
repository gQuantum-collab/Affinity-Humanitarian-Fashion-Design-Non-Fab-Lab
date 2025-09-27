export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 text-sm text-white/60">
      <div className="container flex flex-col items-start justify-between gap-4 py-8 sm:flex-row">
        <p>© {new Date().getFullYear()} Affinity — Fashion for Humanity.</p>
        <p>Built on Next.js • Deployed on Vercel</p>
      </div>
    
<div className="mt-6 text-xs whitespace-pre-wrap font-mono">email: jeromeizhome@gmail.com  |  phone: +1-213-755-7164</div>
</footer>
  )
}
