import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  Video,
  Shield,
  Zap,
  Globe,
  Lock,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Phone,
  Search,
  Send,
  Menu,
  X,
  Check,
  Users,
  ArrowRight,
  Eye,
  BarChart3,
} from "lucide-react";

function useInView(ref, opts = {}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15, ...opts }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

function SectionHeading({ eyebrow, title, description, light }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className={`mb-3 text-sm font-semibold tracking-widest uppercase ${light ? "text-violet-400" : "text-violet-400"}`}>
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-lg text-zinc-400 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

function FloatingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Security", href: "#security" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-zinc-950/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <MessageCircle className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-white">Connectify</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-[13px] font-medium text-zinc-300 transition-colors hover:text-white"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-violet-600 px-4.5 py-2 text-[13px] font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:bg-violet-500 hover:shadow-violet-600/30"
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-1 border-t border-white/[0.06] bg-zinc-950/95 px-5 pb-4 pt-3 backdrop-blur-2xl">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <div className="my-2 border-t border-white/[0.06]" />
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            Log in
          </Link>
          <Link
            to="/register"
            onClick={() => setMobileOpen(false)}
            className="block rounded-lg bg-violet-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroMockup() {
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    { from: "other", text: "Hey! Are you free for a quick call?" },
    { from: "me", text: "Sure, give me 2 minutes!" },
    { from: "other", text: "Perfect, I'll start a video call" },
  ];

  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % messages.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative mx-auto mt-16 max-w-4xl px-4 sm:mt-20">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-violet-600/10 to-transparent blur-2xl sm:-inset-8" />

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-2 border-b border-white/[0.06] bg-zinc-900/80 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-1 text-[11px] text-zinc-500">
            <Lock className="h-3 w-3" />
            connectify.app
          </div>
        </div>

        <div className="flex min-h-[320px] sm:min-h-[400px]">
          <div className="hidden w-56 border-r border-white/[0.06] bg-zinc-900/60 p-3 sm:block">
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2">
              <Search className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-500">Search...</span>
            </div>
            {["Sarah Chen", "Alex Rivera", "Maya Patel"].map((name, i) => (
              <div
                key={name}
                className={`mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors ${
                  i === 0 ? "bg-violet-600/10" : "hover:bg-white/[0.03]"
                }`}
              >
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-[11px] font-semibold text-white">
                    {name[0]}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-900 bg-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-zinc-200">{name}</p>
                  <p className="truncate text-[10px] text-zinc-500">Online</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5 sm:px-5">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-semibold text-white">
                    S
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-900 bg-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">Sarah Chen</p>
                  <p className="text-[10px] text-emerald-400">Online</p>
                </div>
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition-colors hover:bg-emerald-500/20">
                <Video className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 p-4 sm:p-5">
              {messages.slice(0, msgIdx + 1).map((m, i) => (
                <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm ${
                      m.from === "me"
                        ? "rounded-br-md bg-violet-600 text-white"
                        : "rounded-bl-md bg-zinc-800 text-zinc-200"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {msgIdx < 2 && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-zinc-800 px-3.5 py-2.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-typing-dot-1" />
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-typing-dot-2" />
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-typing-dot-3" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.06] px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-xl bg-white/[0.04] px-3.5 py-2 text-xs text-zinc-500">
                  Type a message...
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
                  <Send className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-2 top-12 sm:right-4 sm:top-16">
        <div className="animate-notification-pop rounded-xl border border-white/[0.08] bg-zinc-900/95 px-3 py-2.5 shadow-xl backdrop-blur-sm sm:px-4 sm:py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15">
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-zinc-100">Incoming Call</p>
              <p className="text-[10px] text-zinc-500">Alex Rivera</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -left-2 bottom-16 sm:left-4 sm:bottom-20">
        <div className="animate-float-delayed rounded-xl border border-white/[0.08] bg-zinc-900/95 px-3 py-2.5 shadow-xl backdrop-blur-sm sm:px-4 sm:py-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-[11px] font-semibold text-white">
                M
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-900 bg-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-zinc-100">New Message</p>
              <p className="text-[10px] text-zinc-500">Maya Patel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-1 bottom-8 hidden sm:block">
        <div className="animate-float rounded-xl border border-white/[0.08] bg-zinc-900/95 px-3 py-2 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-medium text-zinc-400">3 online</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoCallMockup() {
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900 shadow-2xl shadow-black/50">
        <div className="relative aspect-video bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-3xl font-bold text-white sm:h-24 sm:w-24 sm:text-4xl">
                S
              </div>
              <p className="text-sm font-medium text-zinc-200 sm:text-base">Sarah Chen</p>
              <div className="mt-1 flex items-center justify-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <p className="text-[11px] text-emerald-400">{fmt(elapsed)}</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 overflow-hidden rounded-xl border border-white/[0.1] shadow-lg sm:bottom-6 sm:right-6 sm:h-28 sm:w-40">
            {camOff ? (
              <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                <VideoOff className="h-5 w-5 text-zinc-500" />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-600 text-sm font-bold text-white">
                  Y
                </div>
              </div>
            )}
          </div>

          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <div className="flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-medium text-zinc-300">Connected</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 bg-zinc-900/80 px-4 py-4 backdrop-blur-sm sm:gap-4 sm:py-5">
          <button
            onClick={() => setMuted(!muted)}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-all sm:h-12 sm:w-12 ${
              muted
                ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                : "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]"
            }`}
          >
            {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setCamOff(!camOff)}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-all sm:h-12 sm:w-12 ${
              camOff
                ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                : "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]"
            }`}
          >
            {camOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-400 sm:h-12 sm:w-12">
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const heroRef = useRef(null);
  const featRef = useRef(null);
  const stepsRef = useRef(null);
  const vidRef = useRef(null);
  const secRef = useRef(null);
  const ctaRef = useRef(null);

  const heroVis = useInView(heroRef);
  const featVis = useInView(featRef);
  const stepsVis = useInView(stepsRef);
  const vidVis = useInView(vidRef);
  const secVis = useInView(secRef);
  const ctaVis = useInView(ctaRef);

  const features = [
    { icon: MessageCircle, title: "Real-time messaging", desc: "Send and receive messages instantly with typing indicators, read receipts, and live presence.", color: "violet" },
    { icon: Video, title: "Crystal-clear video calls", desc: "Connect face-to-face with smooth, browser-based one-to-one video calls powered by WebRTC.", color: "indigo" },
    { icon: Users, title: "Online presence", desc: "See when people are available and ready to chat with real-time online status indicators.", color: "emerald" },
    { icon: Shield, title: "Private conversations", desc: "Keep conversations protected with secure authentication, authorization, and encrypted transport.", color: "amber" },
    { icon: Zap, title: "Simple experience", desc: "No complicated setup. Create an account in seconds and start connecting with people instantly.", color: "cyan" },
    { icon: Globe, title: "Works everywhere", desc: "Use the platform on any device with a modern browser. Desktop, tablet, or mobile — it just works.", color: "rose" },
  ];

  const colorMap = {
    violet: { bg: "bg-violet-500/10", text: "text-violet-400", hover: "group-hover:bg-violet-500/15" },
    indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", hover: "group-hover:bg-indigo-500/15" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", hover: "group-hover:bg-emerald-500/15" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", hover: "group-hover:bg-amber-500/15" },
    cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", hover: "group-hover:bg-cyan-500/15" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-400", hover: "group-hover:bg-rose-500/15" },
  };

  const steps = [
    { num: "01", title: "Create your account", desc: "Register securely in seconds. No credit card required." },
    { num: "02", title: "Find someone", desc: "Search for users and start a conversation." },
    { num: "03", title: "Chat or call", desc: "Send messages or start a one-to-one video call." },
  ];

  const stats = [
    { value: "10K+", label: "Conversations" },
    { value: "5K+", label: "Active users" },
    { value: "99.9%", label: "Uptime" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white antialiased">
      <FloatingNavbar />

      <section ref={heroRef} className="relative overflow-hidden pt-28 pb-8 sm:pt-36 sm:pb-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-200px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/[0.07] blur-[140px]" />
          <div className="absolute bottom-[-100px] right-[-100px] h-[400px] w-[400px] rounded-full bg-indigo-600/[0.05] blur-[120px]" />
          <div className="absolute top-[300px] left-[-100px] h-[300px] w-[300px] rounded-full bg-violet-500/[0.04] blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_60%)]" />
        </div>

        <div className={`mx-auto max-w-4xl px-5 text-center ${heroVis ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-[13px] font-medium text-zinc-400 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Private &middot; Real-time &middot; Simple
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-[82px]">
            Connect.{" "}
            <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
              Chat.
            </span>{" "}
            Meet.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-400 sm:text-xl text-balance">
            A simple and secure place to chat with people and connect through real-time video calls.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/register"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-600/20 transition-all hover:bg-violet-500 hover:shadow-violet-600/30 hover:scale-[1.02] sm:w-auto"
            >
              Start Connecting
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-7 py-3.5 text-sm font-semibold text-zinc-300 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:text-white sm:w-auto"
            >
              See How It Works
            </a>
          </div>
        </div>

        <HeroMockup />
      </section>

      <section className="border-y border-white/[0.04] bg-white/[0.01] py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-5">
          <p className="mb-8 text-center text-sm font-medium text-zinc-500">
            Built for meaningful conversations
          </p>
          <div className="grid grid-cols-3 gap-6 sm:gap-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-zinc-500 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" ref={featRef} className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5">
          <div className={`mb-16 ${featVis ? "animate-fade-in-up" : "opacity-0"}`}>
            <SectionHeading
              eyebrow="Features"
              title="Everything you need to stay connected"
              description="Powerful, built-in features that make communication seamless and natural."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const c = colorMap[f.color];
              return (
                <div
                  key={f.title}
                  className={`group relative rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.03] hover:shadow-lg hover:shadow-black/20 ${
                    featVis ? "animate-fade-in-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className={`mb-5 inline-flex items-center justify-center rounded-xl ${c.bg} ${c.hover} p-2.5 transition-colors`}>
                    <f.icon className={`h-5 w-5 ${c.text}`} />
                  </div>
                  <h3 className="mb-2 text-[15px] font-semibold text-white">{f.title}</h3>
                  <p className="text-[13px] leading-relaxed text-zinc-400">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" ref={stepsRef} className="border-t border-white/[0.04] bg-white/[0.01] py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-5">
          <div className={`mb-16 ${stepsVis ? "animate-fade-in-up" : "opacity-0"}`}>
            <SectionHeading
              eyebrow="How it works"
              title="Start in three simple steps"
              description="Getting started is quick and easy."
            />
          </div>

          <div className="relative grid gap-8 sm:grid-cols-3 sm:gap-6">
            <div className="absolute left-[20%] right-[20%] top-8 hidden h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent sm:block" />

            {steps.map((s, i) => (
              <div
                key={s.num}
                className={`relative text-center ${stepsVis ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-zinc-900 text-lg font-bold text-violet-400 shadow-lg shadow-black/20">
                  {s.num}
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{s.title}</h3>
                <p className="text-[13px] leading-relaxed text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={vidRef} className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5">
          <div className={`mb-14 ${vidVis ? "animate-fade-in-up" : "opacity-0"}`}>
            <SectionHeading
              eyebrow="Video Calls"
              title="Face-to-face, wherever you are."
              description="Start a video call directly from your conversation and connect instantly through your browser."
            />
          </div>

          <div className={`${vidVis ? "animate-scale-in" : "opacity-0"}`}>
            <VideoCallMockup />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              { icon: Mic, label: "Mute & unmute" },
              { icon: Video, label: "Camera on / off" },
              { icon: PhoneOff, label: "End call" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-400"
              >
                <f.icon className="h-4 w-4 text-zinc-500" />
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" ref={secRef} className="border-t border-white/[0.04] bg-white/[0.01] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5">
          <div className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${secVis ? "animate-fade-in-up" : "opacity-0"}`}>
            <div>
              <SectionHeading
                eyebrow="Security"
                title="Your conversations matter."
                description=""
              />
              <div className="mt-6 space-y-4 text-left">
                <p className="text-[15px] leading-relaxed text-zinc-400">
                  We take security seriously. Your data is protected with industry-standard practices, and your camera and microphone are only accessed with your explicit permission.
                </p>
                <div className="space-y-3 pt-2">
                  {[
                    { icon: Lock, text: "Secure JWT authentication" },
                    { icon: Shield, text: "Protected API endpoints with authorization" },
                    { icon: Eye, text: "Camera & microphone require browser permissions" },
                    { icon: BarChart3, text: "Rate limiting and input validation" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                        <item.icon className="h-4 w-4 text-violet-400" />
                      </div>
                      <span className="text-[13px] font-medium text-zinc-300">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-8 backdrop-blur-sm">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/10">
                  <Shield className="h-8 w-8 text-violet-400" />
                </div>
                <div className="space-y-4">
                  {["Encrypted connections", "Secure token handling", "Permission-based access"].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span className="text-[13px] font-medium text-zinc-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-b from-violet-600/10 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section ref={ctaRef} className="py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-5">
          <div
            className={`relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-10 text-center sm:p-14 ${
              ctaVis ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-0 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.08] blur-[80px]" />
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
              Ready to start connecting?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] text-zinc-400">
              Create your account and start chatting with people today.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/register"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-600/20 transition-all hover:bg-violet-500 hover:scale-[1.02] sm:w-auto"
              >
                Get Started — It&apos;s Free
              </Link>
              <Link
                to="/login"
                className="flex w-full items-center justify-center rounded-xl border border-white/[0.08] px-7 py-3.5 text-sm font-semibold text-zinc-300 transition-all hover:border-white/[0.15] hover:text-white sm:w-auto"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] bg-zinc-950">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <a href="#" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                  <MessageCircle className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[17px] font-bold tracking-tight text-white">Connectify</span>
              </a>
              <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-zinc-500">
                A simple and secure platform for real-time chat and one-to-one video calls. Built for meaningful conversations.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-[13px] font-semibold text-zinc-300">Product</h4>
              <ul className="space-y-2.5">
                {["Features", "Video Calls", "Messaging", "Security"].map((l) => (
                  <li key={l}>
                    <a href="#features" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-[13px] font-semibold text-zinc-300">Company</h4>
              <ul className="space-y-2.5">
                {["About", "Contact", "Careers"].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-[13px] font-semibold text-zinc-300">Legal</h4>
              <ul className="space-y-2.5">
                {["Privacy", "Terms", "Cookie Policy"].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
            <p className="text-[12px] text-zinc-600">
              &copy; {new Date().getFullYear()} Connectify. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {["Twitter", "GitHub", "LinkedIn"].map((s) => (
                <a key={s} href="#" className="text-[12px] text-zinc-600 transition-colors hover:text-zinc-400">
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
