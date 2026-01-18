# A/B Price Test Campaign Links

> Quick reference for Meta ad campaigns. For implementation details, see `docs/AB-PRICE-TESTING.md`.

## Quick Copy Links

| Variant | Price | URL |
|---------|-------|-----|
| Control | $19.99 | `https://www.astropowermap.com` |
| Test $14.99 | $14.99 | `https://www.astropowermap.com/?c=x14ts` |
| Test $24.99 | $24.99 | `https://www.astropowermap.com/?c=x24ts` |
| Test $29.99 | $29.99 | `https://www.astropowermap.com/?c=x29ts` |

---

## Full Pricing Matrix

| Code | Price | Strikethrough | Savings | Plan ID |
|------|-------|---------------|---------|---------|
| (none) | $19.99 | $49.00 | 59% | `one_time` |
| `x14ts` | $14.99 | $35.00 | 57% | `one_time_14` |
| `x24ts` | $24.99 | $59.00 | 58% | `one_time_24` |
| `x29ts` | $29.99 | $69.00 | 57% | `one_time_29` |

---

## Meta Attribution

Each variant sends different `content_id` to Meta for attribution:

| Variant | content_id | value |
|---------|------------|-------|
| Control | `one_time` | 19.99 |
| $14.99 | `one_time_14` | 14.99 |
| $24.99 | `one_time_24` | 24.99 |
| $29.99 | `one_time_29` | 29.99 |

---

## Analytics Queries

### Conversion Rate by Variant
```sql
SELECT
  price_variant_code as variant,
  COUNT(*) as leads,
  SUM(CASE WHEN has_purchased THEN 1 ELSE 0 END) as purchases,
  ROUND(100.0 * SUM(CASE WHEN has_purchased THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate
FROM astro_leads
WHERE created_at > '2025-01-01'
GROUP BY price_variant_code;
```

### Revenue by Variant
```sql
SELECT
  metadata->>'plan_id' as plan,
  metadata->>'variant_code' as code,
  COUNT(*) as purchases,
  SUM(amount_cents) / 100.0 as revenue,
  AVG(amount_cents) / 100.0 as aov
FROM astro_purchases
WHERE status = 'completed'
GROUP BY metadata->>'plan_id', metadata->>'variant_code';
```
