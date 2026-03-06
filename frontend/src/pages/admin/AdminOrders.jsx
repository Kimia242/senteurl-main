import React, { useState, useEffect } from 'react';
import { Eye, Loader2, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { cn, formatPriceUSD } from '@/lib/utils';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/orders?limit=100`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status?status=${newStatus}`);
      toast.success('Statut mis à jour');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-emerald-500/20 text-emerald-400';
      case 'processing': return 'bg-blue-500/20 text-blue-400';
      case 'shipped': return 'bg-purple-500/20 text-purple-400';
      case 'delivered': return 'bg-emerald-500/20 text-emerald-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-amber-500/20 text-amber-400';
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl" data-testid="admin-orders-title">
            Gestion des Commandes
          </h1>
          <p className="text-muted-foreground mt-1">{orders.length} commandes</p>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 rounded-none" data-testid="order-status-filter">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="paid">Payées</SelectItem>
            <SelectItem value="processing">En préparation</SelectItem>
            <SelectItem value="shipped">Expédiées</SelectItem>
            <SelectItem value="delivered">Livrées</SelectItem>
            <SelectItem value="cancelled">Annulées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="bg-card border border-border p-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-card border border-border p-8 text-center text-muted-foreground">
          Aucune commande trouvée
        </div>
      ) : (
        <div className="bg-card border border-border overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Articles</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} data-testid={`order-row-${order.id}`}>
                  <td className="font-mono text-sm">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td>
                    <p className="font-medium">{order.customer_name || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                  </td>
                  <td>{order.items?.length || 0} article(s)</td>
                  <td className="text-primary font-medium">
                    {formatPriceUSD(order.total_amount)}
                  </td>
                  <td>
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 text-xs',
                      getStatusColor(order.status)
                    )}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="h-8 px-3"
                      data-testid={`view-order-${order.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Commande #{selectedOrder?.id.slice(0, 8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted/30">
                <div>
                  <p className="text-sm text-muted-foreground">Statut actuel</p>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-3 py-1 mt-1 text-sm',
                    getStatusColor(selectedOrder.status)
                  )}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                </div>
                <Select 
                  value={selectedOrder.status}
                  onValueChange={(value) => {
                    updateOrderStatus(selectedOrder.id, value);
                    setSelectedOrder({ ...selectedOrder, status: value });
                  }}
                >
                  <SelectTrigger className="w-48 rounded-none" data-testid="update-status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="paid">Payée</SelectItem>
                    <SelectItem value="processing">En préparation</SelectItem>
                    <SelectItem value="shipped">Expédiée</SelectItem>
                    <SelectItem value="delivered">Livrée</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
                    Client
                  </h3>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
                    Livraison
                  </h3>
                  <p className="text-sm">{selectedOrder.shipping_address}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                  Articles commandés
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-muted/20">
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.product_name}
                          className="w-16 h-20 object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {formatPriceUSD(item.price_at_purchase)}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPriceUSD(item.quantity * item.price_at_purchase)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="text-lg font-medium">Total</span>
                <span className="text-2xl font-serif text-primary">
                  {formatPriceUSD(selectedOrder.total_amount)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
