import React from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/button';
import { formatPriceUSD, calculateDiscountedPrice } from '../../lib/utils';
import { cn } from '../../lib/utils';

export const CartDrawer = () => {
  const { cart, cartOpen, setCartOpen, updateCartItem, removeFromCart, loading } = useCart();

  const handleUpdateQuantity = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      await removeFromCart(productId);
    } else {
      await updateCartItem(productId, newQty);
    }
  };

  if (!cartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
        onClick={() => setCartOpen(false)}
        data-testid="cart-overlay"
      />

      {/* Drawer */}
      <div className="cart-drawer animate-slide-in-right" data-testid="cart-drawer">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="font-serif text-xl">Votre Panier</h2>
            <button
              onClick={() => setCartOpen(false)}
              className="p-2 hover:bg-accent transition-colors"
              data-testid="close-cart-btn"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.items?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-6">Votre panier est vide</p>
                <Button
                  onClick={() => setCartOpen(false)}
                  variant="outline"
                  className="uppercase tracking-widest text-xs"
                  data-testid="continue-shopping-btn"
                >
                  Continuer vos achats
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.items.map((item) => {
                  const product = item.product;
                  const displayPrice = product?.is_promotion && product?.discount_percentage
                    ? calculateDiscountedPrice(product.price, product.discount_percentage)
                    : product?.price;

                  return (
                    <div 
                      key={item.product_id} 
                      className="flex gap-4 pb-6 border-b border-border last:border-0"
                      data-testid={`cart-item-${item.product_id}`}
                    >
                      <Link 
                        to={`/product/${item.product_id}`}
                        onClick={() => setCartOpen(false)}
                        className="w-20 h-24 bg-muted shrink-0 overflow-hidden"
                      >
                        <img
                          src={product?.image_url}
                          alt={product?.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/product/${item.product_id}`}
                          onClick={() => setCartOpen(false)}
                          className="font-medium hover:text-primary transition-colors line-clamp-2"
                        >
                          {product?.name}
                        </Link>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-primary font-medium">
                            {formatPriceUSD(displayPrice)}
                          </span>
                          {product?.is_promotion && product?.original_price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPriceUSD(product.original_price)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity, -1)}
                              disabled={loading}
                              className="qty-btn"
                              data-testid={`decrease-qty-${item.product_id}`}
                              aria-label="Diminuer la quantité"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity, 1)}
                              disabled={loading}
                              className="qty-btn"
                              data-testid={`increase-qty-${item.product_id}`}
                              aria-label="Augmenter la quantité"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            disabled={loading}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            data-testid={`remove-item-${item.product_id}`}
                            aria-label="Supprimer du panier"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.items?.length > 0 && (
            <div className="p-6 border-t border-border bg-card/50">
              <div className="flex items-center justify-between mb-6">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="text-xl font-serif" data-testid="cart-total">
                  {formatPriceUSD(cart.total)}
                </span>
              </div>
              
              <div className="space-y-3">
                <Link
                  to="/cart"
                  onClick={() => setCartOpen(false)}
                  className={cn(
                    "w-full h-12 flex items-center justify-center",
                    "border border-input bg-transparent hover:bg-accent",
                    "uppercase tracking-widest text-xs font-bold transition-colors"
                  )}
                  data-testid="view-cart-btn"
                >
                  Voir le panier
                </Link>
                <Link
                  to="/checkout"
                  onClick={() => setCartOpen(false)}
                  className={cn(
                    "w-full h-12 flex items-center justify-center",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "uppercase tracking-widest text-xs font-bold transition-colors"
                  )}
                  data-testid="checkout-btn"
                >
                  Passer la commande
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
