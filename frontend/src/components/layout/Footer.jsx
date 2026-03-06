import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, MessageCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer-gradient border-t border-border/50 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="font-serif text-3xl tracking-wide text-foreground">
              Senteur L
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              Votre destination premium pour les parfums de luxe à Dakar. 
              Découvrez notre collection exclusive de fragrances des plus grandes maisons.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com/senteurl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors"
                data-testid="social-instagram"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com/senteurl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors"
                data-testid="social-facebook"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://wa.me/221774823661" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors"
                data-testid="social-whatsapp"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-serif text-lg mb-6">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/shop" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="footer-shop"
                >
                  Boutique
                </Link>
              </li>
              <li>
                <Link 
                  to="/nouveautes" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="footer-new"
                >
                  Nouveautés
                </Link>
              </li>
              <li>
                <Link 
                  to="/promotions" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="footer-promos"
                >
                  Promotions
                </Link>
              </li>
              <li>
                <Link 
                  to="/brands" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="footer-brands"
                >
                  Nos Marques
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h4 className="font-serif text-lg mb-6">Informations</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="footer-about"
                >
                  À Propos
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="footer-contact"
                >
                  Contact
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground">Livraison à Dakar</span>
              </li>
              <li>
                <span className="text-muted-foreground">Garantie Authenticité</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  Centre Commercial Sea Plaza<br />
                  Route de la Corniche Ouest<br />
                  Dakar, Sénégal
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a 
                  href="tel:+221774823661" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="footer-phone"
                >
                  +221 77 482 36 61
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a 
                  href="mailto:contact@senteurl.sn" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="footer-email"
                >
                  contact@senteurl.sn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="py-6 mb-6 border-y border-border/50 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Besoin d'aide ? Contactez-nous sur WhatsApp
          </p>
          <a 
            href="https://wa.me/221774823661?text=Bonjour%2C%20je%20souhaite%20des%20informations%20sur%20vos%20parfums."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <MessageCircle className="w-4 h-4" />
            +221 77 482 36 61
          </a>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Senteur L. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Paiement sécurisé
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              100% Authentique
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
