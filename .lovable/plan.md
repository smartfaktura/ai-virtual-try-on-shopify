## Safety

Yes — fully safe. The `p:domain_verify` meta tag is a passive, read-only token Pinterest fetches to prove you own the domain. It:

- Doesn't load scripts, set cookies, or track users
- Doesn't affect SEO, performance, or other meta tags
- Is the standard, Pinterest-recommended verification method

## Change

Add one line inside the existing `<head>` of `index.html`, grouped near other verification/meta tags:

```html
<meta name="p:domain_verify" content="dcb7589d44bac2e0ab99fd475efc996a" />
```

That's it — no other files touched. After deploy, click "Continue setup" / Verify in Pinterest and it will detect the tag on https://vovv.ai.