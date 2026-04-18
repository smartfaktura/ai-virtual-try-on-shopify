
User is on `/app/workflows`. Screenshot shows a large empty vertical gap between the "Missing a Visual Type" request card and the "Recent Creations" section.

Likely cause: the `RecentCreationsGallery` wrapper has `min-h-[680px] sm:min-h-[480px] lg:min-h-[360px]` reserved space, but on mobile the actual content (single row of 2 cards at ~aspect 3/4 + heading) is far shorter than 680px, OR the section above (`RecentCreationsGallery` is loaded but `min-h` is over-reserved). Let me confirm by viewing workflows page.
