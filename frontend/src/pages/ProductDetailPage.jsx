import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Share2, Minus, Plus, ChevronRight, Loader2, Check } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import ProductCard from '../components/ProductCard';
import { cn, formatPriceUSD, calculateDiscountedPrice, getGenderLabel, getStockStatus } from '../lib/utils';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetailPage = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [brand, setBrand] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/products/${productId}`);
        const productData = response.data;
        setProduct(productData);

        // Fetch brand
        if (productData.brand_id) {
          const brandRes = await axios.get(`${API}/brands/${productData.brand_id}`);
          setBrand(brandRes.data);
        }

        // Fetch related products (same gender or brand)
        const relatedRes = await axios.get(`${API}/products?brand_id=${productData.brand_id}&limit=4`);
        setRelatedProducts(relatedRes.data.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;

    setAddingToCart(true);
    const result = await addToCart(product.id, quantity);
    setAddingToCart(false);

    if (result.success) {
      toast.success(`${product.name} ajouté au panier`);
    } else {
      toast.error(result.error || 'Erreur lors de l\'ajout au panier');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Produit non trouvé</p>
        <Link to="/shop">
          <Button variant="outline" className="rounded-none">
            Retour à la boutique
          </Button>
        </Link>
      </div>
    );
  }

  const displayPrice = product.is_promotion && product.discount_percentage
    ? calculateDiscountedPrice(product.price, product.discount_percentage)
    : product.price;

  const stockStatus = getStockStatus(product.stock);
  const images = product.images?.length > 0 
    ? [product.image_url, ...product.images] 
    : [product.image_url];

  return (
    <div className="min-h-screen pt-20">
      {/* Breadcrumb */}
      <div className="bg-card/30 border-b border-border py-4">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/shop" className="hover:text-foreground transition-colors">Boutique</Link>
            {brand && (
              <>
                <ChevronRight className="w-4 h-4" />
                <Link to={`/brands/${brand.id}`} className="hover:text-foreground transition-colors">
                  {brand.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <section className="container-custom py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-card overflow-hidden" data-testid="product-main-image">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-4">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'w-20 h-20 bg-card overflow-hidden border-2 transition-colors',
                      selectedImage === index ? 'border-primary' : 'border-transparent hover:border-border'
                    )}
                    data-testid={`product-thumbnail-${index}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex items-center gap-2">
              {product.is_new && (
                <span className="px-3 py-1 text-xs uppercase tracking-wider badge-new">
                  Nouveau
                </span>
              )}
              {product.is_promotion && (
                <span className="px-3 py-1 text-xs uppercase tracking-wider badge-promo">
                  -{product.discount_percentage}%
                </span>
              )}
            </div>

            {/* Brand & Category */}
            {brand && (
              <Link 
                to={`/brands/${brand.id}`}
                className="text-sm uppercase tracking-wider text-primary hover:underline"
                data-testid="product-brand-link"
              >
                {brand.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl" data-testid="product-title">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-serif text-primary" data-testid="product-price">
                {formatPriceUSD(displayPrice)}
              </span>
              {product.is_promotion && product.original_price && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPriceUSD(product.original_price)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <p className={cn('text-sm', stockStatus.className)} data-testid="product-stock">
              {stockStatus.label}
            </p>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed" data-testid="product-description">
              {product.description}
            </p>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 py-6 border-y border-border">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Genre</p>
                <p className="font-medium">{getGenderLabel(product.gender)}</p>
              </div>
              {product.volume && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Volume</p>
                  <p className="font-medium">{product.volume}</p>
                </div>
              )}
              {product.notes && (
                <div className="col-span-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                  <p className="font-medium">{product.notes}</p>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <p className="text-sm uppercase tracking-wider">Quantité</p>
                <div className="flex items-center">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="qty-btn"
                    disabled={quantity <= 1}
                    data-testid="decrease-quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-medium" data-testid="quantity-display">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="qty-btn"
                    disabled={quantity >= product.stock}
                    data-testid="increase-quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock <= 0}
                  className="flex-1 h-14 rounded-none uppercase tracking-widest text-xs font-bold bg-primary hover:bg-primary/90 btn-press"
                  data-testid="add-to-cart-btn"
                >
                  {addingToCart ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : product.stock <= 0 ? (
                    'Rupture de stock'
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Ajouter au panier
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="h-14 w-14 rounded-none p-0"
                  onClick={handleShare}
                  data-testid="share-btn"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 pt-6">
              <div className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>100% Authentique</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>Livraison à Dakar</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>Paiement sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section-spacing bg-card/30 border-t border-border">
          <div className="container-custom">
            <h2 className="font-serif text-2xl md:text-3xl mb-8">
              Vous aimerez aussi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
