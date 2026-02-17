

## Remove Jake from Models Library

### What changes
Remove the "Jake" entry from the landing page model showcase grid in `src/components/landing/ModelShowcaseSection.tsx` (line 61).

### Technical Detail
Delete this line from the `ROW_2` array:
```
m('Jake', 'model-male-athletic-american.jpg'),
```

No other files reference Jake -- this is the only place he appears.

