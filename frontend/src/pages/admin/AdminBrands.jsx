import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', logo_url: '' });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/brands`);
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', logo_url: '' });
    setEditingBrand(null);
  };

  const openEditDialog = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logo_url: brand.logo_url || ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Le nom est requis');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        description: formData.description || null,
        logo_url: formData.logo_url || null
      };

      if (editingBrand) {
        await axios.put(`${API}/brands/${editingBrand.id}`, payload);
        toast.success('Marque mise à jour');
      } else {
        await axios.post(`${API}/brands`, payload);
        toast.success('Marque créée');
      }

      setDialogOpen(false);
      resetForm();
      fetchBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (brandId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette marque ?')) return;

    try {
      await axios.delete(`${API}/brands/${brandId}`);
      toast.success('Marque supprimée');
      fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl" data-testid="admin-brands-title">
            Gestion des Marques
          </h1>
          <p className="text-muted-foreground mt-1">{brands.length} marques</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button 
              className="h-10 px-6 rounded-none bg-primary hover:bg-primary/90"
              data-testid="add-brand-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une marque
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {editingBrand ? 'Modifier la marque' : 'Nouvelle marque'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="rounded-none"
                  required
                  data-testid="brand-input-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="rounded-none"
                  data-testid="brand-input-description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">URL du logo</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                  placeholder="https://..."
                  className="rounded-none"
                  data-testid="brand-input-logo"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="rounded-none"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-none bg-primary hover:bg-primary/90"
                  data-testid="brand-submit-btn"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    editingBrand ? 'Mettre à jour' : 'Créer'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="bg-card border border-border p-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
        </div>
      ) : brands.length === 0 ? (
        <div className="bg-card border border-border p-8 text-center text-muted-foreground">
          Aucune marque. Ajoutez votre première marque.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div 
              key={brand.id} 
              className="bg-card border border-border p-6"
              data-testid={`brand-card-${brand.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {brand.logo_url && (
                    <img 
                      src={brand.logo_url} 
                      alt={brand.name}
                      className="w-12 h-12 object-cover"
                    />
                  )}
                  <h3 className="font-serif text-lg">{brand.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditDialog(brand)}
                    className="p-2 hover:bg-accent transition-colors"
                    data-testid={`edit-brand-${brand.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="p-2 hover:bg-destructive/20 text-destructive transition-colors"
                    data-testid={`delete-brand-${brand.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {brand.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {brand.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBrands;
