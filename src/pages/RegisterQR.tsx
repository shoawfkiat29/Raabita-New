import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { QrCode, Loader2 } from "lucide-react";

export default function RegisterQR() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [qrStatus, setQrStatus] = useState<any>(null);

  useEffect(() => {
    const checkQR = async () => {
      try {
        const res = await fetch(`/api/qr/${id}`);
        if (!res.ok) throw new Error("QR code not found");
        const data = await res.json();
        setQrStatus(data);
        if (data.registered) {
          navigate(`/scan/${id}`);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load QR code");
      } finally {
        setLoading(false);
      }
    };
    checkQR();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/qr/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      if (result.success) {
        navigate(`/scan/${id}`);
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred during registration");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (error && !qrStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="text-red-500 mb-4">⚠️ {error}</div>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle>Register Your QR Code</CardTitle>
          <CardDescription>Link this QR code to your vehicle and phone number.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}
            
            <div className="space-y-2">
              <label htmlFor="ownerName" className="text-sm font-medium">Your Name</label>
              <Input id="ownerName" name="ownerName" required placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label htmlFor="ownerPhone" className="text-sm font-medium">Phone Number (Hidden from others)</label>
              <Input id="ownerPhone" name="ownerPhone" type="tel" required placeholder="+1 234 567 8900" />
              <p className="text-xs text-slate-500">We will route calls to this number without revealing it.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="vehicleNumber" className="text-sm font-medium">Vehicle License Plate</label>
              <Input id="vehicleNumber" name="vehicleNumber" required placeholder="ABC-1234" className="uppercase" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Registering..." : "Activate QR Code"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
