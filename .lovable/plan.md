

# Upgrade Add Product Modal — Premium UI/UX

## Overview

Refine the Add Product modal to match the app's luxury-restraint aesthetic with cleaner layout, better visual hierarchy, less text clutter, and a more polished feel throughout all four tabs.

---

## Changes

### 1. `src/components/app/AddProductModal.tsx` — Modal Shell

**Current issues:**
- Generic dialog header with dense description text
- Tab bar uses default shadcn styling (boxy, muted background pills)
- No visual refinement on the container

**Improvements:**
- Remove the `DialogDescription` entirely — the tab labels make it self-explanatory
- Style the tab bar as a borderless underline/pill strip with tighter spacing: `bg-transparent` with `rounded-full` individual triggers and a subtle active state
- Add `p-0` to dialog content and use internal padding sections for better visual grouping
- Widen slightly to `sm:max-w-[580px]` (tighter, more focused)

### 2. `src/components/app/ManualProductTab.tsx` — Upload Tab

**Current issues:**
- Heavy "Product Images" and "Product Details" section headers with bold text
- Drop zone is large and text-heavy (format info, file limits)
- The Separator between images and details feels clunky
- The "Sophia, Art Director" pro tip is a lot of text for a modal
- Footer buttons feel disconnected

**Improvements:**
- Remove section headers ("Product Images", "Product Details") — the flow is self-evident (images first, then fields)
- Simplify the drop zone: smaller padding (py-8), keep just the icon and one line "Drop images or browse" with the format info as a subtle single line below
- Remove the `Separator` between images and form fields — use spacing (`space-y-5`) instead
- Condense the pro tip: shorter text, remove the avatar, just a subtle `info` icon with "Cover image is used as AI reference"
- Make form fields more compact: reduce gap between label and input, use smaller helper text
- Footer: add subtle top border, keep cancel as ghost and save as primary with rounded-lg styling

### 3. `src/components/app/StoreImportTab.tsx` — Store URL Tab

**Current issues:**
- The "Works with Shopify, WooCommerce..." paragraph is verbose
- Preview card has basic border styling

**Improvements:**
- Replace the paragraph with inline platform badges: small icons/badges for Shopify, Etsy, Amazon, WooCommerce in a row — cleaner than a sentence
- Give the extracted product preview card a subtle `bg-muted/30` background with `rounded-xl` for a card-in-card feel
- Tighter spacing overall

### 4. `src/components/app/CsvImportTab.tsx` — CSV Tab

**Current issues:**
- Drop zone has a lot of column-name text (`code` tags)
- Table styling is basic

**Improvements:**
- Simplify the column hint: just "Required: title column. Optional: type, image_url, description" — shorter, cleaner
- Give the table container `rounded-xl` and `overflow-hidden` for polished edges
- Subtle alternating row background

### 5. `src/components/app/MobileUploadTab.tsx` — Mobile Tab

**Current issues:**
- QR code section has standard card wrapping
- "Waiting for upload..." text feels flat

**Improvements:**
- Give QR container a centered layout with subtle shadow and `rounded-2xl`
- Style the waiting indicator as a more premium pill badge: `bg-muted/50 rounded-full px-3 py-1.5` with the pulsing dot

### 6. `src/components/app/ProductImageGallery.tsx` — Image Tiles

**Current issues:**
- Tiles are `w-24 h-24` which feels a bit small inside a modal
- "Cover" label at bottom is functional but could be more refined

**Improvements:**
- No size change needed (w-24 works well in the narrower modal)
- Add `backdrop-blur-sm` to the Cover label for a glass effect
- Smoother hover transitions

---

## Visual Summary

The overall goal is:
- **Less text** — remove redundant labels and descriptions, let the UI speak
- **Better grouping** — spacing instead of heavy separators/headers
- **Premium feel** — rounded corners, subtle backgrounds, refined tab bar
- **Consistency** — match the luxury-restraint aesthetic used throughout the app

## Files Changed

1. `src/components/app/AddProductModal.tsx` — Cleaner shell, refined tab bar
2. `src/components/app/ManualProductTab.tsx` — Simplified dropzone, removed section headers, condensed pro tip
3. `src/components/app/StoreImportTab.tsx` — Platform badges, refined preview card
4. `src/components/app/CsvImportTab.tsx` — Cleaner column hints, polished table
5. `src/components/app/MobileUploadTab.tsx` — Premium QR layout, refined waiting state
6. `src/components/app/ProductImageGallery.tsx` — Glass-effect Cover label

