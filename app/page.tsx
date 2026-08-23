'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame, ShieldCheck, ArrowRight, CheckCircle2,
  Zap, Copy, Check
} from 'lucide-react';

export default function LandingPage() {
  const [copied, setCopied] = useState(false);

  const copySnippet = () => {
    navigator.clipboard.writeText('curl -fsSL https://lavamesh.com/api/install.sh?token=demo_sandbox_key | sudo sh');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-slate-950 font-sans">
      <div className="bg-slate-900 border-b border-slate-800 text-[11px] py-1.5 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-orange-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              Sovereign Relays & Coordination: 100% Operational
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline">EU Bare Metal (Frankfurt & Nuremberg)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Upstream Client Canary: <strong className="text-orange-400">Verified</strong></span>
          </div>
        </div>
      </div>

      <nav className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">LavaMesh</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#pricing" className="text-xs text-slate-400 hover:text-slate-200 transition">
              Flat Pricing
            </Link>
            <Link
              href="#sandbox"
              className="px-3.5 py-1.5 rounded-lg bg-orange-500 text-xs font-bold text-slate-950 hover:bg-orange-400 transition flex items-center gap-1"
            >
              Instant Sandbox <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-14 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
          <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-bold text-[10px] uppercase">
            Zero-Trust Mesh
          </span>
          Flat-Rate Control Plane for Multi-Cloud GPU Clusters & Sovereign Fleets
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          The WireGuard Mesh UX You Love. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200">
            Zero Per-Seat Fees on Headless Servers.
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Stop paying $18/seat to connect headless GPU nodes across RunPod, Lambda Labs, Hetzner, and AWS. Get managed Headscale coordination with flat capacity pricing and zero US cloud telemetry.
        </p>

        <div className="max-w-2xl mx-auto pt-4 text-left">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span>Join any GPU box, VM, or container in &lt;10s</span>
              </span>
              <span className="text-[11px] text-orange-400 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" /> No Credit Card Required
              </span>
            </div>
            <div className="p-4 flex items-center justify-between gap-4 bg-slate-950/70">
              <pre className="text-xs font-mono text-orange-300 overflow-x-auto select-all">
                curl -fsSL https://lavamesh.com/api/install.sh?token=demo_sandbox_key | sudo sh
              </pre>
              <button
                onClick={copySnippet}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-orange-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-4xl mx-auto px-6 py-12 border-t border-slate-900">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl font-bold text-white">Flat Capacity Pricing</h2>
          <p className="text-xs text-slate-400">No per-user penalties. No bandwidth surcharges.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-bold text-white">Starter Cluster</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400">50 Nodes</span>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">$49</span>
                <span className="text-slate-400 text-xs">/ month flat</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" /> Up to 50 active connected nodes & GPU boxes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" /> Frankfurt EU Bare Metal Control Plane
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" /> Automated Ephemeral Spot Node Cleanup
                </li>
              </ul>
            </div>
            <Link
              href="#sandbox"
              className="mt-8 block text-center py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Start 30-Day Free Pilot
            </Link>
          </div>

          <div className="bg-slate-900 border-2 border-orange-500/60 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-orange-950/20">
            <div className="absolute -top-3 right-6 bg-orange-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-bold text-white">Production Fleet</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400">300 Nodes</span>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">$199</span>
                <span className="text-slate-400 text-xs">/ month flat</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" /> Up to 300 connected nodes across any cloud
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" /> Dedicated Frankfurt & Nuremberg DERP Relays
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" /> Granular Tag ACLs & Zero-Trust Policies
                </li>
              </ul>
            </div>
            <Link
              href="#sandbox"
              className="mt-8 block text-center py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-bold transition"
            >
              Start 30-Day Free Pilot
            </Link>
          </div>
        </div>
      </section>

      <section id="sandbox" className="max-w-xl mx-auto px-6 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Deploy Your Free 30-Day Sandbox</h2>
        <p className="text-xs text-slate-400">Get an instant 50-node cluster auth key to test latency and connectivity.</p>
        <form className="flex gap-2 pt-2">
          <input
            type="email"
            required
            placeholder="eng@company.com"
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs rounded-lg transition"
          >
            Get Sandbox Key
          </button>
        </form>
      </section>
    </div>
  );
}