import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle2, Wallet, CreditCard, Smartphone, Building2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "motion/react";

export default function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderId: string; qrId: string } | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletError, setWalletError] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto" | "upi" | "bank">("upi");

  // TODO: Replace this with your actual UPI ID
  const YOUR_REAL_UPI_ID = import.meta.env.VITE_UPI_ID || "9596777782@ybl";
  const upiUri = `upi://pay?pa=${YOUR_REAL_UPI_ID}&pn=Raabita&am=249&cu=INR`;

  // Bank Details from Environment Variables
  const BANK_ACCOUNT_NAME = import.meta.env.VITE_BANK_ACCOUNT_NAME || "Raabita Technologies";
  const BANK_ACCOUNT_NUMBER = import.meta.env.VITE_BANK_ACCOUNT_NUMBER || "0000123456789";
  const BANK_IFSC = import.meta.env.VITE_BANK_IFSC || "HDFC0001234";
  const BANK_NAME = import.meta.env.VITE_BANK_NAME || "HDFC Bank";

  console.log("Bank Details Loaded:", { BANK_ACCOUNT_NAME, BANK_ACCOUNT_NUMBER, BANK_IFSC, BANK_NAME });

  const connectMetaMask = async () => {
    setWalletError("");
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setPaymentMethod("crypto");
        }
      } catch (error: any) {
        console.error("MetaMask connection error:", error);
        setWalletError(error.message || "Failed to connect to MetaMask. Please try again.");
      }
    } else {
      setWalletError("Failed to connect to MetaMask: Extension not found. Please install MetaMask.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      console.log("Submitting order with data:", { ...data, plan: "standard", paymentMethod });
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, plan: "standard", paymentMethod, walletAddress }),
      });
      
      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error("Invalid response from server");
      }

      console.log("Order response:", result);
      
      if (result.success) {
        setSuccess(result);
      } else {
        setError(result.error || "Failed to process order. Please try again.");
      }
    } catch (error: any) {
      console.error("Order failed:", error);
      setError(error.message || "A network error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const qrUrl = `${window.location.origin}/register/${success.qrId}`;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="text-center shadow-2xl border-0 overflow-hidden">
            <div className="bg-green-500 h-2 w-full"></div>
            <CardHeader className="pt-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-slate-900">Order Confirmed!</CardTitle>
              <CardDescription className="text-base text-slate-500">
                Thank you for purchasing Raabita QR. <br />
                <span className="text-sm font-urdu mt-1 block">رابطہ کیو آر خریدنے کا شکریہ۔</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-600">
                  Order ID: <span className="font-mono font-bold text-slate-900">{success.orderId}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">We will ship your physical QR code sticker within 24 hours.</p>
              </div>

              {paymentMethod === "bank" && (
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 text-left space-y-3">
                  <h4 className="font-bold text-amber-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Complete Your Payment
                  </h4>
                  <p className="text-sm text-amber-800">Please transfer <strong>Rs 249</strong> to the following account to activate your order:</p>
                  <div className="space-y-2 pt-2 border-t border-amber-200">
                    <BankDetailRow label="Account Name" value={BANK_ACCOUNT_NAME} />
                    <BankDetailRow label="Account Number" value={BANK_ACCOUNT_NUMBER} />
                    <BankDetailRow label="IFSC Code" value={BANK_IFSC} />
                    <BankDetailRow label="Bank Name" value={BANK_NAME} />
                  </div>
                </div>
              )}
              
              <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 mx-auto">
                <QRCodeSVG value={qrUrl} size={160} level="H" includeMargin />
                <p className="text-xs text-slate-400 mt-4 font-medium uppercase tracking-wider">Your Unique QR Code</p>
              </div>

              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex gap-3 text-left">
                <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                <p className="text-sm text-blue-800">
                  <strong>Demo Mode:</strong> You can scan the QR code above or click the button below to simulate receiving your physical sticker.
                </p>
              </div>
            </CardContent>
            <CardFooter className="pb-8 px-8">
              <Button className="w-full h-14 text-lg rounded-xl shadow-lg shadow-blue-500/20" onClick={() => navigate(`/register/${success.qrId}`)}>
                Simulate Receiving QR Code <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Secure Checkout</h1>
            <p className="text-slate-500 mt-2">Complete your order for the Raabita Vehicle QR Code.</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-urdu text-slate-300 select-none">رابطہ</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
              <div className="bg-slate-900 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-xs">1</span>
                  Shipping Details
                </h2>
              </div>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</label>
                    <Input id="name" name="name" required placeholder="John Doe" className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number</label>
                    <Input id="phone" name="phone" type="tel" required placeholder="+91 98765 43210" className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
                  <Input id="email" name="email" type="email" required placeholder="john@example.com" className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-semibold text-slate-700">Complete Shipping Address</label>
                  <Input id="address" name="address" required placeholder="House No, Street, City, State, PIN" className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
              <div className="bg-slate-900 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-xs">2</span>
                  Payment Method
                </h2>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <PaymentButton 
                    active={paymentMethod === "upi"} 
                    onClick={() => setPaymentMethod("upi")} 
                    icon={<Smartphone className="w-5 h-5" />} 
                    label="UPI" 
                  />
                  <PaymentButton 
                    active={paymentMethod === "bank"} 
                    onClick={() => setPaymentMethod("bank")} 
                    icon={<Building2 className="w-5 h-5" />} 
                    label="Bank" 
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={paymentMethod}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {paymentMethod === "upi" && (
                      <div className="p-6 border-2 border-slate-100 rounded-xl bg-slate-50 text-center space-y-4">
                        <p className="text-sm font-medium text-slate-700">Scan with GPay, PhonePe, or Paytm</p>
                        <div className="flex justify-center bg-white p-4 rounded-xl border border-slate-200 inline-block mx-auto shadow-sm">
                          <QRCodeSVG value={upiUri} size={140} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">UPI ID</p>
                          <p className="text-sm font-mono font-medium text-slate-900 bg-white py-2 px-4 rounded-lg border border-slate-200 inline-block">{YOUR_REAL_UPI_ID}</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "bank" && (
                      <div className="p-6 border-2 border-slate-100 rounded-xl bg-slate-50 space-y-4">
                        <p className="text-sm font-medium text-slate-700 mb-4">Transfer directly to our bank account.</p>
                        <div className="space-y-3">
                          <BankDetailRow label="Account Name" value={BANK_ACCOUNT_NAME} />
                          <BankDetailRow label="Account Number" value={BANK_ACCOUNT_NUMBER} />
                          <BankDetailRow label="IFSC Code" value={BANK_IFSC} />
                          <BankDetailRow label="Bank Name" value={BANK_NAME} />
                        </div>
                        <p className="text-xs text-slate-500 mt-4">Your order will be processed once the transfer clears.</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-8">
              <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-6 py-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <QRCodeSVG value="dummy" size={40} className="opacity-50" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Raabita Smart QR</h3>
                      <p className="text-sm text-slate-500">Lifetime Validity</p>
                    </div>
                    <div className="ml-auto font-semibold text-slate-900">
                      Rs 249
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 pt-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rs 249</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes</span>
                      <span>Included</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900">Total</span>
                      <span className="text-2xl font-bold text-slate-900">Rs 249</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
                  {error && (
                    <div className="w-full p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 rotate-180" /> {error}
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg rounded-xl shadow-lg shadow-blue-500/20" 
                    disabled={loading || (paymentMethod === 'crypto' && !walletAddress)}
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      <><ShieldCheck className="w-5 h-5 mr-2" /> Complete Order</>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                256-bit SSL Secure Checkout
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

function PaymentButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
        active 
          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" 
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {icon}
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}

function BankDetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-200/50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-mono font-medium text-slate-900">{value}</span>
    </div>
  );
}
