import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { formatPriceUSD, calculateDiscountedPrice, cn } from '../lib/utils';

const CartPage = () => {
  const { cart, updateCartItem, removeFromCart, loading } = useCart();

  const handleUpdateQuantity = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      await removeFromCart(productId);
    } else {
      await updateCartItem(productId, newQty);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container-custom py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="w-20 h-20 mx-auto text-muted-foreground mb-6" />
            <h1 className="font-serif text-3xl mb-4">Votre panier est vide</h1>
            <p className="text-muted-foreground mb-8">
              Découvrez notre collection de parfums de luxe et trouvez la fragrance parfaite.
            </p>
            <Link to="/shop">
              <Button className="h-12 px-8 rounded-none uppercase tracking-widest text-xs font-bold bg-primary hover:bg-primary/90">
                Explorer la boutique
              </Button>
            </Link>
          </div>
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
            to="/shop" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            data-testid="continue-shopping-link"
          >
            <ArrowLeft className="w-4 h-4" />
            Continuer vos achats
          </Link>
          <h1 className="font-serif text-4xl" data-testid="cart-page-title">Votre Panier</h1>
          <p className="text-muted-foreground mt-2">
            {cart.items.length} article{cart.items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => {
              const product = item.product;
              const displayPrice = product?.is_promotion && product?.discount_percentage
                ? calculateDiscountedPrice(product.price, product.discount_percentage)
                : product?.price;

              return (
                <div 
                  key={item.product_id}
                  className="flex gap-6 p-6 bg-card border border-border"
                  data-testid={`cart-item-${item.product_id}`}
                >
                  <Link 
                    to={`/product/${item.product_id}`}
                    className="w-32 h-40 bg-muted shrink-0 overflow-hidden"
                  >
                    <img
                      src={product?.image_url}
                      alt={product?.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                      <Link 
                        to={`/product/${item.product_id}`}
                        className="font-serif text-lg hover:text-primary transition-colors"
                      >
                        {product?.name}
                      </Link>
                      
                      {product?.volume && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {product.volume}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg text-primary font-medium">
                          {formatPriceUSD(displayPrice)}
                        </span>
                        {product?.is_promotion && product?.original_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPriceUSD(product.original_price)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity, -1)}
                          disabled={loading}
                          className="qty-btn"
                          data-testid={`cart-decrease-${item.product_id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-16 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity, 1)}
                          disabled={loading || item.quantity >= (product?.stock || 0)}
                          className="qty-btn"
                          data-testid={`cart-increase-${item.product_id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-medium">
                          {formatPriceUSD(item.item_total)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          disabled={loading}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          data-testid={`cart-remove-${item.product_id}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border p-8 sticky top-28">
              <h2 className="font-serif text-xl mb-6">Récapitulatif</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{formatPriceUSD(cart.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>Calculée à l'étape suivante</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-2xl font-serif text-primary" data-testid="cart-total">
                    {formatPriceUSD(cart.total)}
                  </span>
                </div>
              </div>

              <Link to="/checkout">
                <Button 
                  className="w-full h-14 rounded-none uppercase tracking-widest text-xs font-bold bg-primary hover:bg-primary/90 btn-press"
                  data-testid="proceed-checkout-btn"
                >
                  Passer la commande
                </Button>
              </Link>

              <p className="text-xs text-center text-muted-foreground mt-6">
                Paiement sécurisé par Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
