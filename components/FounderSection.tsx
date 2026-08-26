'use client';
import Image from 'next/image';

export default function FounderSection() {
  return (
    <section style={{ padding: '0 24px 120px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="card p-8 sm:p-12 relative overflow-hidden lift-on-hover" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px' }}>
          
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,115,0,0.05) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          
          <div className="flex flex-col md:flex-row gap-10 items-center">
            
            {/* Photo */}
            <div className="flex-shrink-0 relative">
              <div className="w-40 h-40 rounded-full overflow-hidden relative z-10" style={{ border: '2px solid rgba(255,255,255,0.1)' }}>
                <Image 
                  src="/drew_headshot.jpg" 
                  alt="Drew Pilat" 
                  fill 
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="absolute inset-0 rounded-full blur-xl" style={{ background: '#ff7300', opacity: 0.15, transform: 'scale(1.1)' }} />
            </div>

            {/* Content */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,115,0,0.8)' }}>A message from the founder</p>
              <h3 className="text-[24px] font-semibold mb-4" style={{ color: 'white', letterSpacing: '-0.02em' }}>
                Why I built LavaMesh
              </h3>
              <div className="space-y-4 text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <p>
                  I got tired of paying per-seat for VPNs and wrestling with raw WireGuard configs.
                </p>
                <p>
                  I built LavaMesh to fix that. It's a control plane you can host yourself. No node limits, no telemetry, no corporate lock-in.
                </p>
                <p>
                  Just your network, on your infrastructure.
                </p>
              </div>
              
              <div className="mt-8 flex items-center gap-4">
                <div>
                  <div className="text-[14px] font-medium text-white">Drew Pilat</div>
                  <div className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Creator of LavaMesh</div>
                </div>
                <a href="https://www.linkedin.com/in/drew-pilat/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
