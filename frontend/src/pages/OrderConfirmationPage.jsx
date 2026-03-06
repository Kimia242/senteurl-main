import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Package, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { formatPriceUSD } from '../lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrderConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('loading'); // loading, paid, failed, expired
  const [order, setOrder] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const maxPolls = 10;

  useEffect(() => {
    if (!sessionId) {
      setStatus('failed');
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await axios.get(`${API}/checkout/status/${sessionId}`);
        
        if (response.data.status === 'paid') {
          setStatus('paid');
          setOrder(response.data.order);
        } else if (response.data.status === 'expired') {
          setStatus('expired');
        } else if (pollCount < maxPolls) {
          // Continue polling
          setPollCount(prev => prev + 1);
          setTimeout(checkPaymentStatus, 2000);
        } else {
          setStatus('pending');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        if (pollCount < maxPolls) {
          setPollCount(prev => prev + 1);
          setTimeout(checkPaymentStatus, 2000);
        } else {
          setStatus('failed');
        }
      }
    };

    checkPaymentStatus();
  }, [sessionId, pollCount]);

  return (
    <div className="min-h-screen pt-20">
      <div className="container-custom py-16">
        <div className="max-w-2xl mx-auto">
          {status === 'loading' && (
            <div className="text-center py-16">
              <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-6" />
              <h1 className="font-serif text-3xl mb-4">Vérification du paiement...</h1>
              <p className="text-muted-foreground">
                Veuillez patienter pendant que nous confirmons votre paiement.
              </p>
            </div>
          )}

          {status === 'paid' && order && (
            <div className="animate-slide-up">
              <div className="text-center mb-12">
                <CheckCircle className="w-20 h-20 mx-auto text-emerald-500 mb-6" />
                <h1 className="font-serif text-4xl mb-4" data-testid="order-success-title">
                  Commande confirmée !
                </h1>
                <p className="text-muted-foreground text-lg">
                  Merci pour votre commande. Vous recevrez bientôt votre parfum.
                </p>
              </div>

              <div className="bg-card border border-border p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Numéro de commande</p>
                    <p className="font-mono text-lg" data-testid="order-id">
                      {order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 text-sm">
                    {order.status === 'paid' ? 'Payée' : order.status}
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-medium mb-4">Articles commandés</h3>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-16 h-20 object-cover bg-muted"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qté: {item.quantity} × {formatPriceUSD(item.price_at_purchase)}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatPriceUSD(item.quantity * item.price_at_purchase)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border mt-6 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total</span>
                    <span className="text-2xl font-serif text-primary" data-testid="order-total">
                      {formatPriceUSD(order.total_amount)}
                    </span>
                  </div>
                </div>

                {order.shipping_address && (
                  <div className="border-t border-border mt-6 pt-6">
                    <h3 className="font-medium mb-2">Livraison à</h3>
                    <p className="text-muted-foreground">{order.customer_name}</p>
                    <p className="text-muted-foreground">{order.shipping_address}</p>
                    <p className="text-muted-foreground">{order.customer_phone}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/shop">
                  <Button 
                    variant="outline" 
                    className="h-12 px-8 rounded-none uppercase tracking-widest text-xs"
                    data-testid="continue-shopping-btn"
                  >
                    Continuer vos achats
                  </Button>
                </Link>
                <Link to="/">
                  <Button 
                    className="h-12 px-8 rounded-none uppercase tracking-widest text-xs bg-primary hover:bg-primary/90"
                    data-testid="back-home-btn"
                  >
                    Retour à l'accueil
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {(status === 'failed' || status === 'expired') && (
            <div className="text-center py-16 animate-slide-up">
              <XCircle className="w-20 h-20 mx-auto text-destructive mb-6" />
              <h1 className="font-serif text-3xl mb-4" data-testid="order-failed-title">
                {status === 'expired' ? 'Session expirée' : 'Échec du paiement'}
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {status === 'expired' 
                  ? 'Votre session de paiement a expiré. Veuillez réessayer.'
                  : 'Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/cart">
                  <Button 
                    className="h-12 px-8 rounded-none uppercase tracking-widest text-xs bg-primary hover:bg-primary/90"
                    data-testid="retry-payment-btn"
                  >
                    Réessayer le paiement
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button 
                    variant="outline" 
                    className="h-12 px-8 rounded-none uppercase tracking-widest text-xs"
                  >
                    Continuer vos achats
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === 'pending' && (
            <div className="text-center py-16 animate-slide-up">
              <Package className="w-20 h-20 mx-auto text-amber-500 mb-6" />
              <h1 className="font-serif text-3xl mb-4">Paiement en cours de traitement</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Votre paiement est en cours de vérification. Vous recevrez une confirmation par email sous peu.
              </p>
              <Link to="/">
                <Button 
                  className="h-12 px-8 rounded-none uppercase tracking-widest text-xs bg-primary hover:bg-primary/90"
                >
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
