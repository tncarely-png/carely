'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  ImageIcon,
  GripVertical,
  Eye,
  EyeOff,
  Save,
  X,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Product {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  description: string | null;
  descriptionAr: string | null;
  emoji: string | null;
  imageUrl: string | null;
  price: number;
  currency: string | null;
  priceLabel: string | null;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  route: string | null;
  externalUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  name: string;
  nameAr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  emoji: string;
  imageUrl: string | null;
  price: number;
  priceLabel: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  route: string;
  externalUrl: string;
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  nameAr: '',
  slug: '',
  description: '',
  descriptionAr: '',
  emoji: '📦',
  imageUrl: null,
  price: 0,
  priceLabel: '',
  features: [],
  isActive: true,
  sortOrder: 0,
  route: '',
  externalUrl: '',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function SuperAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products?all=true');
      if (!res.ok) throw new Error('فشل تحميل المنتجات');
      const data = await res.json();
      setProducts(data.data || []);
    } catch {
      setError('حدث خطأ أثناء تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      nameAr: product.nameAr,
      slug: product.slug,
      description: product.description || '',
      descriptionAr: product.descriptionAr || '',
      emoji: product.emoji || '📦',
      imageUrl: product.imageUrl,
      price: product.price,
      priceLabel: product.priceLabel || '',
      features: product.features || [],
      isActive: product.isActive,
      sortOrder: product.sortOrder,
      route: product.route || '',
      externalUrl: product.externalUrl || '',
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, imageUrl: data.data.url }));
      }
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.nameAr || !form.slug) return;
    setSubmitting(true);
    try {
      const isEdit = !!editingProduct;
      const url = isEdit ? `/api/products/${editingProduct!.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setDialogOpen(false);
        fetchProducts();
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      }
    } catch {
      // silent
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (res.ok) {
        setProducts(prev =>
          prev.map(p => p.id === product.id ? { ...p, isActive: !product.isActive } : p)
        );
      }
    } catch {
      // silent
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setForm(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setForm(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 rounded-xl" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#888888' }} />
        <p className="mb-4" style={{ color: '#666666' }}>{error}</p>
        <Button onClick={fetchProducts} className="sa-btn-primary">
          <RefreshCw className="w-4 h-4 ml-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: '#888888' }}>
            {products.length} منتج
          </p>
        </div>
        <Button className="sa-btn-primary" onClick={openCreateDialog}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج
        </Button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="sa-card overflow-hidden transition-all duration-200"
            style={{
              opacity: product.isActive ? 1 : 0.5,
              border: product.isActive ? '1px solid #e5e5e5' : '1px dashed #ccc',
            }}
          >
            {/* Product Image / Emoji */}
            <div className="h-32 flex items-center justify-center" style={{ background: '#f9f9f9' }}>
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.nameAr}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl">{product.emoji || '📦'}</span>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-extrabold" style={{ color: '#000000' }}>
                    {product.nameAr}
                  </h3>
                  <p className="text-sm" style={{ color: '#888888' }} dir="ltr">
                    {product.name}
                  </p>
                </div>
                <Badge className={product.isActive ? 'sa-badge-active' : 'sa-badge-inactive'}>
                  {product.isActive ? 'مفعل' : 'معطل'}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-2">
                {product.price > 0 && (
                  <span className="text-lg font-bold" style={{ color: '#000000' }}>
                    {product.price.toFixed(2)} {product.currency}
                  </span>
                )}
                {product.priceLabel && (
                  <span className="text-sm" style={{ color: '#888888' }}>
                    ({product.priceLabel})
                  </span>
                )}
              </div>

              <p className="text-xs truncate" style={{ color: '#888888' }} dir="ltr">
                /{product.slug}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: '1px solid #f0f0f0' }}>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 sa-btn-primary py-1.5 text-xs"
                  onClick={() => openEditDialog(product)}
                >
                  <Edit3 className="w-3 h-3 ml-1" />
                  تعديل
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="py-1.5 px-3 text-xs"
                  style={{ border: '1px solid #e0e0e0' }}
                  onClick={() => handleToggleActive(product)}
                >
                  {product.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="py-1.5 px-3 text-xs"
                      style={{ border: '1px solid #fecaca', color: '#dc2626' }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>حذف المنتج</AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد من حذف <strong>{product.nameAr}</strong>؟ هذا الإجراء لا يمكن التراجع عنه.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(product.id)}
                        style={{ background: '#dc2626', color: '#ffffff' }}
                      >
                        حذف
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-16 sa-card">
          <p className="text-5xl mb-4">📦</p>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#000000' }}>
            لا توجد منتجات بعد
          </h3>
          <p className="text-sm mb-4" style={{ color: '#888888' }}>
            أضف أول منتج لمتجرك
          </p>
          <Button className="sa-btn-primary" onClick={openCreateDialog}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة منتج
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* Image Upload */}
            <div>
              <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                صورة المنتج
              </Label>
              <div className="flex items-center gap-4">
                <div
                  className="w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ background: '#f5f5f5', border: '1px dashed #d0d0d0' }}
                >
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">{form.emoji || '📦'}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <Button variant="outline" size="sm" className="sa-btn-primary text-xs" asChild>
                      <span>
                        {uploading ? (
                          <>
                            <RefreshCw className="w-3 h-3 ml-1 animate-spin" />
                            جاري الرفع...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3 ml-1" />
                            رفع صورة
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                  {form.imageUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-red-600"
                      onClick={() => setForm(prev => ({ ...prev, imageUrl: null }))}
                    >
                      <X className="w-3 h-3 ml-1" />
                      إزالة
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Emoji */}
            <div>
              <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                أيقونة (Emoji)
              </Label>
              <Input
                value={form.emoji}
                onChange={(e) => setForm(prev => ({ ...prev, emoji: e.target.value }))}
                placeholder="📦"
                className="w-20 text-center text-2xl rounded-xl"
                style={{ border: '1px solid #e0e0e0' }}
              />
            </div>

            {/* Name AR + Name EN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                  الاسم (عربي) *
                </Label>
                <Input
                  value={form.nameAr}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, nameAr: e.target.value }));
                    if (!editingProduct) {
                      setForm(prev => ({
                        ...prev,
                        slug: slugify(e.target.value),
                      }));
                    }
                  }}
                  placeholder="كوستوديو"
                  className="rounded-xl"
                  style={{ border: '1px solid #e0e0e0' }}
                />
              </div>
              <div>
                <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                  الاسم (إنجليزي) *
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Qustodio"
                  dir="ltr"
                  className="rounded-xl"
                  style={{ border: '1px solid #e0e0e0' }}
                />
              </div>
            </div>

            {/* Slug */}
            <div>
              <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                الرابط (Slug) *
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: '#888888' }}>/</span>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                  placeholder="qustodio"
                  dir="ltr"
                  className="rounded-xl"
                  style={{ border: '1px solid #e0e0e0' }}
                />
              </div>
            </div>

            {/* Description AR + EN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                  الوصف (عربي)
                </Label>
                <Textarea
                  value={form.descriptionAr}
                  onChange={(e) => setForm(prev => ({ ...prev, descriptionAr: e.target.value }))}
                  placeholder="حماية أطفالك على النت"
                  rows={3}
                  className="rounded-xl resize-none"
                  style={{ border: '1px solid #e0e0e0' }}
                />
              </div>
              <div>
                <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                  الوصف (إنجليزي)
                </Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Parental control app"
                  rows={3}
                  dir="ltr"
                  className="rounded-xl resize-none"
                  style={{ border: '1px solid #e0e0e0' }}
                />
              </div>
            </div>

            {/* Price + Label */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                  السعر (دت)
                </Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="89"
                  dir="ltr"
                  className="rounded-xl"
                  style={{ border: '1px solid #e0e0e0' }}
                />
              </div>
              <div>
                <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                  نص السعر (مثال: من 89 دت / سنة)
                </Label>
                <Input
                  value={form.priceLabel}
                  onChange={(e) => setForm(prev => ({ ...prev, priceLabel: e.target.value }))}
                  placeholder="من 89 دت / سنة"
                  className="rounded-xl"
                  style={{ border: '1px solid #e0e0e0' }}
                />
              </div>
            </div>

            {/* SPA Route */}
            <div>
              <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                مسار الموقع الداخلي (SPA Route)
              </Label>
              <Input
                value={form.route}
                onChange={(e) => setForm(prev => ({ ...prev, route: e.target.value }))}
                placeholder="qustodio-app"
                dir="ltr"
                className="rounded-xl"
                style={{ border: '1px solid #e0e0e0' }}
              />
              <p className="text-xs mt-1" style={{ color: '#888888' }}>
                اتركه فارغاً إذا كان المنتج قريبًا
              </p>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-4">
              <div>
                <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                  ترتيب العرض
                </Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  dir="ltr"
                  className="w-24 rounded-xl"
                  style={{ border: '1px solid #e0e0e0' }}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm(prev => ({ ...prev, isActive: checked }))}
                />
                <Label className="text-sm font-bold" style={{ color: '#000000' }}>
                  منتج مفعل
                </Label>
              </div>
            </div>

            {/* Features */}
            <div>
              <Label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
                المميزات
              </Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  placeholder="أضف ميزة..."
                  className="flex-1 rounded-xl"
                  style={{ border: '1px solid #e0e0e0' }}
                />
                <Button
                  variant="outline"
                  onClick={addFeature}
                  className="sa-btn-primary px-3"
                  disabled={!newFeature.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {form.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ background: '#f5f5f5' }}
                  >
                    <span className="text-sm flex-1" style={{ color: '#000000' }}>
                      ✓ {feature}
                    </span>
                    <button
                      onClick={() => removeFeature(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid #e5e5e5' }}>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !form.name || !form.nameAr || !form.slug}
                className="sa-btn-primary flex-1"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl"
                style={{ border: '1px solid #e0e0e0' }}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
