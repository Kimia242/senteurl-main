import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import axios from 'axios';
import { cn, formatPriceUSD } from '../../lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showBrands, setShowBrands] = useState(false);
  const searchRef = useRef(null);
  const brandsRef = useRef(null);
  const { cartItemCount, setCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(`${API}/brands`);
        setBrands(response.data);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
        setSearchResults([]);
      }
      if (brandsRef.current && !brandsRef.current.contains(event.target)) {
        setShowBrands(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const response = await axios.get(`${API}/products?search=${searchQuery}&limit=5`);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching products:', error);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/shop', label: 'Boutique' },
    { href: '/nouveautes', label: 'Nouveautés' },
    { href: '/promotions', label: 'Promotions' },
    { href: '/about', label: 'À Propos' },
    { href: '/contact', label: 'Contact' }
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled ? 'nav-glass border-b border-border/50' : 'bg-transparent'
      )}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="font-serif text-2xl md:text-3xl tracking-wide text-foreground hover:text-primary transition-colors duration-300"
            data-testid="logo-link"
          >
            Senteur L
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              link.label === 'Boutique' ? (
                <div key={link.href} ref={brandsRef} className="relative">
                  <button
                    onClick={() => setShowBrands(!showBrands)}
                    className={cn(
                      'flex items-center gap-1 text-sm uppercase tracking-widest font-medium transition-colors duration-300',
                      location.pathname === link.href ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                    data-testid="shop-dropdown-btn"
                  >
                    {link.label}
                    <ChevronDown className={cn('w-4 h-4 transition-transform', showBrands && 'rotate-180')} />
                  </button>
                  
                  {showBrands && (
                    <div className="absolute top-full left-0 mt-4 w-64 glass border border-border/50 p-4 animate-fade-in">
                      <Link
                        to="/shop"
                        className="block px-4 py-2 text-sm hover:text-primary hover:bg-accent/50 transition-colors"
                        onClick={() => setShowBrands(false)}
                        data-testid="all-products-link"
                      >
                        Tous les produits
                      </Link>
                      <div className="border-t border-border my-2" />
                      <p className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">Marques</p>
                      {brands.map((brand) => (
                        <Link
                          key={brand.id}
                          to={`/brands/${brand.id}`}
                          className="block px-4 py-2 text-sm hover:text-primary hover:bg-accent/50 transition-colors"
                          onClick={() => setShowBrands(false)}
                          data-testid={`brand-link-${brand.id}`}
                        >
                          {brand.name}
                        </Link>
                      ))}
                      <div className="border-t border-border my-2" />
                      <Link
                        to="/brands"
                        className="block px-4 py-2 text-sm text-primary hover:bg-accent/50 transition-colors"
                        onClick={() => setShowBrands(false)}
                        data-testid="all-brands-link"
                      >
                        Voir toutes les marques
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'text-sm uppercase tracking-widest font-medium transition-colors duration-300',
                    location.pathname === link.href ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}
                  data-testid={`nav-link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="search-toggle-btn"
                aria-label="Rechercher"
              >
                <Search className="w-5 h-5" />
              </button>
              
              {searchOpen && (
                <div className="absolute top-full right-0 mt-4 w-80 glass border border-border/50 p-4 animate-slide-in-right">
                  <form onSubmit={handleSearchSubmit}>
                    <Input
                      type="text"
                      placeholder="Rechercher un parfum..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-background/50 border-input focus:border-primary"
                      data-testid="search-input"
                      autoFocus
                    />
                  </form>
                  
                  {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="flex items-center gap-3 p-2 hover:bg-accent/50 transition-colors"
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                          data-testid={`search-result-${product.id}`}
                        >
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{formatPriceUSD(product.price)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="cart-btn"
              aria-label="Panier"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Admin Link */}
            <Link
              to="/admin"
              className="hidden md:block text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              data-testid="admin-link"
            >
              Admin
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="mobile-menu-toggle"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mobile-menu-overlay fixed inset-0 top-20 z-40 animate-fade-in">
          <nav className="container-custom py-8 space-y-6">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block text-2xl font-serif animate-slide-up',
                  location.pathname === link.href ? 'text-primary' : 'text-foreground'
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`mobile-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6 border-t border-border">
              <Link
                to="/brands"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-lg text-muted-foreground hover:text-foreground transition-colors animate-slide-up stagger-5"
                data-testid="mobile-brands-link"
              >
                Toutes les marques
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block mt-4 text-lg text-muted-foreground hover:text-foreground transition-colors animate-slide-up stagger-5"
                data-testid="mobile-admin-link"
              >
                Administration
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
