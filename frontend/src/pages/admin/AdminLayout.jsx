import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Layers, 
  ShoppingCart, 
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Archive
} from 'lucide-react';
import axios from 'axios';
import { cn, formatPriceUSD } from '../../lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/admin/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const navItems = [
    { href: '/admin', label: 'Tableau de Bord', icon: LayoutDashboard, exact: true },
    { href: '/admin/products', label: 'Produits', icon: Package },
    { href: '/admin/brands', label: 'Marques', icon: Tags },
    { href: '/admin/categories', label: 'Catégories', icon: Layers },
    { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
  ];

  const isActive = (href, exact = false) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 admin-sidebar border-r border-border pt-20 lg:pt-0 transform transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
          <div className="p-6 border-b border-border">
            <h2 className="font-serif text-xl">Administration</h2>
            <p className="text-sm text-muted-foreground mt-1">Senteur L</p>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                  isActive(item.href, item.exact)
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
                data-testid={`admin-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Quick Stats */}
          {stats && (
            <div className="p-4 mt-4 border-t border-border">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                Aperçu rapide
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Produits</span>
                  <span>{stats.total_products}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Commandes</span>
                  <span>{stats.total_orders}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Revenus</span>
                  <span className="text-primary">{formatPriceUSD(stats.total_revenue)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <Link 
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Retour au site
            </Link>
          </div>
        </aside>

        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
          data-testid="admin-menu-toggle"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-background/80 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          axios.get(`${API}/admin/stats`),
          axios.get(`${API}/orders?limit=5`)
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-card shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="font-serif text-3xl mb-8" data-testid="admin-dashboard-title">
        Tableau de Bord
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-primary" />
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-serif" data-testid="stat-revenue">
            {formatPriceUSD(stats?.total_revenue || 0)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Revenus totaux</p>
        </div>

        <div className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <span className="text-sm text-emerald-500">{stats?.paid_orders || 0} payées</span>
          </div>
          <p className="text-2xl font-serif" data-testid="stat-orders">
            {stats?.total_orders || 0}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Commandes totales</p>
        </div>

        <div className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-primary" />
            <span className="text-sm text-muted-foreground">{stats?.total_brands || 0} marques</span>
          </div>
          <p className="text-2xl font-serif" data-testid="stat-products">
            {stats?.total_products || 0}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Produits en catalogue</p>
        </div>

        <div className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-2xl font-serif" data-testid="stat-low-stock">
            {stats?.low_stock_products || 0}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Stock faible</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-serif text-xl">Commandes Récentes</h2>
          <Link to="/admin/orders" className="text-sm text-primary hover:underline">
            Voir tout
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucune commande pour le moment
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-mono text-sm">
                    {order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td>{order.customer_name || 'N/A'}</td>
                  <td>{formatPriceUSD(order.total_amount)}</td>
                  <td>
                    <span className={cn(
                      'px-2 py-1 text-xs',
                      order.status === 'paid' && 'bg-emerald-500/20 text-emerald-400',
                      order.status === 'pending' && 'bg-amber-500/20 text-amber-400',
                      order.status === 'cancelled' && 'bg-red-500/20 text-red-400'
                    )}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
