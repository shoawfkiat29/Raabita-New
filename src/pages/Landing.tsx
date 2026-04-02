import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, PhoneCall, QrCode, Car, ArrowRight, MessageCircle, Lock, Zap, CheckCircle2, Settings, Star, Users, Globe } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function Landing() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Premium Header */}
      <header className="fixed top-0 w-full bg-zinc-950/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white flex items-center gap-3">
              Raabita <span className="text-xl md:text-2xl font-urdu opacity-60 font-medium">رابطہ</span>
            </span>
          </motion.div>
          <motion.nav
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-6"
          >
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
              <Link to="/admin" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs">
                <Settings className="w-3.5 h-3.5" /> Admin Panel
              </Link>
            </div>
            <Link to="/checkout">
              <Button className="rounded-full bg-white text-zinc-950 hover:bg-zinc-200 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] font-medium px-6">
                Get Your QR
              </Button>
            </Link>
          </motion.nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section ref={targetRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920" 
              alt="Luxury Car Background" 
              className="w-full h-full object-cover opacity-30 grayscale"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-zinc-950" />
          </div>

          {/* Abstract Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
          
          <div className="relative max-w-7xl mx-auto px-6 w-full z-10">
            <motion.div
              style={{ opacity, scale }}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-4xl flex flex-col items-start text-left"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 mb-8 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Secure Masked Calling Now Live in India
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">
                <span className="block text-2xl md:text-3xl font-urdu text-indigo-400/60 mb-4 tracking-normal">رابطہ</span>
                Your Vehicle, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">
                  Smartly Connected.
                </span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl leading-relaxed font-light">
                The premium QR code solution that lets anyone contact you about your parked vehicle—without ever revealing your personal phone number.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                <Link to="/checkout" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-16 px-10 text-lg rounded-full bg-white text-zinc-950 hover:bg-zinc-200 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] font-bold group">
                    Secure Yours for ₹249
                    <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div className="flex items-center gap-4 text-zinc-500 font-medium">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm">5,000+ owners protected</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll to explore</span>
            <div className="w-px h-12 bg-gradient-to-b from-zinc-500 to-transparent" />
          </motion.div>
        </section>

        {/* Trusted By Section */}
        <section className="py-20 bg-zinc-950 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-zinc-500 text-sm font-bold uppercase tracking-[0.2em] mb-12">Trusted by leading automotive communities</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 text-2xl font-bold"><Shield className="w-8 h-8" /> AutoGuard</div>
              <div className="flex items-center gap-2 text-2xl font-bold"><Car className="w-8 h-8" /> DriveSafe</div>
              <div className="flex items-center gap-2 text-2xl font-bold"><Globe className="w-8 h-8" /> SmartCity</div>
              <div className="flex items-center gap-2 text-2xl font-bold"><Users className="w-8 h-8" /> CommuNet</div>
            </div>
          </div>
        </section>

        {/* Product Showcase */}
        <section id="how-it-works" className="py-32 bg-zinc-950 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-4 py-1.5 text-sm rounded-full">How it works</Badge>
                <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight">Three steps to total peace of mind.</h2>
                
                <div className="space-y-12 mt-12">
                  {[
                    { step: "01", title: "Apply the Decal", desc: "Stick our premium, weatherproof QR decal on your vehicle's windshield. It's designed to last for years.", icon: <Car className="w-6 h-6" /> },
                    { step: "02", title: "Scan & Register", desc: "Scan the QR once to link your vehicle number and phone. Your data is encrypted and never shared.", icon: <QrCode className="w-6 h-6" /> },
                    { step: "03", title: "Stay Connected", desc: "If someone needs you to move your car, they scan the QR and call you via our secure bridge.", icon: <PhoneCall className="w-6 h-6" /> },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-6 group">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-3">
                          <span className="text-zinc-600 font-mono text-sm">{item.step}</span>
                          {item.title}
                        </h3>
                        <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
                <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group">
                  <img 
                    src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800" 
                    alt="Car Windshield QR" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-zinc-950" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Live Demo</p>
                        <p className="text-sm font-medium">Scan to contact owner securely</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Grid with Images */}
        <section className="py-32 bg-zinc-950 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden border border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800" 
                  alt="Masked Calling" 
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 p-12 flex flex-col justify-end">
                  <PhoneCall className="w-10 h-10 text-indigo-400 mb-6" />
                  <h3 className="text-3xl font-bold mb-4">Privacy-First Calling</h3>
                  <p className="text-zinc-400">Connect with strangers without revealing your personal digits. Our secure bridge handles everything.</p>
                </div>
              </div>
              <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden border border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1512428559083-a40ce12b26f0?auto=format&fit=crop&q=80&w=800" 
                  alt="WhatsApp Integration" 
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 p-12 flex flex-col justify-end">
                  <MessageCircle className="w-10 h-10 text-green-400 mb-6" />
                  <h3 className="text-3xl font-bold mb-4">WhatsApp Ready</h3>
                  <p className="text-zinc-400">Instant messaging integration for quick, non-intrusive communication regarding your vehicle.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-32 relative z-10 bg-zinc-950 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">Engineered for Privacy.</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Every feature is designed to keep you connected while maintaining absolute control over your personal information.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 - Large */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="md:col-span-2 p-12 rounded-[2.5rem] bg-zinc-900 border border-white/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-colors duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/30">
                    <PhoneCall className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">Secure Masked Calling</h3>
                  <p className="text-zinc-400 text-xl max-w-md leading-relaxed">
                    Powered by Exotel. When someone scans your QR, they can call you directly. Our system bridges the call, ensuring neither party sees the other's real phone number.
                  </p>
                </div>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-12 rounded-[2.5rem] bg-zinc-900 border border-white/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] group-hover:bg-green-500/20 transition-colors duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-8 border border-green-500/30">
                    <MessageCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-3xl font-display font-bold mb-6">WhatsApp Ready</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed">
                    Prefer text? Scanners can instantly open a WhatsApp chat with pre-filled messages regarding your vehicle.
                  </p>
                </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-12 rounded-[2.5rem] bg-zinc-900 border border-white/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-500/20 transition-colors duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-8 border border-amber-500/30">
                    <Zap className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-3xl font-display font-bold mb-6">Instant Setup</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed">
                    No apps to download. Stick the premium decal on your windshield, scan it once to register, and you're protected.
                  </p>
                </div>
              </motion.div>

              {/* Feature 4 - Large */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="md:col-span-2 p-12 rounded-[2.5rem] bg-zinc-900 border border-white/5 relative overflow-hidden group flex flex-col md:flex-row items-start md:items-center gap-12 justify-between"
              >
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-colors duration-500" />
                <div className="relative z-10 max-w-md">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/30">
                    <Shield className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">Weatherproof Decal</h3>
                  <p className="text-zinc-400 text-xl leading-relaxed">
                    Crafted from premium UV-resistant materials. Our QR codes survive the harsh Indian summers and heavy monsoons without fading.
                  </p>
                </div>
                <div className="relative z-10 w-full md:w-auto flex-shrink-0">
                  <div className="w-64 h-64 bg-zinc-950 rounded-[2rem] border border-white/10 flex items-center justify-center shadow-2xl p-6 transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <QrCode className="w-full h-full text-white" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-32 bg-zinc-950 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">What owners are saying.</h2>
              <div className="flex items-center justify-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                <span className="ml-2 text-zinc-400 font-medium">4.9/5 from 2,000+ reviews</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Rahul Sharma", role: "BMW X5 Owner", text: "Raabita saved me from a towing situation last week. Someone scanned the QR and I moved my car in 2 minutes. Absolute lifesaver!", img: "https://i.pravatar.cc/150?img=11" },
                { name: "Priya Patel", role: "Audi A4 Owner", text: "I love that I don't have to leave my number on the dashboard anymore. The masked calling works perfectly and feels very secure.", img: "https://i.pravatar.cc/150?img=32" },
                { name: "Amit Verma", role: "Fortuner Owner", text: "The decal quality is top-notch. It's been through heavy rain and direct sun for months and still looks brand new. Highly recommended.", img: "https://i.pravatar.cc/150?img=59" },
              ].map((t, i) => (
                <div key={i} className="p-8 rounded-3xl bg-zinc-900 border border-white/5 hover:border-indigo-500/30 transition-all duration-300">
                  <p className="text-zinc-300 italic mb-8">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full grayscale" />
                    <div>
                      <h4 className="font-bold text-white">{t.name}</h4>
                      <p className="text-xs text-zinc-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="p-16 md:p-24 rounded-[4rem] bg-gradient-to-b from-indigo-900/40 to-zinc-900 border border-indigo-500/20 text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
              
              <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 tracking-tight relative z-10">Ready to upgrade your vehicle?</h2>
              <p className="text-indigo-200/80 text-xl mb-12 max-w-2xl mx-auto relative z-10">
                Join thousands of smart vehicle owners. Order your Raabita Smart QR today and enjoy lifetime validity with no subscription fees.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
                <Link to="/checkout" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-20 px-12 text-xl rounded-full bg-white text-zinc-950 hover:bg-zinc-200 hover:scale-105 transition-all duration-300 shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)] font-bold">
                    Get Raabita for ₹249
                  </Button>
                </Link>
                <div className="flex flex-col items-start gap-3 text-base text-zinc-400">
                  <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-400"/> Free Shipping</div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-400"/> Lifetime Validity</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-4">
                <QrCode className="w-10 h-10 text-indigo-500" />
                <span className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white flex items-center gap-4">
                  Raabita <span className="text-2xl md:text-3xl font-urdu opacity-50">رابطہ</span>
                </span>
              </div>
              <p className="text-zinc-500 max-w-sm text-lg">
                The next generation of vehicle connectivity and privacy. Protecting owners across India.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-zinc-500">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><Link to="/checkout" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Management</h4>
              <ul className="space-y-4 text-zinc-500">
                <li>
                  <Link to="/admin" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-500 text-white hover:bg-indigo-600 transition-all font-bold shadow-lg shadow-indigo-500/20">
                    <Settings className="w-5 h-5" /> Admin Dashboard
                  </Link>
                </li>
                <li><Link to="/checkout" className="hover:text-white transition-colors">Order Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-zinc-600 text-sm">© {new Date().getFullYear()} Raabita Technologies. All rights reserved.</p>
            <div className="flex gap-8 text-zinc-600 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
