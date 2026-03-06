import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Filter, X, Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import { cn, formatPriceUSD } from '../lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Filter states
  const [selectedGender, setSelectedGender] = useState(searchParams.get('gender') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand_id') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category_id') || 'all');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [showNew, setShowNew] = useState(searchParams.get('is_new') === 'true');
  const [showPromo, setShowPromo] = useState(searchParams.get('is_promotion') === 'true');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('');

  // Determine page type based on route
  const isNewPage = location.pathname === '/nouveautes';
  const isPromoPage = location.pathname === '/promotions';

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          axios.get(`${API}/brands`),
          axios.get(`${API}/categories`)
        ]);
        setBrands(brandsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (selectedGender) params.append('gender', selectedGender);
        if (selectedBrand && selectedBrand !== 'all') params.append('brand_id', selectedBrand);
        if (selectedCategory && selectedCategory !== 'all') params.append('category_id', selectedCategory);
        if (priceRange[0] > 0) params.append('min_price', priceRange[0].toString());
        if (priceRange[1] < 200000) params.append('max_price', priceRange[1].toString());
        if (showNew || isNewPage) params.append('is_new', 'true');
        if (showPromo || isPromoPage) params.append('is_promotion', 'true');
        if (searchQuery) params.append('search', searchQuery);

        const response = await axios.get(`${API}/products?${params.toString()}`);
        let data = response.data;

        // Sort products
        if (sortBy === 'price-asc') {
          data = data.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-desc') {
          data = data.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'name') {
          data = data.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'newest') {
          data = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedGender, selectedBrand, selectedCategory, priceRange, showNew, showPromo, searchQuery, sortBy, isNewPage, isPromoPage]);

  const clearFilters = () => {
    setSelectedGender('');
    setSelectedBrand('all');
    setSelectedCategory('all');
    setPriceRange([0, 200000]);
    setShowNew(false);
    setShowPromo(false);
    setSearchQuery('');
    setSearchParams({});
  };

  const hasActiveFilters = selectedGender || (selectedBrand && selectedBrand !== 'all') || (selectedCategory && selectedCategory !== 'all') || priceRange[0] > 0 || priceRange[1] < 200000 || showNew || showPromo || searchQuery;

  const getPageTitle = () => {
    if (isNewPage) return 'Nouveautés';
    if (isPromoPage) return 'Promotions';
    return 'Boutique';
  };

  const getPageDescription = () => {
    if (isNewPage) return 'Découvrez nos dernières arrivées';
    if (isPromoPage) return 'Profitez de nos offres exceptionnelles';
    return 'Explorez notre collection de parfums de luxe';
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-card/30 border-b border-border py-16">
        <div className="container-custom">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">
            {isNewPage ? 'Fraîchement arrivés' : isPromoPage ? 'Offres spéciales' : 'Collection'}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl" data-testid="shop-title">
            {getPageTitle()}
          </h1>
          <p className="text-muted-foreground mt-2">{getPageDescription()}</p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="h-10 px-4 rounded-none gap-2"
              onClick={() => setFiltersOpen(!filtersOpen)}
              data-testid="toggle-filters-btn"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
            
            <span className="text-sm text-muted-foreground">
              {products.length} produit{products.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-10 rounded-none" data-testid="sort-select">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récents</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="name">Nom A-Z</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden md:flex items-center border border-border">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                data-testid="view-grid-btn"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                data-testid="view-list-btn"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={cn(
            'w-64 shrink-0 space-y-6',
            filtersOpen ? 'block' : 'hidden lg:block'
          )}>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
                data-testid="clear-filters-btn"
              >
                <X className="w-4 h-4" />
                Effacer les filtres
              </button>
            )}

            {/* Gender Filter */}
            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-wider font-medium">Genre</h3>
              <div className="space-y-2">
                {['femme', 'homme', 'unisex'].map((gender) => (
                  <label 
                    key={gender} 
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <Checkbox
                      checked={selectedGender === gender}
                      onCheckedChange={(checked) => setSelectedGender(checked ? gender : '')}
                      data-testid={`filter-gender-${gender}`}
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors capitalize">
                      {gender === 'femme' ? 'Pour Elle' : gender === 'homme' ? 'Pour Lui' : 'Unisexe'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-wider font-medium">Marque</h3>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-full rounded-none" data-testid="filter-brand-select">
                  <SelectValue placeholder="Toutes les marques" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les marques</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-wider font-medium">Catégorie</h3>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full rounded-none" data-testid="filter-category-select">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Filter */}
            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-wider font-medium">Prix</h3>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={200000}
                step={5000}
                className="py-4"
                data-testid="filter-price-slider"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatPriceUSD(priceRange[0])}</span>
                <span>{formatPriceUSD(priceRange[1])}</span>
              </div>
            </div>

            {/* Quick Filters */}
            {!isNewPage && !isPromoPage && (
              <div className="space-y-4">
                <h3 className="text-sm uppercase tracking-wider font-medium">Filtres rapides</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox
                      checked={showNew}
                      onCheckedChange={setShowNew}
                      data-testid="filter-new"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      Nouveautés
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox
                      checked={showPromo}
                      onCheckedChange={setShowPromo}
                      data-testid="filter-promo"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      En promotion
                    </span>
                  </label>
                </div>
              </div>
            )}
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-card shimmer" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">Aucun produit trouvé</p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="rounded-none"
                  data-testid="clear-filters-empty"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              )}>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
