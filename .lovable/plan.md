

## Plan: Add 4th "Try Freestyle" Step to Onboarding Checklist

### Changes

**1. `src/components/app/OnboardingChecklist.tsx`**
- Add a 4th step to the `steps` array:
  - key: `'freestyle'`
  - title: `'Try Freestyle Studio'`
  - description: `'Write any prompt, pick a product, model & scene — one-click generation like ChatGPT, but for your images.'`
  - icon: `Sparkles` (or a new `Wand2` icon)
  - path: `/app/freestyle`
  - cta: `'Try Freestyle'`
  - memberName: `'Amara'` (Lifestyle Scene Photographer — fits the creative/freestyle vibe)
- Add `freestyleCount` to `OnboardingChecklistProps`
- Add to `completionMap`: `freestyle: freestyleCount > 0`

**2. `src/pages/Dashboard.tsx`**
- Add a query for freestyle generation count (non-perspectives):
  ```ts
  const { data: freestyleCount = 0 } = useQuery({
    queryKey: ['dashboard-freestyle-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('freestyle_generations')
        .select('*', { count: 'exact', head: true })
        .is('workflow_label', null);  // exclude Perspectives
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });
  ```
- Pass `freestyleCount` to `<OnboardingChecklist>`

### Result
The checklist goes from 3 → 4 steps. Step 4 appears after "Generate Your First Visual Set" and encourages trying Freestyle Studio with a CTA button linking to `/app/freestyle`. It completes once the user has at least one freestyle generation.

