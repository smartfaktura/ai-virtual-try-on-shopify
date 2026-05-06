
## Improve 6 Living Room Scene Prompts

Two problems to fix:

### 1. Dimensional accuracy — product appears oversized

The current DIMENSIONAL ACCURACY block is too vague. A 200cm sofa in a 7m-wide room should occupy ~29% of the wall, but the AI has no explicit instruction to calculate proportions. The fix:

- Replace the generic dimensional block with a **PROPORTIONAL SCALE RULE** that explicitly tells the AI: "A 200cm product must occupy roughly 200/room-width of the visible wall. If the room is 7m wide, the product spans ~2/7 of that wall. Never let a product exceed 40% of the room width unless its real dimensions require it."
- Add a **HUMAN SCALE ANCHOR**: "Imagine a 175cm adult standing next to the product for scale reference — the product must look correct relative to that person even if no person is shown."
- Add door/window pixel-ratio anchoring: "The standard door (210cm × 90cm) visible or implied in the scene is your calibration ruler."

### 2. Scenes feel sterile — need cozy, styled-interior warmth

Each of the 6 scenes will get styling layers that make them feel like a real lived-in, interior-designed space rather than a cold showroom:

- **Sunlit Marble Atrium** — Add: a stack of oversized coffee-table books, a cashmere throw draped on an accent chair, a subtle scented candle on the console, warm-toned dried pampas in a ceramic vase. Soften marble coldness with layered textiles.
- **Coastal Breeze Salon** — Add: a linen-bound book and reading glasses on a side table, a woven rattan tray with a ceramic mug, a soft knit blanket over the sofa arm, weathered wooden picture frames on a shelf. More Mediterranean cottage, less hotel lobby.
- **Cloud White Gallery** — Add: a curated stack of art monographs on the floor near the wall, a soft sheepskin draped over one seat, a hand-thrown ceramic cup on a side surface, a single stem flower in a slim vase. Gallery warmth, not clinical.
- **Golden Hour Terrace Lounge** — Add: an open book face-down on the coffee table, wine glasses catching the golden light, a lightweight linen throw, terracotta pottery with a trailing plant on the terrace. Warm resort evening, not empty model home.
- **Silk & Stone Residence** — Add: a velvet cushion in muted sage, a leather-bound journal on the side table, a small brass tray with a candle and matches, fresh cut stems in a fluted vase near the fireplace. Quiet luxury that feels inhabited.
- **Luminous Japandi Suite** — Add: a handmade ceramic tea set on the bench, a folded indigo-dyed linen cloth, a single ikebana arrangement in the tokonoma niche, a wabi-sabi stoneware bowl with a few dried pods. Lived-in serenity.

### Technical details

- Single data UPDATE via the insert tool (6 rows, updating `prompt_template` column only)
- Each prompt keeps the `[PRODUCT IMAGE]` source-of-truth header and `{{productName}}` placeholder
- The improved DIMENSIONAL ACCURACY block replaces the old one in all 6 prompts
- No schema changes, no code changes needed
