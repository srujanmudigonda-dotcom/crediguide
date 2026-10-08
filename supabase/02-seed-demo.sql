-- ============================================================
-- CrediGuide — demo seed (Phase 1)
-- Run AFTER 01-schema.sql AND after the demo user has registered
-- in the app once (registration creates the profile row this
-- seed attaches to). Re-running replaces the demo user's data.
--
-- Demo account to register in the app:
--   email:    demo@crediguide.app
--   password: (whatever the team registers it with)
-- The seeded credit score is labelled honestly in the app as
-- "Demo data (prototype)" via the source column — there is NO
-- filter hiding it, so the dashboard displays it as designed.
-- ============================================================

begin;

-- Resolve the demo user
-- (fails loudly if the demo account has not registered yet)
do $$
declare
  demo_id uuid;
begin
  select id into demo_id from public.profiles
  where email = 'demo@crediguide.app';

  if demo_id is null then
    raise exception 'Demo user demo@crediguide.app not found — register it in the app first, then re-run this seed.';
  end if;

  -- Start clean for idempotent re-runs
  delete from public.credit_scores where user_id = demo_id;
  delete from public.loans         where user_id = demo_id;
  delete from public.payments      where user_id = demo_id;
  delete from public.notifications where user_id = demo_id;

  -- ---- Credit score history: 6 monthly points ending at 750 --
  insert into public.credit_scores
    (user_id, score, payment_history, credit_utilization, credit_age, credit_accounts, source, score_date)
  values
    (demo_id, 690, 88, 45, 60, 65, 'Demo data (prototype)', now() - interval '5 months'),
    (demo_id, 705, 90, 42, 65, 70, 'Demo data (prototype)', now() - interval '4 months'),
    (demo_id, 715, 91, 40, 68, 72, 'Demo data (prototype)', now() - interval '3 months'),
    (demo_id, 725, 93, 36, 70, 75, 'Demo data (prototype)', now() - interval '2 months'),
    (demo_id, 738, 94, 33, 73, 78, 'Demo data (prototype)', now() - interval '1 month'),
    (demo_id, 750, 95, 30, 75, 80, 'Demo data (prototype)', now());

  -- ---- Loans -------------------------------------------------
  insert into public.loans
    (user_id, loan_type, loan_name, total_amount, amount_paid, emi_amount, due_date, start_date, end_date, status, reminder_enabled)
  values
    (demo_id, 'Personal Loan', 'Demo Personal Loan', 200000, 80000, 12000,
       (current_date + interval '5 days')::date, (current_date - interval '7 months')::date,
       (current_date + interval '10 months')::date, 'Active', true),
    (demo_id, 'Gold Loan', 'Demo Gold Loan', 500000, 100000, 15000,
       (current_date + interval '12 days')::date, (current_date - interval '3 months')::date,
       (current_date + interval '30 months')::date, 'Active', true);

  -- ---- Payments ----------------------------------------------
  insert into public.payments
    (user_id, type, title, amount, due_date, status, reminder_enabled)
  values
    (demo_id, 'Credit Card', 'Credit Card Payment', 8500,
       (current_date + interval '3 days')::date, 'Due Soon', true),
    (demo_id, 'EMI', 'EMI Payment', 12000,
       (current_date + interval '8 days')::date, 'Upcoming', true),
    (demo_id, 'Credit Card', 'Credit Card Payment', 7900,
       (current_date - interval '1 month')::date, 'Paid', true);

  update public.payments
     set paid_at = now() - interval '1 month'
   where user_id = demo_id and status = 'Paid';

  -- ---- Notifications -----------------------------------------
  insert into public.notifications (user_id, type, title, message, read)
  values
    (demo_id, 'Payment', 'Credit Card Payment Due Soon',
     'Your Credit Card Payment of ₹8,500 is due in 3 days.', false),
    (demo_id, 'EMI', 'EMI Payment Reminder',
     'Your EMI Payment of ₹12,000 is due in 8 days.', false),
    (demo_id, 'Credit Score', 'Credit Score Updated',
     'Your credit score was updated to 750.', true);
end $$;

commit;
