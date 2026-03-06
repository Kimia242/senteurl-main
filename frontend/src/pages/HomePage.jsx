import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Gift, Truck } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import ProductCard from '../components/ProductCard';
import { cn } from '../lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Seed database first
        await axios.post(`${API}/seed`).catch(() => {});
        
        const [productsRes, newRes, promoRes, brandsRes] = await Promise.all([
          axios.get(`${API}/products?limit=8`),
          axios.get(`${API}/products?is_new=true&limit=4`),
          axios.get(`${API}/products?is_promotion=true&limit=4`),
          axios.get(`${API}/brands`)
        ]);
        
        setFeaturedProducts(productsRes.data);
        setNewProducts(newRes.data);
        setPromoProducts(promoRes.data);
        setBrands(brandsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const heroImages = {
    main: "https://images.unsplash.com/photo-1725139695447-f75e1b482708?w=1200&q=85",
    secondary: "https://images.unsplash.com/photo-1643797517590-c44cb552ddcc?w=800&q=85"
  };

  const lifestyleImages = {
    women: "https://images.unsplash.com/photo-1644820850778-034b767387dd?w=600&q=85",
    men: "https://images.unsplash.com/photo-1726051810799-cb6c9a057236?w=600&q=85",
    gift: "https://images.unsplash.com/photo-1625502664816-4938b1d0d685?w=600&q=85"
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen hero-gradient noise-overlay flex items-center">
        <div className="container-custom pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-8 animate-slide-up z-10">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">
                Collection Exclusive
              </p>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-none">
                L'Art de la
                <span className="block text-gradient">Séduction</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                Découvrez notre collection de parfums de luxe. Des fragrances uniques 
                qui révèlent votre personnalité et laissent une empreinte inoubliable.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/shop">
                  <Button 
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 rounded-none uppercase tracking-widest text-xs font-bold btn-press"
                    data-testid="hero-shop-btn"
                  >
                    Explorer la Boutique
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/nouveautes">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="h-14 px-10 rounded-none uppercase tracking-widest text-xs font-bold btn-press"
                    data-testid="hero-new-btn"
                  >
                    Nouveautés
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Images */}
            <div className="relative hidden lg:block animate-fade-in stagger-2 z-10">
              <div className="relative">
                <img
                  src={heroImages.main}
                  alt="Parfum de luxe"
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute -bottom-8 -left-8 w-48 h-64 border-2 border-primary/20" />
              </div>
              <img
                src={heroImages.secondary}
                alt="Collection de parfums"
                className="absolute -bottom-12 -right-12 w-64 h-80 object-cover border-4 border-background shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-xs uppercase tracking-widest">Découvrir</span>
          <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-8 bg-card border-y border-border">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <Truck className="w-6 h-6 text-primary" />
              <span className="text-sm">Livraison à Dakar</span>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-sm">100% Authentique</span>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-end">
              <Gift className="w-6 h-6 text-primary" />
              <span className="text-sm">Emballage Cadeau</span>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      {newProducts.length > 0 && (
        <section className="section-spacing" data-testid="new-arrivals-section">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">
                  Fraîchement arrivés
                </p>
                <h2 className="font-serif text-3xl md:text-4xl">Nouveautés</h2>
              </div>
              <Link 
                to="/nouveautes" 
                className="hidden md:flex items-center gap-2 text-sm uppercase tracking-wider hover:text-primary transition-colors"
                data-testid="view-all-new"
              >
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lifestyle Section */}
      <section className="section-spacing bg-card/30">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Women */}
            <Link 
              to="/shop?gender=femme" 
              className="group relative aspect-[3/4] overflow-hidden"
              data-testid="shop-women-link"
            >
              <img
                src={lifestyleImages.women}
                alt="Parfums pour femme"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Collection</p>
                <h3 className="font-serif text-2xl mb-4">Pour Elle</h3>
                <span className="inline-flex items-center gap-2 text-sm uppercase tracking-wider group-hover:text-primary transition-colors">
                  Découvrir
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Men */}
            <Link 
              to="/shop?gender=homme" 
              className="group relative aspect-[3/4] overflow-hidden"
              data-testid="shop-men-link"
            >
              <img
                src={lifestyleImages.men}
                alt="Parfums pour homme"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Collection</p>
                <h3 className="font-serif text-2xl mb-4">Pour Lui</h3>
                <span className="inline-flex items-center gap-2 text-sm uppercase tracking-wider group-hover:text-primary transition-colors">
                  Découvrir
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Gifts */}
            <Link 
              to="/promotions" 
              className="group relative aspect-[3/4] overflow-hidden"
              data-testid="shop-gifts-link"
            >
              <img
                src={lifestyleImages.gift}
                alt="Idées cadeaux"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Sélection</p>
                <h3 className="font-serif text-2xl mb-4">Idées Cadeaux</h3>
                <span className="inline-flex items-center gap-2 text-sm uppercase tracking-wider group-hover:text-primary transition-colors">
                  Découvrir
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      {promoProducts.length > 0 && (
        <section className="section-spacing" data-testid="promotions-section">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">
                  Offres spéciales
                </p>
                <h2 className="font-serif text-3xl md:text-4xl">Promotions</h2>
              </div>
              <Link 
                to="/promotions" 
                className="hidden md:flex items-center gap-2 text-sm uppercase tracking-wider hover:text-primary transition-colors"
                data-testid="view-all-promos"
              >
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {promoProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brands Section */}
      {brands.length > 0 && (
        <section className="section-spacing bg-card/30 border-y border-border" data-testid="brands-section">
          <div className="container-custom">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">
                Nos partenaires
              </p>
              <h2 className="font-serif text-3xl md:text-4xl">Marques Prestigieuses</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/brands/${brand.id}`}
                  className="group flex items-center justify-center p-6 border border-border/50 hover:border-primary/50 bg-card/50 transition-all duration-300"
                  data-testid={`brand-${brand.id}`}
                >
                  <span className="font-serif text-lg text-muted-foreground group-hover:text-foreground transition-colors">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/brands">
                <Button 
                  variant="outline"
                  className="h-12 px-8 rounded-none uppercase tracking-widest text-xs font-bold"
                  data-testid="view-all-brands"
                >
                  Toutes nos marques
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="section-spacing" data-testid="featured-section">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">
                  Sélection
                </p>
                <h2 className="font-serif text-3xl md:text-4xl">Nos Coups de Cœur</h2>
              </div>
              <Link 
                to="/shop" 
                className="hidden md:flex items-center gap-2 text-sm uppercase tracking-wider hover:text-primary transition-colors"
                data-testid="view-all-featured"
              >
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product, index) => (
                <div 
                  key={product.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImages.secondary})` }}
        />
        <div className="absolute inset-0 bg-background/90" />
        
        <div className="container-custom relative z-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
            Newsletter
          </p>
          <h2 className="font-serif text-3xl md:text-5xl mb-6">
            Restez Informé
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Inscrivez-vous à notre newsletter pour recevoir nos offres exclusives 
            et découvrir nos nouvelles collections en avant-première.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 h-12 px-4 bg-background/50 border border-input focus:border-primary outline-none transition-colors"
              data-testid="newsletter-email"
            />
            <Button 
              className="h-12 px-8 rounded-none uppercase tracking-widest text-xs font-bold bg-primary hover:bg-primary/90"
              data-testid="newsletter-submit"
            >
              S'inscrire
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
