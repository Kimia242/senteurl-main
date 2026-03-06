import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Search, X } from 'lucide-react';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { cn, formatPriceUSD } from '@/lib/utils';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    gender: 'unisex',
    stock: '0',
    brand_id: '',
    category_id: '',
    image_url: '',
    is_new: false,
    is_promotion: false,
    discount_percentage: '',
    notes: '',
    volume: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, brandsRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/products?limit=100`),
        axios.get(`${API}/brands`),
        axios.get(`${API}/categories`)
      ]);
      setProducts(productsRes.data);
      setBrands(brandsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      gender: 'unisex',
      stock: '0',
      brand_id: '',
      category_id: '',
      image_url: '',
      is_new: false,
      is_promotion: false,
      discount_percentage: '',
      notes: '',
      volume: ''
    });
    setEditingProduct(null);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      gender: product.gender,
      stock: product.stock.toString(),
      brand_id: product.brand_id,
      category_id: product.category_id,
      image_url: product.image_url || '',
      is_new: product.is_new,
      is_promotion: product.is_promotion,
      discount_percentage: product.discount_percentage?.toString() || '',
      notes: product.notes || '',
      volume: product.volume || ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.brand_id || !formData.category_id) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        gender: formData.gender,
        stock: parseInt(formData.stock),
        brand_id: formData.brand_id,
        category_id: formData.category_id,
        image_url: formData.image_url || null,
        is_new: formData.is_new,
        is_promotion: formData.is_promotion,
        discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : null,
        notes: formData.notes || null,
        volume: formData.volume || null
      };

      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, payload);
        toast.success('Produit mis à jour');
      } else {
        await axios.post(`${API}/products`, payload);
        toast.success('Produit créé');
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      await axios.delete(`${API}/products/${productId}`);
      toast.success('Produit supprimé');
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBrandName = (brandId) => brands.find(b => b.id === brandId)?.name || 'N/A';
  const getCategoryName = (catId) => categories.find(c => c.id === catId)?.name || 'N/A';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl" data-testid="admin-products-title">
            Gestion des Produits
          </h1>
          <p className="text-muted-foreground mt-1">{products.length} produits</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button 
              className="h-10 px-6 rounded-none bg-primary hover:bg-primary/90"
              data-testid="add-product-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="rounded-none"
                    required
                    data-testid="product-input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand_id">Marque *</Label>
                  <Select 
                    value={formData.brand_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, brand_id: value }))}
                  >
                    <SelectTrigger className="rounded-none" data-testid="product-select-brand">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_id">Catégorie *</Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger className="rounded-none" data-testid="product-select-category">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Prix *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="rounded-none"
                    required
                    data-testid="product-input-price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="rounded-none"
                    required
                    data-testid="product-input-stock"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Genre *</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger className="rounded-none" data-testid="product-select-gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="femme">Pour Elle</SelectItem>
                      <SelectItem value="homme">Pour Lui</SelectItem>
                      <SelectItem value="unisex">Unisexe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volume">Volume</Label>
                  <Input
                    id="volume"
                    value={formData.volume}
                    onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
                    placeholder="ex: 100ml"
                    className="rounded-none"
                    data-testid="product-input-volume"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="image_url">URL de l'image</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://..."
                    className="rounded-none"
                    data-testid="product-input-image"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="rounded-none"
                    data-testid="product-input-description"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="notes">Notes olfactives</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Rose, Jasmin, Vanille..."
                    className="rounded-none"
                    data-testid="product-input-notes"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.is_new}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_new: checked }))}
                      data-testid="product-checkbox-new"
                    />
                    <span className="text-sm">Nouveauté</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.is_promotion}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_promotion: checked }))}
                      data-testid="product-checkbox-promo"
                    />
                    <span className="text-sm">En promotion</span>
                  </label>
                </div>

                {formData.is_promotion && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="original_price">Prix original</Label>
                      <Input
                        id="original_price"
                        type="number"
                        step="0.01"
                        value={formData.original_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
                        className="rounded-none"
                        data-testid="product-input-original-price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount_percentage">Réduction (%)</Label>
                      <Input
                        id="discount_percentage"
                        type="number"
                        value={formData.discount_percentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: e.target.value }))}
                        className="rounded-none"
                        data-testid="product-input-discount"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-4">
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
                  data-testid="product-submit-btn"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    editingProduct ? 'Mettre à jour' : 'Créer'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-none"
            data-testid="product-search-input"
          />
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="bg-card border border-border">
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-card border border-border p-8 text-center text-muted-foreground">
          Aucun produit trouvé
        </div>
      ) : (
        <div className="bg-card border border-border overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Nom</th>
                <th>Marque</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} data-testid={`product-row-${product.id}`}>
                  <td>
                    <div className="w-12 h-16 bg-muted overflow-hidden">
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.volume}</p>
                  </td>
                  <td>{getBrandName(product.brand_id)}</td>
                  <td>
                    <span className="text-primary">{formatPriceUSD(product.price)}</span>
                  </td>
                  <td>
                    <span className={cn(
                      'px-2 py-1 text-xs',
                      product.stock <= 0 && 'bg-red-500/20 text-red-400',
                      product.stock > 0 && product.stock <= 5 && 'bg-amber-500/20 text-amber-400',
                      product.stock > 5 && 'bg-emerald-500/20 text-emerald-400'
                    )}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {product.is_new && (
                        <span className="px-2 py-0.5 text-xs badge-new">Nouveau</span>
                      )}
                      {product.is_promotion && (
                        <span className="px-2 py-0.5 text-xs badge-promo">Promo</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditDialog(product)}
                        className="p-2 hover:bg-accent transition-colors"
                        data-testid={`edit-product-${product.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-destructive/20 text-destructive transition-colors"
                        data-testid={`delete-product-${product.id}`}
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

export default AdminProducts;
