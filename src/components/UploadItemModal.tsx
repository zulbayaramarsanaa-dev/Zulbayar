import React, { useState } from 'react';
import { X, Upload, Plus, Image as ImageIcon, Check, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface UploadItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadProduct: (product: Partial<Product>) => Promise<void>;
}

// Preset studio photo options for quick selection if the user wants
const STUDIO_PRESETS = [
  { label: 'Technical Hoodie', url: '/src/assets/images/solo_technical_hoodie_1793542958627.jpg' },
  { label: 'Modular Backpack', url: '/src/assets/images/solo_modular_backpack_1793542960062.jpg' },
  { label: 'Titanium Timepiece', url: '/src/assets/images/solo_titanium_watch_1793542960813.jpg' },
  { label: 'Ceramic Tumbler', url: '/src/assets/images/solo_matte_tumbler_1793542961064.jpg' },
  { label: 'Technical Shell', url: '/src/assets/images/hero_solo_collection_1793542958234.jpg' },
];

export const UploadItemModal: React.FC<UploadItemModalProps> = ({
  isOpen,
  onClose,
  onUploadProduct,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Apparel' | 'Carry' | 'Objects & Tech' | 'Accessories'>('Apparel');
  const [originalPrice, setOriginalPrice] = useState<string>('200');
  const [salePrice, setSalePrice] = useState<string>('145');
  const [stockCount, setStockCount] = useState<string>('15');
  const [optionsStr, setOptionsStr] = useState('S, M, L, XL');
  const [imageUrl, setImageUrl] = useState(STUDIO_PRESETS[0].url);
  const [imagePreview, setImagePreview] = useState<string>(STUDIO_PRESETS[0].url);
  const [specsStr, setSpecsStr] = useState('Material: 100% Combed Cotton, Fit: Oversized Drop Shoulder, Origin: Made in Portugal');

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto discount math
  const numOrig = parseFloat(originalPrice) || 0;
  const numSale = parseFloat(salePrice) || 0;
  const discountPercent = numOrig > numSale && numOrig > 0 ? Math.round(((numOrig - numSale) / numOrig) * 100) : 0;
  const savings = numOrig > numSale ? numOrig - numSale : 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setImageUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Product title is required');
      return;
    }
    if (!numSale || numSale <= 0) {
      setErrorMessage('Please specify a valid sale price');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const parsedOptions = optionsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedSpecs = specsStr
        .split(',')
        .map((pair) => {
          const [label, ...rest] = pair.split(':');
          return {
            label: label?.trim() || 'Specification',
            value: rest.join(':').trim() || '',
          };
        })
        .filter((s) => s.value);

      await onUploadProduct({
        name: name.trim(),
        subtitle: subtitle.trim() || `Special Archive Sale · ${discountPercent}% Off`,
        description: description.trim() || 'Monochrome stealth equipment released on archive sale.',
        price: numSale,
        originalPrice: numOrig > numSale ? numOrig : Math.round(numSale * 1.3),
        category,
        images: [imageUrl],
        specs: parsedSpecs.length > 0 ? parsedSpecs : [{ label: 'Condition', value: 'Brand New In Box' }],
        options: parsedOptions.length > 0 ? parsedOptions : ['Standard'],
        stockCount: parseInt(stockCount, 10) || 10,
        inStock: true,
        isOnSale: true,
        isNew: true,
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to upload product');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 bg-[#161619] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100">
              <Tag className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-display">
                  Upload Item on Sale
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-300">
                  Owner Tool
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Add an item to the SOLO store. When ordered, customer details will come straight to your inbox.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body with 2-Column Layout (Inputs left, Live Preview right) */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form Inputs */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 font-mono">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Item Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SOLO Stealth Minimalist Overshirt"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Apparel">Apparel</option>
                  <option value="Carry">Carry & Bags</option>
                  <option value="Objects & Tech">Objects & Tech</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={stockCount}
                  onChange={(e) => setStockCount(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Pricing Matrix */}
            <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-850 space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Sale Pricing & Discount
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1">
                    Original Price ($)
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="200"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-emerald-400 mb-1 font-semibold">
                    Sale Price ($) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="145"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full bg-zinc-900 border border-emerald-800/80 rounded-lg px-3 py-2 text-sm text-emerald-300 font-mono font-bold"
                  />
                </div>
              </div>

              {discountPercent > 0 && (
                <div className="text-xs text-emerald-400 font-mono flex items-center justify-between pt-1">
                  <span>Customer Discount:</span>
                  <span className="font-bold">
                    {discountPercent}% OFF (Save ${savings.toFixed(2)})
                  </span>
                </div>
              )}
            </div>

            {/* Image Selector & Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-zinc-400">
                Item Photo (Upload or Select Studio Asset)
              </label>

              {/* Upload file button */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-zinc-400" />
                  <span>Choose Photo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-zinc-500">or pick studio asset below</span>
              </div>

              {/* Preset choices */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {STUDIO_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      setImagePreview(preset.url);
                    }}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                      imagePreview === preset.url
                        ? 'border-emerald-400 ring-2 ring-emerald-400/40'
                        : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Options / Sizes */}
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Sizes / Variants (comma-separated)
              </label>
              <input
                type="text"
                placeholder="S, M, L, XL or Standard"
                value={optionsStr}
                onChange={(e) => setOptionsStr(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Description & Craft Details
              </label>
              <textarea
                rows={2}
                placeholder="Heavyweight Japanese ripstop with weatherproof treatment..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isUploading ? (
                <span>Publishing to Catalog...</span>
              ) : (
                <>
                  <Tag className="w-4 h-4 text-zinc-950" />
                  <span>Publish Item on Sale (${numSale})</span>
                </>
              )}
            </button>
          </form>

          {/* Right Column: Real-Time Store Card Preview */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              <p className="text-xs font-mono uppercase text-zinc-500 mb-2">
                Live Storefront Card Preview
              </p>
              
              <div className="bg-[#121214] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                <div className="relative aspect-[4/3] w-full bg-zinc-950">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 text-[11px] font-mono tracking-wider uppercase text-emerald-400 bg-zinc-950/90 backdrop-blur-sm px-2 py-0.5 rounded border border-emerald-900/60 font-semibold">
                    {discountPercent > 0 ? `${discountPercent}% OFF SALE` : 'ON SALE'}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono tracking-wider uppercase">
                    <span>{category}</span>
                    <span aria-hidden="true">·</span>
                    <span>In Stock ({stockCount} units)</span>
                  </div>

                  <h3 className="text-base font-semibold text-white font-display truncate">
                    {name || 'Product Title'}
                  </h3>

                  <div className="flex items-baseline gap-2 pt-2 border-t border-zinc-800/80">
                    <span className="text-lg font-bold text-white font-mono tabular-nums">
                      ${numSale || 0}
                    </span>
                    {numOrig > numSale && (
                      <span className="text-xs text-zinc-500 line-through font-mono tabular-nums">
                        ${numOrig}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="text-xs text-emerald-400 font-mono font-medium ml-auto">
                        Save ${savings.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 text-xs text-zinc-400 space-y-1">
              <p className="text-zinc-200 font-medium">Automatic Order Transmittal</p>
              <p>
                As soon as a shopper purchases this item, the full order (customer name, phone, email, and shipping address) will trigger an immediate alert to you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
