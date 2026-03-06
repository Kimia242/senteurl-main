import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { cn, formatPriceUSD, calculateDiscountedPrice, getGenderLabel } from '../lib/utils';
import { toast } from 'sonner';

export const ProductCard = ({ product, featured = false }) => {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const displayPrice = product.is_promotion && product.discount_percentage
    ? calculateDiscountedPrice(product.price, product.discount_percentage)
    : product.price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock <= 0) {
      toast.error('Ce produit est en rupture de stock');
      return;
    }

    setLoading(true);
    const result = await addToCart(product.id, 1);
    setLoading(false);

    if (result.success) {
      toast.success(`${product.name} ajouté au panier`);
    } else {
      toast.error(result.error || 'Erreur lors de l\'ajout au panier');
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={cn(
        'group relative block bg-card border border-border/50 overflow-hidden',
        'hover:border-primary/50 transition-colors duration-500',
        featured ? 'aspect-[3/4]' : 'aspect-[3/4]'
      )}
      data-testid={`product-card-${product.id}`}
    >
      {/* Image */}
      <div className="relative h-3/4 overflow-hidden bg-muted">
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
        <img
          src={product.image_url}
          alt={product.name}
          className={cn(
            'w-full h-full object-cover transition-transform duration-700',
            'group-hover:scale-105',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Quick actions */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
          <button
            onClick={handleAddToCart}
            disabled={loading || product.stock <= 0}
            className={cn(
              'flex-1 h-10 flex items-center justify-center gap-2',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'text-xs uppercase tracking-wider font-medium transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            data-testid={`add-to-cart-${product.id}`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Ajouter
              </>
            )}
          </button>
          <div
            className="w-10 h-10 flex items-center justify-center bg-card border border-border hover:border-primary transition-colors"
            data-testid={`view-product-${product.id}`}
          >
            <Eye className="w-4 h-4" />
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_new && (
            <span className="px-3 py-1 text-xs uppercase tracking-wider badge-new">
              Nouveau
            </span>
          )}
          {product.is_promotion && product.discount_percentage && (
            <span className="px-3 py-1 text-xs uppercase tracking-wider badge-promo promo-pulse">
              -{product.discount_percentage}%
            </span>
          )}
          {product.stock <= 0 && (
            <span className="px-3 py-1 text-xs uppercase tracking-wider badge-out-of-stock">
              Rupture
            </span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="px-3 py-1 text-xs uppercase tracking-wider badge-stock-low">
              Stock limité
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 h-1/4 flex flex-col justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {getGenderLabel(product.gender)}
          </p>
          <h3 className="font-serif text-base md:text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-primary">
            {formatPriceUSD(displayPrice)}
          </span>
          {product.is_promotion && product.original_price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPriceUSD(product.original_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
