import { Store, Upload, ShoppingBag, Globe } from 'lucide-react';

const integrations = [
  { icon: ShoppingBag, name: 'Shopify', description: 'One-click import from your Shopify store' },
  { icon: Store, name: 'WooCommerce', description: 'Sync products from WooCommerce' },
  { icon: Upload, name: 'Direct Upload', description: 'Drag & drop any product image' },
  { icon: Globe, name: 'Any Platform', description: 'Works with any e-commerce or social platform' },
];

export function IntegrationSection() {
  return (
    <section className="py-20 sm:py-28 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Works With Your Existing Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No e-commerce store needed. Upload any product image and start generating professional photos in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {integrations.map((int) => (
            <div
              key={int.name}
              className="text-center p-6 rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                <int.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">{int.name}</h3>
              <p className="text-xs text-muted-foreground">{int.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            💡 <span className="font-medium text-foreground">No store? No problem.</span>{' '}
            Just upload your product photos from your phone, camera, or desktop.
          </p>
        </div>
      </div>
    </section>
  );
}
