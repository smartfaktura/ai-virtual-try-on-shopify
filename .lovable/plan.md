
# Bulk Generation Integration į Product Selection

## ✅ Implementuota

Multi-select produktų pasirinkimas integruotas į pagrindinį Generate flow:

### Pakeitimai

1. **`SourceTypeSelector.tsx`** - Atnaujinta "From Product" → "From Product(s)" su nauju description
2. **`Generate.tsx`**:
   - Pašalintas "Bulk Generate" mygtukas iš source step
   - Pridėta `selectedProductIds` state Set
   - Produktų pasirinkime naudojamas `ProductMultiSelect` komponentas
   - Branching logika: 1 produktas = single flow, 2+ = bulk flow
3. **`BulkGenerate.tsx`** - Priima produktus per `location.state` ir iškart rodo settings jei jau pasirinkti

### UI Flow

```text
Source Selection → Product(s) Selection → [1 product: single flow] / [2+ products: bulk flow]
```
