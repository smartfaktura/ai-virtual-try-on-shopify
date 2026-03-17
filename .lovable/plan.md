

## Upgrade Products Empty State Icon

Replace the plain `Package` icon with a more expressive, composed icon element — a styled container with a layered look (e.g., a `ShoppingBag` or `ImagePlus` icon with a subtle gradient background circle), similar to how polished empty states use decorative wrappers.

### Changes

**`src/pages/Products.tsx`** (line ~244)

Replace:
```tsx
icon={<Package className="w-12 h-12" />}
```

With a composed icon element using `ImagePlus` (since products are about visuals) wrapped in a soft gradient circle:
```tsx
icon={
  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
    <ImagePlus className="w-8 h-8 text-primary/60" />
  </div>
}
```

- Swap `Package` import for `ImagePlus` (already importing `Image as ImageIcon`, so `ImagePlus` fits the product-photo theme)
- The gradient wrapper gives it depth and a modern, branded feel matching the app's design language

