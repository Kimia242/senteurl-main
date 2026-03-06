import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditingCategory(null);
  };

  const openEditDialog = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
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

      if (editingCategory) {
        await axios.put(`${API}/categories/${editingCategory.id}`, { name: formData.name });
        toast.success('Catégorie mise à jour');
      } else {
        await axios.post(`${API}/categories`, { name: formData.name });
        toast.success('Catégorie créée');
      }

      setDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      await axios.delete(`${API}/categories/${categoryId}`);
      toast.success('Catégorie supprimée');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl" data-testid="admin-categories-title">
            Gestion des Catégories
          </h1>
          <p className="text-muted-foreground mt-1">{categories.length} catégories</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button 
              className="h-10 px-6 rounded-none bg-primary hover:bg-primary/90"
              data-testid="add-category-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une catégorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="rounded-none"
                  required
                  data-testid="category-input-name"
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
                  data-testid="category-submit-btn"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    editingCategory ? 'Mettre à jour' : 'Créer'
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
      ) : categories.length === 0 ? (
        <div className="bg-card border border-border p-8 text-center text-muted-foreground">
          Aucune catégorie. Ajoutez votre première catégorie.
        </div>
      ) : (
        <div className="bg-card border border-border">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th className="w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} data-testid={`category-row-${category.id}`}>
                  <td className="font-medium">{category.name}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditDialog(category)}
                        className="p-2 hover:bg-accent transition-colors"
                        data-testid={`edit-category-${category.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 hover:bg-destructive/20 text-destructive transition-colors"
                        data-testid={`delete-category-${category.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
