import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Loader2, MessageCircle, Instagram, Facebook } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-card/30 border-b border-border py-16">
        <div className="container-custom">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">
            Contactez-nous
          </p>
          <h1 className="font-serif text-4xl md:text-5xl" data-testid="contact-title">
            Nous Sommes à Votre Écoute
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl">
            Une question sur un parfum ? Besoin de conseils personnalisés ? 
            Notre équipe passionnée est là pour vous accompagner dans votre découverte olfactive.
          </p>
        </div>
      </div>

      <div className="container-custom py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-12">
            <div>
              <h2 className="font-serif text-2xl mb-8">Nos Coordonnées</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Adresse</h3>
                    <p className="text-muted-foreground">
                      Centre Commercial Sea Plaza<br />
                      Route de la Corniche Ouest<br />
                      Dakar, Sénégal
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Téléphone</h3>
                    <a 
                      href="tel:+221774823661" 
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="contact-phone"
                    >
                      +221 77 482 36 61
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      Appels et WhatsApp disponibles
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">WhatsApp</h3>
                    <a 
                      href="https://wa.me/221774823661" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="contact-whatsapp"
                    >
                      Discuter sur WhatsApp
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      Réponse rapide garantie
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Email</h3>
                    <a 
                      href="mailto:contact@senteurl.sn" 
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="contact-email"
                    >
                      contact@senteurl.sn
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Horaires d'ouverture</h3>
                    <p className="text-muted-foreground">
                      Lundi - Samedi : 9h00 - 20h00<br />
                      Dimanche : 10h00 - 18h00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="font-medium mb-4">Suivez-nous</h3>
              <div className="flex gap-4">
                <a 
                  href="https://instagram.com/senteurl" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors"
                  data-testid="social-instagram"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://facebook.com/senteurl" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors"
                  data-testid="social-facebook"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://wa.me/221774823661" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors"
                  data-testid="social-whatsapp"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="aspect-video bg-card border border-border relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <p className="font-medium">Centre Commercial Sea Plaza</p>
                  <p className="text-sm text-muted-foreground">Route de la Corniche Ouest</p>
                  <p className="text-sm text-muted-foreground">Dakar, Sénégal</p>
                  <a 
                    href="https://maps.google.com/?q=Sea+Plaza+Dakar" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-sm text-primary hover:underline"
                  >
                    Voir sur Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-serif text-2xl mb-8">Envoyez-nous un Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    className="h-12 rounded-none"
                    required
                    data-testid="contact-input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+221 77 000 00 00"
                    className="h-12 rounded-none"
                    required
                    data-testid="contact-input-phone"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  className="h-12 rounded-none"
                  required
                  data-testid="contact-input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Sujet *</Label>
                <Select 
                  value={formData.subject} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                >
                  <SelectTrigger className="h-12 rounded-none" data-testid="contact-select-subject">
                    <SelectValue placeholder="Choisir un sujet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conseil">Conseil parfum</SelectItem>
                    <SelectItem value="commande">Question sur une commande</SelectItem>
                    <SelectItem value="disponibilite">Disponibilité d'un produit</SelectItem>
                    <SelectItem value="livraison">Livraison</SelectItem>
                    <SelectItem value="retour">Retour ou échange</SelectItem>
                    <SelectItem value="partenariat">Partenariat</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Comment pouvons-nous vous aider ?"
                  rows={6}
                  className="rounded-none"
                  required
                  data-testid="contact-input-message"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !formData.subject}
                className="w-full h-14 rounded-none uppercase tracking-widest text-xs font-bold bg-primary hover:bg-primary/90"
                data-testid="contact-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Envoyer le message
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Nous vous répondrons dans les 24 heures ouvrées.
              </p>
            </form>

            {/* Quick Contact */}
            <div className="mt-12 p-6 bg-card border border-border">
              <h3 className="font-medium mb-4">Besoin d'une réponse rapide ?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Contactez-nous directement sur WhatsApp pour une assistance immédiate.
              </p>
              <a 
                href="https://wa.me/221774823661?text=Bonjour%2C%20je%20souhaite%20des%20informations%20sur%20vos%20parfums."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <MessageCircle className="w-4 h-4" />
                Démarrer une conversation WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="py-16 bg-card/30 border-t border-border">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl md:text-3xl">Questions Fréquentes</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <h3 className="font-medium">Vos parfums sont-ils authentiques ?</h3>
              <p className="text-sm text-muted-foreground">
                Oui, tous nos parfums sont 100% authentiques et proviennent directement 
                des distributeurs officiels des grandes maisons de parfumerie.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Livrez-vous dans tout Dakar ?</h3>
              <p className="text-sm text-muted-foreground">
                Nous livrons dans tout Dakar et ses environs. Les délais de livraison 
                varient généralement entre 24h et 48h selon votre localisation.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Puis-je tester les parfums avant d'acheter ?</h3>
              <p className="text-sm text-muted-foreground">
                Absolument ! Visitez notre boutique au Sea Plaza pour découvrir et 
                tester notre collection. Notre équipe sera ravie de vous conseiller.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Proposez-vous l'emballage cadeau ?</h3>
              <p className="text-sm text-muted-foreground">
                Oui, nous proposons un service d'emballage cadeau élégant sur demande 
                pour toutes vos occasions spéciales.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
