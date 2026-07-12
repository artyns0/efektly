# Efektly releases and rollback

## v0.1.1

Adds the interactive Flap mascot, product-event reactions, and the fixed mascot
home above the independently scrolling left-panel controls.

## v0.1.0 production backup

The `v0.1.0` tag points to commit `75010f12cc7acf3b6bb2e5d471e37a1e710b445e`,
the production revision that was live immediately before v0.1.1.

## Roll back v0.1.1

Prefer a revert commit so the production branch history remains intact:

```bash
git switch main
git pull --ff-only origin main
git revert v0.1.1
git push origin main
```

This republishes the v0.1.0 application through the production branch without
deleting the v0.1.1 release or its tag.
