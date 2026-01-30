

# Templates Page Cleanup Plan

## Problema

Dabartinis Templates puslapis turi veiksmų, kurie neturi prasmės produktui:
- **"Create template"** mygtukas - templates yra sistemos paruošti stiliai, vartotojai jų nekuria
- **"Edit"** veiksmas - vartotojai negali redaguoti sistemos templates
- **"Duplicate"** veiksmas - nėra prasmės dublikuoti, nes templates yra standartiniai
- **"Delete"** veiksmas - vartotojai negali ištrinti sistemos templates
- **"Enable/Disable"** veiksmas - galbūt prasminga, jei norime leisti slėpti templates

## Sprendimas

Pakeisti Templates puslapį į **read-only galerijos režimą** su šiais veiksmais:

### Nauji veiksmai
1. **"Use in Generate"** - paspaudus nukreipia į Generate puslapį su pasirinktu template
2. **"Preview"** - atidaro modalą su didesniu template paveikslu ir pilna informacija
3. **"Add to Favorites"** (optional) - leidžia pažymėti mėgstamiausius templates

### UI pakeitimai

| Dabartinis | Naujas |
|------------|--------|
| "Create template" mygtukas | Pašalinti visiškai |
| Actions popover su Edit/Delete | "Use" mygtukas + "Preview" |
| DataTable formatas | Galima palikti arba pakeisti į kortelių galerija |

## Techniniai pakeitimai

### `src/pages/Templates.tsx`

1. **Pašalinti** `primaryAction` iš PageHeader (Create template mygtukas)
2. **Pakeisti** ActionList items:
   - Pašalinti: Edit, Duplicate, Delete, Enable/Disable
   - Pridėti: "Use this template", "View details"
3. **Pašalinti** delete modal ir susijusią logiką
4. **Atnaujinti** actions stulpelį - vietoj popover menu, du aiškūs mygtukai

### Naujas actions stulpelis:

```
[Use] [Preview]
```

- **Use** - Button primary, nukreipia į `/generate?template={templateId}`
- **Preview** - Button plain, atidaro modalą su template info

### Naujas Preview Modal

Atidaro modalą su:
- Didelis template paveikslas
- Pilnas aprašymas
- Kategorija
- Rekomenduojami produktų tipai
- "Use this template" mygtukas

## Failo pakeitimai

| Failas | Veiksmas |
|--------|----------|
| `src/pages/Templates.tsx` | Pašalinti Create button, pakeisti actions į Use/Preview |

