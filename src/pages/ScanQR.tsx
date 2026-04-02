import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PhoneCall, Car, Loader2, MessageCircle, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

export default function ScanQR() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const [qrStatus, setQrStatus] = useState<any>(null);
  const [error, setError] = useState("");
  const [callSuccess, setCallSuccess] = useState("");
  const [callerPhone, setCallerPhone] = useState("");

  useEffect(() => {
    const checkQR = async () => {
      try {
        const res = await fetch(`/api/qr/${id}`);
        if (!res.ok) throw new Error("QR code not found");
        const data = await res.json();
        setQrStatus(data);
      } catch (err: any) {
        setError(err.message || "Failed to load QR code");
      } finally {
        setLoading(false);
      }
    };
    checkQR();
  }, [id]);

  const handleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callerPhone) {
      setError("Please enter your phone number to initiate the call.");
      return;
    }
    
    setCalling(true);
    setError("");
    
    try {
      const res = await fetch(`/api/qr/${id}/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callerPhone }),
      });
      
      const data = await res.json();
      if (data.success) {
        setCallSuccess(data.message);
      } else {
        setError(data.error || "Failed to initiate call");
      }
    } catch (err) {
      setError("An error occurred while trying to connect the call.");
    } finally {
      setCalling(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (error && !qrStatus) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center bg-slate-800 border-slate-700 text-white">
          <CardContent className="pt-6">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <div className="text-red-400 font-medium">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (qrStatus && !qrStatus.registered) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center bg-slate-800 border-slate-700 text-white">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Unregistered QR Code</h2>
            <p className="text-sm text-slate-400">If you are the owner, please log in to your dashboard to register this vehicle.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format phone number for WhatsApp (remove +, spaces, etc)
  const waNumber = qrStatus.ownerPhone?.replace(/\D/g, '') || "";
  const waLink = `https://wa.me/${waNumber}?text=Hi,%20I%20am%20standing%20near%20your%20vehicle%20(${qrStatus.vehicleNumber}).%20It%20needs%20your%20attention.`;

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans selection:bg-blue-500/30">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="bg-slate-800 border-slate-700 shadow-2xl overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl border-4 border-slate-800 flex items-center justify-center shadow-xl">
                <Car className="w-10 h-10 text-blue-400" />
              </div>
            </div>
          </div>
          
          <CardHeader className="text-center pt-14 pb-4">
            <CardTitle className="text-3xl font-black text-white tracking-tight">{qrStatus.vehicleNumber}</CardTitle>
            <CardDescription className="text-slate-400 text-base mt-1">Vehicle Owner: <span className="text-slate-200 font-medium">{qrStatus.ownerName}</span></CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 px-6 pb-8">
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 text-center space-y-2">
              <p className="text-sm text-slate-300">
                This vehicle is protected by Raabita. You can contact the owner securely without revealing your number.
              </p>
              <p className="text-sm font-urdu text-blue-400/80" dir="rtl">
                یہ گاڑی رابطہ (Raabita) کے ذریعے محفوظ ہے۔ آپ مالک سے محفوظ طریقے سے رابطہ کر سکتے ہیں۔
              </p>
            </div>

            {error && <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center">{error}</div>}

            <div className="space-y-3">
              {callSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-center p-4 bg-green-500/10 rounded-2xl border border-green-500/20"
                >
                  <PhoneCall className="w-8 h-8 text-green-400 mx-auto mb-2 animate-pulse" />
                  <h3 className="font-semibold text-green-400 mb-1">Connecting...</h3>
                  <p className="text-sm text-green-300/80">{callSuccess}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleCall} className="space-y-3">
                  <div className="space-y-2">
                    <Input 
                      type="tel" 
                      required 
                      placeholder="Enter your mobile number" 
                      value={callerPhone}
                      onChange={(e) => setCallerPhone(e.target.value)}
                      className="h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                    />
                    <p className="text-xs text-slate-400 text-left px-1">We need your number to connect the call securely.</p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-base rounded-xl bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 shadow-lg transition-all" 
                    disabled={calling}
                  >
                    {calling ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <PhoneCall className="w-5 h-5 mr-2 text-amber-400" />
                        Secure Masked Call
                      </>
                    )}
                  </Button>
                </form>
              )}

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">Or connect directly</span>
                <div className="flex-grow border-t border-slate-700"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  asChild
                  className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg shadow-[#25D366]/20 transition-all"
                >
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp
                  </a>
                </Button>

                <Button 
                  asChild
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all"
                >
                  <a href={`tel:${qrStatus.ownerPhone}`}>
                    <PhoneCall className="w-5 h-5 mr-2" />
                    Direct Call
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
