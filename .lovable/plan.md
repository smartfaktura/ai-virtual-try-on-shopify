
Short answer: the 1:1 box exists now, but the product previews are still wrong because the short-film product picker is still rendering raw `user_products.image_url` assets. Many of those are tall/narrow or have large blank margins, so `object-contain` inside a square naturally produces the thin center-strip effect from your screenshot. That means this is no longer just a modal layout bug — it is also a source-framing problem.

What I will change

1. Rebuild every short-film modal card to one strict structure
- fixed square media area (`1:1`)
- fixed footer below it
- title always visible at the bottom
- same card contract for Products, Scenes, and Models

2. Fix the product picker card layout in `ReferenceUploadPanel.tsx`
- make each card `w-full flex flex-col`
- keep the media area as a true square
- move the title into a dedicated bottom footer with stable height
- remove the current “title can disappear into the card body” behavior

3. Fix preview fitting behavior everywhere in short film
- product image centered in the square
- scale to the largest size possible without cutting off top or bottom
- keep full-product visibility
- update selected reference thumbnails too, because they still use `object-cover` and stay zoomed/cropped outside the modal

4. Fix the real source problem for products
- the current product picker still pulls from `/app/products` (`user_products`)
- if those raw assets remain too padded/tall, I will switch the short-film product picker to a better, tighter visual source instead of trying to solve bad framing with CSS alone
- I will also review whether the short-film product references should come from the more appropriate product-visual / try-on asset flow rather than the raw catalog hero image

Files I expect to change
- `src/components/app/video/short-film/ReferenceUploadPanel.tsx`
- possibly one related query/hook if I switch the product source away from raw `user_products`

Acceptance criteria
- every modal card shows a real full square preview
- product title is clearly visible in a footer under the image
- selected references are no longer zoomed/cropped
- products render as large as possible while still showing the full item
- no more thin center-strip previews unless the original asset itself is unusably padded, in which case I will replace the source

If you want me to continue in a new request, I’ll implement this card-layout fix first and then switch the product picker source if the raw product library still causes the strip effect.
