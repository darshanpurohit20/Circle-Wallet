-- =============================================================
-- FIX HISTORICAL TRANSACTION SPLITS
-- Recalculates all transaction_splits.amount using the weighted
-- share_ratio from family_members, matching the app's formula:
--   memberAmount = (member.share_ratio / totalRatio) * txAmount
-- =============================================================

-- STEP 1: Preview what will change (run this first to verify!)
WITH split_totals AS (
  -- For each transaction, compute the total share_ratio of all participating members
  SELECT
    ts.transaction_id,
    t.amount AS tx_amount,
    SUM(COALESCE(fm.share_ratio, 1.0)) AS total_ratio
  FROM transaction_splits ts
  JOIN transactions t ON t.id = ts.transaction_id
  JOIN family_members fm ON fm.id = ts.member_id
  WHERE t.type = 'payment'
  GROUP BY ts.transaction_id, t.amount
),
new_amounts AS (
  SELECT
    ts.id AS split_id,
    ts.transaction_id,
    fm.name AS member_name,
    fm.share_ratio,
    ts.amount AS old_amount,
    ROUND(
      (COALESCE(fm.share_ratio, 1.0) / st.total_ratio) * st.tx_amount,
      2
    ) AS new_amount,
    st.tx_amount,
    st.total_ratio
  FROM transaction_splits ts
  JOIN family_members fm ON fm.id = ts.member_id
  JOIN split_totals st ON st.transaction_id = ts.transaction_id
)
SELECT
  transaction_id,
  member_name,
  share_ratio,
  old_amount,
  new_amount,
  (old_amount != new_amount) AS will_change,
  tx_amount
FROM new_amounts
ORDER BY transaction_id, share_ratio DESC;


-- =============================================================
-- STEP 2: Apply the fix (uncomment and run AFTER verifying Step 1)
-- =============================================================

-- UPDATE transaction_splits ts
-- SET amount = ROUND(
--   (COALESCE(fm.share_ratio, 1.0) / st.total_ratio) * st.tx_amount,
--   2
-- )
-- FROM family_members fm,
-- (
--   SELECT
--     ts2.transaction_id,
--     t.amount AS tx_amount,
--     SUM(COALESCE(fm2.share_ratio, 1.0)) AS total_ratio
--   FROM transaction_splits ts2
--   JOIN transactions t ON t.id = ts2.transaction_id
--   JOIN family_members fm2 ON fm2.id = ts2.member_id
--   WHERE t.type = 'payment'
--   GROUP BY ts2.transaction_id, t.amount
-- ) st
-- WHERE fm.id = ts.member_id
--   AND st.transaction_id = ts.transaction_id;


-- =============================================================
-- STEP 3: Verify totals match after update (run after Step 2)
-- =============================================================

-- SELECT
--   ts.transaction_id,
--   t.amount AS tx_amount,
--   SUM(ts.amount) AS split_total,
--   ABS(t.amount - SUM(ts.amount)) AS drift
-- FROM transaction_splits ts
-- JOIN transactions t ON t.id = ts.transaction_id
-- GROUP BY ts.transaction_id, t.amount
-- HAVING ABS(t.amount - SUM(ts.amount)) > 0.01;
