

## Update Favicon

Copy the uploaded "V" logo image to the public directory and update `index.html` to reference it as the site favicon.

### Steps

1. Copy `user-uploads://FaviconVovvai.png` to `public/favicon.png`
2. Update `index.html` to replace the current favicon reference with:
   ```html
   <link rel="icon" href="/favicon.png" type="image/png">
   ```

