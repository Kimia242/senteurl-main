import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Heart, Sparkles, Users, MapPin, Shield, Truck, Gift } from 'lucide-react';
import { Button } from '../components/ui/button';

const AboutPage = () => {
  const heroImage = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200";
  const storyImage = "https://images.unsplash.com/photo-1644820850778-034b767387dd?w=600";
  const teamImage = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600";

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Senteur L Dakar"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
              Notre Histoire
            </p>
            <h1 className="font-serif text-5xl md:text-6xl mb-6" data-testid="about-title">
              Bienvenue chez<br />Senteur L
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Votre destination privilégiée pour les parfums de luxe à Dakar. 
              Depuis notre création, nous nous engageons à offrir les fragrances les plus raffinées 
              aux amateurs de parfumerie au Sénégal.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">
                Notre Mission
              </p>
              <h2 className="font-serif text-3xl md:text-4xl">
                L'Excellence au Service de l'Élégance Sénégalaise
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Senteur L est née d'une passion profonde pour l'art de la parfumerie et d'un désir 
                de partager les plus belles créations olfactives avec la clientèle dakaroise. 
                Nous croyons fermement que chaque personne mérite de porter une fragrance qui 
                reflète sa personnalité unique et sublime sa présence.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Notre boutique, située au cœur de Dakar, est un espace dédié à la découverte 
                sensorielle. Nous y présentons une sélection minutieuse des plus grandes maisons 
                de parfumerie mondiale : Chanel, Dior, Guerlain, Tom Ford, Yves Saint Laurent, 
                Armani et bien d'autres.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Chaque parfum de notre collection a été choisi pour sa qualité exceptionnelle, 
                son originalité et sa capacité à créer des émotions. Que vous recherchiez un 
                parfum pour le quotidien, une occasion spéciale ou un cadeau inoubliable, 
                notre équipe est là pour vous guider vers la fragrance parfaite.
              </p>
              <Link to="/shop">
                <Button className="h-12 px-8 rounded-none uppercase tracking-widest text-xs bg-primary hover:bg-primary/90">
                  Découvrir nos parfums
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <img
                src={storyImage}
                alt="Collection de parfums Senteur L"
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border-2 border-primary/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-spacing bg-card/30 border-y border-border">
        <div className="container-custom">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">
              Nos Valeurs
            </p>
            <h2 className="font-serif text-3xl md:text-4xl">
              Ce qui nous définit
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-card border border-border/50">
              <Award className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-serif text-xl mb-3">Authenticité</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                100% de produits originaux garantis. Chaque parfum provient directement des 
                maisons de parfumerie officielles.
              </p>
            </div>

            <div className="text-center p-8 bg-card border border-border/50">
              <Sparkles className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-serif text-xl mb-3">Excellence</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Une sélection rigoureuse des meilleures fragrances du monde pour satisfaire 
                les goûts les plus exigeants.
              </p>
            </div>

            <div className="text-center p-8 bg-card border border-border/50">
              <Heart className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-serif text-xl mb-3">Passion</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Un amour sincère pour l'art de la parfumerie qui nous pousse à toujours 
                rechercher les créations les plus exceptionnelles.
              </p>
            </div>

            <div className="text-center p-8 bg-card border border-border/50">
              <Users className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-serif text-xl mb-3">Service</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Des conseils personnalisés et un accompagnement sur mesure pour vous aider 
                à trouver votre signature olfactive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img
                src={teamImage}
                alt="Équipe Senteur L"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">
                  Pourquoi nous choisir
                </p>
                <h2 className="font-serif text-3xl md:text-4xl">
                  L'Expérience Senteur L
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Garantie d'Authenticité</h3>
                    <p className="text-sm text-muted-foreground">
                      Tous nos parfums sont 100% authentiques, achetés directement auprès 
                      des distributeurs officiels.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Livraison à Dakar</h3>
                    <p className="text-sm text-muted-foreground">
                      Service de livraison rapide et sécurisé dans tout Dakar et ses environs.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Emballage Cadeau</h3>
                    <p className="text-sm text-muted-foreground">
                      Emballage cadeau élégant disponible sur demande pour toutes vos 
                      occasions spéciales.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Conseils d'Experts</h3>
                    <p className="text-sm text-muted-foreground">
                      Notre équipe passionnée vous guide dans le choix du parfum idéal 
                      selon votre personnalité.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-card/30 border-y border-border">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-serif text-4xl md:text-5xl text-primary mb-2">6+</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Marques Prestigieuses</p>
            </div>
            <div>
              <p className="font-serif text-4xl md:text-5xl text-primary mb-2">50+</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Fragrances Uniques</p>
            </div>
            <div>
              <p className="font-serif text-4xl md:text-5xl text-primary mb-2">100%</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Produits Authentiques</p>
            </div>
            <div>
              <p className="font-serif text-4xl md:text-5xl text-primary mb-2">5★</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Satisfaction Client</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-spacing">
        <div className="container-custom text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">
            Prêt à découvrir ?
          </p>
          <h2 className="font-serif text-3xl md:text-4xl mb-6">
            Trouvez votre signature olfactive
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Explorez notre collection et laissez-vous séduire par des fragrances 
            qui racontent votre histoire et subliment chaque moment de votre vie.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/shop">
              <Button className="h-12 px-8 rounded-none uppercase tracking-widest text-xs bg-primary hover:bg-primary/90">
                Explorer la boutique
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="h-12 px-8 rounded-none uppercase tracking-widest text-xs">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
