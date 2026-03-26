import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { toast } from 'sonner';
import { ArrowLeft, Save, Image as ImageIcon, Plus, X, Loader2, Upload, Video, Trash2, DollarSign, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { uploadFile, uploadMultipleFiles } from '../lib/upload';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    discountPrice: 0,
    category: (typeof settings.categories[0] === 'string' ? settings.categories[0] : settings.categories[0]?.name) || '',
    stock: 0,
    images: [],
    videoUrl: '',
    sizes: [],
    colors: [],
    featured: false,
    trending: false,
    rating: 5,
    reviewsCount: 0,
    createdAt: new Date().toISOString(),
  });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const docRef = doc(db, 'products', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFormData({ id: docSnap.id, ...docSnap.data() } as Product);
          } else {
            toast.error('Product not found');
            navigate('/admin/products');
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditing, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImagesCount = formData.images?.length || 0;
    if (currentImagesCount + files.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setUploading(true);
    try {
      const idToken = await user?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');

      const urls = await uploadMultipleFiles(files, idToken);
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...urls]
      }));
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const idToken = await user?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');

      const url = await uploadFile(file, idToken);
      if (url) {
        setFormData(prev => ({ ...prev, videoUrl: url }));
        toast.success('Video uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const removeVideo = () => {
    setFormData(prev => ({ ...prev, videoUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.images || formData.images.length === 0) {
      toast.error('At least one product image is required');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        stock: Number(formData.stock),
        updatedAt: new Date().toISOString(),
      };

      if (isEditing) {
        await updateDoc(doc(db, 'products', id), data as any);
        toast.success('Product updated successfully');
      } else {
        await addDoc(collection(db, 'products'), data);
        toast.success('Product added successfully');
      }
      navigate('/admin/products');
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-[#0a0a0a] min-h-screen text-white space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-gray-400 font-bold text-sm">Fill in the details below to {isEditing ? 'update' : 'create'} your product.</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || uploading}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-black transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          <span>{isEditing ? 'Update Product' : 'Save Product'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-6">
            <h2 className="text-xl font-black flex items-center gap-3">
              <Plus className="h-5 w-5 text-emerald-500" />
              Basic Information
            </h2>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Product Name</label>
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold text-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description</label>
              <textarea
                required
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold text-white resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                <select
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold text-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {settings.categories.map(category => {
                    const name = typeof category === 'string' ? category : category.name;
                    return <option key={name} value={name}>{name}</option>;
                  })}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Stock Level</label>
                <input
                  type="number"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold text-white"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-6">
            <h2 className="text-xl font-black flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Regular Price (৳)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold text-white"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Discount Price (Optional)</label>
                <input
                  type="number"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold text-white"
                  value={formData.discountPrice || ''}
                  onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Options */}
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-emerald-500" />
                Images
              </h2>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {formData.images?.length || 0}/10
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {formData.images?.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {(formData.images?.length || 0) < 10 && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-emerald-500 hover:text-emerald-500 transition-all bg-white/5"
                >
                  {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                  <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                </button>
              )}
            </div>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
            <p className="text-[10px] text-gray-500 font-bold text-center">Min 1, Max 10 photos. JPG, PNG supported.</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-6">
            <h2 className="text-xl font-black flex items-center gap-3">
              <Video className="h-5 w-5 text-emerald-500" />
              Product Video
            </h2>
            
            {formData.videoUrl ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group">
                <video src={formData.videoUrl} className="w-full h-full object-cover" controls />
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-8 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-emerald-500 hover:text-emerald-500 transition-all bg-white/5"
              >
                {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Video className="h-6 w-6" />}
                <span className="text-[10px] font-black uppercase tracking-widest">Upload Video</span>
              </button>
            )}
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoUpload}
              accept="video/*"
              className="hidden"
            />
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-6">
            <h2 className="text-xl font-black flex items-center gap-3">
              <Settings className="h-5 w-5 text-emerald-500" />
              Visibility
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-emerald-500/5 transition-all group border border-white/5">
                <span className="font-bold text-gray-300 group-hover:text-emerald-500">Featured Product</span>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-emerald-600 focus:ring-emerald-500"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-emerald-500/5 transition-all group border border-white/5">
                <span className="font-bold text-gray-300 group-hover:text-emerald-500">Trending Now</span>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-emerald-600 focus:ring-emerald-500"
                  checked={formData.trending}
                  onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                />
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
