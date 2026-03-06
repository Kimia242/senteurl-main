import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BrandDetailPage = () => {
  const { brandId } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [brandRes, productsRes] = await Promise.all([
          axios.get(`${API}/brands/${brandId}`),
          axios.get(`${API}/products?brand_id=${brandId}`)
        ]);
        setBrand(brandRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error('Error fetching brand data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [brandId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Marque non trouvée</p>
        <Link to="/brands">
          <Button variant="outline" className="rounded-none">
            Voir toutes les marques
          </Button>
        </Link>
      </div>
    );
  }

  const heroImage = "https://images.unsplash.com/photo-1725139695447-f75e1b482708?w=1200";

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px]">
        <img
          src={heroImage}
          alt={brand.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        <div className="absolute bottom-0 left-0 right-0 container-custom pb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/brands" className="hover:text-foreground transition-colors">Marques</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{brand.name}</span>
          </nav>
          
          <h1 className="font-serif text-5xl md:text-6xl" data-testid="brand-title">
            {brand.name}
          </h1>
          {brand.description && (
            <p className="text-muted-foreground mt-4 max-w-xl text-lg">
              {brand.description}
            </p>
          )}
        </div>
      </div>

      {/* Products */}
      <section className="container-custom py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl">
            Collection {brand.name}
          </h2>
          <span className="text-sm text-muted-foreground">
            {products.length} produit{products.length !== 1 ? 's' : ''}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              Aucun produit disponible pour cette marque
            </p>
            <Link to="/shop">
              <Button variant="outline" className="rounded-none">
                Voir tous les produits
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div 
                key={product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BrandDetailPage;
