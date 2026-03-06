import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(`${API}/brands`);
        setBrands(response.data);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const brandImages = [
    "https://images.unsplash.com/photo-1725139695447-f75e1b482708?w=600",
    "https://images.unsplash.com/photo-1643797517590-c44cb552ddcc?w=600",
    "https://images.unsplash.com/photo-1640975972263-1f73398e943b?w=600",
    "https://images.unsplash.com/photo-1630512873562-ee0deb00ed4f?w=600",
    "https://images.unsplash.com/photo-1733348172372-31f147483275?w=600",
    "https://images.unsplash.com/photo-1726051810799-cb6c9a057236?w=600"
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-card/30 border-b border-border py-16">
        <div className="container-custom">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">
            Nos Partenaires
          </p>
          <h1 className="font-serif text-4xl md:text-5xl" data-testid="brands-page-title">
            Marques Prestigieuses
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Découvrez notre sélection exclusive des plus grandes maisons de parfumerie au monde.
          </p>
        </div>
      </div>

      <div className="container-custom py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-card shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {brands.map((brand, index) => (
              <Link
                key={brand.id}
                to={`/brands/${brand.id}`}
                className="group relative aspect-[4/3] overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-colors duration-500"
                data-testid={`brand-card-${brand.id}`}
              >
                <img
                  src={brandImages[index % brandImages.length]}
                  alt={brand.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="font-serif text-2xl mb-2">{brand.name}</h2>
                  {brand.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {brand.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-2 text-sm uppercase tracking-wider text-primary">
                    Découvrir
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsPage;
