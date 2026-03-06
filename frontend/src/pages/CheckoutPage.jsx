import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, CreditCard, Shield, Truck } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { formatPriceUSD, calculateDiscountedPrice } from '../lib/utils';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, sessionId } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customer_name.trim()) newErrors.customer_name = 'Le nom est requis';
    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.customer_email)) {
      newErrors.customer_email = 'Email invalide';
    }
    if (!formData.customer_phone.trim()) newErrors.customer_phone = 'Le téléphone est requis';
    if (!formData.shipping_address.trim()) newErrors.shipping_address = 'L\'adresse est requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const response = await axios.post(`${API}/checkout`, {
        session_id: sessionId,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        shipping_address: formData.shipping_address,
        origin_url: window.location.origin
      });

      if (response.data.checkout_url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container-custom py-16 text-center">
          <p className="text-muted-foreground mb-4">Votre panier est vide</p>
          <Link to="/shop">
            <Button variant="outline" className="rounded-none">
              Continuer vos achats
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-card/30 border-b border-border py-8">
        <div className="container-custom">
          <Link 
            to="/cart" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            data-testid="back-to-cart-link"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au panier
          </Link>
          <h1 className="font-serif text-4xl" data-testid="checkout-title">Finaliser la commande</h1>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <h2 className="font-serif text-xl">Informations de contact</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Nom complet *</Label>
                  <Input
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    placeholder="Prénom et nom"
                    className={`h-12 rounded-none ${errors.customer_name ? 'border-destructive' : ''}`}
                    data-testid="input-name"
                  />
                  {errors.customer_name && (
                    <p className="text-sm text-destructive">{errors.customer_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_email">Email *</Label>
                  <Input
                    id="customer_email"
                    name="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    placeholder="votre@email.com"
                    className={`h-12 rounded-none ${errors.customer_email ? 'border-destructive' : ''}`}
                    data-testid="input-email"
                  />
                  {errors.customer_email && (
                    <p className="text-sm text-destructive">{errors.customer_email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Téléphone *</Label>
                  <Input
                    id="customer_phone"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    placeholder="+221 77 123 45 67"
                    className={`h-12 rounded-none ${errors.customer_phone ? 'border-destructive' : ''}`}
                    data-testid="input-phone"
                  />
                  {errors.customer_phone && (
                    <p className="text-sm text-destructive">{errors.customer_phone}</p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-6">
                <h2 className="font-serif text-xl">Adresse de livraison</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="shipping_address">Adresse complète *</Label>
                  <Textarea
                    id="shipping_address"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleInputChange}
                    placeholder="Adresse, quartier, ville..."
                    rows={3}
                    className={`rounded-none ${errors.shipping_address ? 'border-destructive' : ''}`}
                    data-testid="input-address"
                  />
                  {errors.shipping_address && (
                    <p className="text-sm text-destructive">{errors.shipping_address}</p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-border">
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Paiement sécurisé</p>
                </div>
                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Livraison à Dakar</p>
                </div>
                <div className="text-center">
                  <CreditCard className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Stripe Checkout</p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-none uppercase tracking-widest text-xs font-bold bg-primary hover:bg-primary/90 btn-press"
                data-testid="submit-checkout-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Procéder au paiement - {formatPriceUSD(cart.total)}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-card border border-border p-8 sticky top-28">
              <h2 className="font-serif text-xl mb-6">Récapitulatif de commande</h2>

              <div className="space-y-4 mb-6">
                {cart.items.map((item) => {
                  const product = item.product;
                  const displayPrice = product?.is_promotion && product?.discount_percentage
                    ? calculateDiscountedPrice(product.price, product.discount_percentage)
                    : product?.price;

                  return (
                    <div 
                      key={item.product_id}
                      className="flex gap-4 pb-4 border-b border-border last:border-0"
                      data-testid={`checkout-item-${item.product_id}`}
                    >
                      <div className="w-16 h-20 bg-muted shrink-0 overflow-hidden">
                        <img
                          src={product?.image_url}
                          alt={product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">{product?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qté: {item.quantity}
                        </p>
                        <p className="text-sm text-primary">
                          {formatPriceUSD(displayPrice)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPriceUSD(item.item_total)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{formatPriceUSD(cart.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>Gratuite</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-2xl font-serif text-primary" data-testid="checkout-total">
                    {formatPriceUSD(cart.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
