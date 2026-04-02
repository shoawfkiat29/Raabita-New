import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Package, QrCode, ExternalLink, Clock, User, Phone, MapPin } from "lucide-react";

export default function Admin() {
  const [qrs, setQrs] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qrsRes, ordersRes] = await Promise.all([
          fetch("/api/admin/qrs"),
          fetch("/api/admin/orders")
        ]);
        
        const qrsData = await qrsRes.json();
        const ordersData = await ordersRes.json();
        
        // Ensure we always have arrays
        setQrs(Array.isArray(qrsData) ? qrsData : []);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setQrs([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      // Handle Firestore Timestamp object
      if (date._seconds) {
        return new Date(date._seconds * 1000).toLocaleDateString();
      }
      // Handle ISO string or Date object
      return new Date(date).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 text-zinc-50 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-zinc-400 mt-2">Manage your Raabita QR codes and customer orders.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-zinc-900 border border-white/5 p-4 rounded-2xl text-center min-w-[120px]">
              <div className="text-2xl font-bold">{Array.isArray(orders) ? orders.length : 0}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Total Orders</div>
            </div>
            <div className="bg-zinc-900 border border-white/5 p-4 rounded-2xl text-center min-w-[120px]">
              <div className="text-2xl font-bold">{Array.isArray(qrs) ? qrs.filter(q => q.registered).length : 0}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Registered</div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="bg-zinc-900 border border-white/5 p-1 rounded-xl mb-8">
            <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white flex gap-2 items-center px-6 py-2.5">
              <Package className="w-4 h-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="qrs" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white flex gap-2 items-center px-6 py-2.5">
              <QrCode className="w-4 h-4" /> QR Codes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="bg-zinc-900 border-white/5 shadow-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 px-8 py-6">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-400" /> Customer Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-950/50">
                      <tr>
                        <th className="px-8 py-4">Order ID</th>
                        <th className="px-8 py-4">Customer</th>
                        <th className="px-8 py-4">Contact</th>
                        <th className="px-8 py-4">Address</th>
                        <th className="px-8 py-4">Payment</th>
                        <th className="px-8 py-4">QR Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {Array.isArray(orders) && orders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-6">
                            <div className="font-mono font-bold text-indigo-400">{order.id}</div>
                            <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatDate(order.createdAt)}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-semibold text-zinc-200">{order.name}</div>
                            <div className="text-xs text-zinc-500">{order.email}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-1.5 text-zinc-300">
                              <Phone className="w-3 h-3 text-zinc-500" /> {order.phone}
                            </div>
                          </td>
                          <td className="px-8 py-6 max-w-[200px]">
                            <div className="text-xs text-zinc-400 line-clamp-2 flex items-start gap-1.5">
                              <MapPin className="w-3 h-3 text-zinc-500 mt-0.5 shrink-0" /> {order.address}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <Badge variant="outline" className="bg-zinc-950 border-white/10 text-zinc-400 uppercase text-[10px] tracking-widest">
                              {order.paymentMethod}
                            </Badge>
                          </td>
                          <td className="px-8 py-6">
                            <a 
                              href={`/register/${order.qrId}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                            >
                              QR Page <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                      {(!Array.isArray(orders) || orders.length === 0) && !loading && (
                        <tr>
                          <td colSpan={6} className="px-8 py-12 text-center text-zinc-500">No orders found yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qrs">
            <Card className="bg-zinc-900 border-white/5 shadow-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 px-8 py-6">
                <CardTitle className="text-xl flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-purple-400" /> Generated QR Codes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-950/50">
                      <tr>
                        <th className="px-8 py-4">QR ID</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4">Owner</th>
                        <th className="px-8 py-4">Vehicle</th>
                        <th className="px-8 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {Array.isArray(qrs) && qrs.map((qr) => (
                        <tr key={qr.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-6 font-mono font-bold text-purple-400">{qr.id}</td>
                          <td className="px-8 py-6">
                            {qr.registered ? (
                              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/10">Registered</Badge>
                            ) : (
                              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/10">Unregistered</Badge>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            {qr.ownerName ? (
                              <div className="flex flex-col">
                                <span className="font-semibold text-zinc-200">{qr.ownerName}</span>
                                <span className="text-xs text-zinc-500">{qr.ownerPhone}</span>
                              </div>
                            ) : (
                              <span className="text-zinc-600">-</span>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            {qr.vehicleNumber ? (
                              <Badge variant="outline" className="bg-zinc-950 border-white/10 text-zinc-300 font-mono">
                                {qr.vehicleNumber}
                              </Badge>
                            ) : (
                              <span className="text-zinc-600">-</span>
                            )}
                          </td>
                          <td className="px-8 py-6 space-x-4">
                            <a href={`/register/${qr.id}`} className="text-zinc-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider" target="_blank" rel="noreferrer">Register</a>
                            <a href={`/scan/${qr.id}`} className="text-zinc-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider" target="_blank" rel="noreferrer">Scan</a>
                          </td>
                        </tr>
                      ))}
                      {(!Array.isArray(qrs) || qrs.length === 0) && !loading && (
                        <tr>
                          <td colSpan={5} className="px-8 py-12 text-center text-zinc-500">No QR codes generated yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
