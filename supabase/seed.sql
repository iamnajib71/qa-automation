do $$
declare
  admin_id uuid;
  analyst_id uuid;
  viewer_id uuid;
  payments_project_id uuid := gen_random_uuid();
  portal_project_id uuid := gen_random_uuid();
  payments_release_id uuid := gen_random_uuid();
  portal_release_id uuid := gen_random_uuid();
  payments_run_id uuid := gen_random_uuid();
  portal_run_id uuid := gen_random_uuid();
  tc_card_payment_id uuid := gen_random_uuid();
  tc_retry_invoice_id uuid := gen_random_uuid();
  tc_preferences_id uuid := gen_random_uuid();
  trc_card_payment_id uuid := gen_random_uuid();
  trc_retry_invoice_id uuid := gen_random_uuid();
  defect_retry_invoice_id uuid := gen_random_uuid();
begin
  select id into admin_id from public.profiles where role = 'admin' order by created_at asc limit 1;
  select id into analyst_id from public.profiles where role = 'qa_analyst' order by created_at asc limit 1;
  select id into viewer_id from public.profiles where role = 'viewer' order by created_at asc limit 1;

  if admin_id is null or analyst_id is null then
    raise notice 'Seed skipped: create at least one admin profile and one qa_analyst profile first.';
    return;
  end if;

  insert into public.projects (id, project_key, name, description, status, owner_id, created_by)
  values
    (payments_project_id, 'PAY', 'Payments Platform', 'Core payments and billing workflows for invoice collection, gateway retries, and settlement operations.', 'active', admin_id, admin_id),
    (portal_project_id, 'CUS', 'Customer Portal', 'Self-service web portal supporting profile management, communication preferences, and account operations.', 'active', analyst_id, admin_id)
  on conflict (project_key) do nothing;

  insert into public.releases (id, project_id, name, version, build_number, environment, planned_start_date, planned_release_date, status, notes, created_by)
  values
    (payments_release_id, payments_project_id, 'Payments Platform 2026.03', '2026.03', 'pay-2026.03.4421', 'UAT', current_date - 5, current_date + 2, 'in_testing', 'Regression testing in progress ahead of release readiness meeting.', admin_id),
    (portal_release_id, portal_project_id, 'Customer Portal 2026.04', '2026.04', 'cus-2026.04.118', 'SIT', current_date + 3, current_date + 10, 'planning', 'Scope finalisation and early test preparation underway.', analyst_id)
  on conflict do nothing;

  insert into public.test_cases (id, project_id, case_id, title, module, preconditions, steps, expected_result, priority, type, status, created_by, updated_by)
  values
    (tc_card_payment_id, payments_project_id, 'TC-PAY-001', 'Validate successful card payment', 'Checkout', 'Customer account is active and cart contains a payable invoice.', '["Open checkout","Enter valid card details","Submit payment","Verify payment confirmation and receipt"]'::jsonb, 'Payment is accepted, order is updated, and confirmation details are displayed.', 'high', 'functional', 'ready', analyst_id, analyst_id),
    (tc_retry_invoice_id, payments_project_id, 'TC-PAY-014', 'Retry failed invoice after gateway timeout', 'Billing', 'A previous payment attempt has timed out and retry is enabled for the invoice.', '["Open failed invoice","Trigger retry action","Wait for gateway response","Confirm invoice and ledger status"]'::jsonb, 'Invoice retry completes successfully and duplicate charges are prevented.', 'critical', 'regression', 'ready', analyst_id, analyst_id),
    (tc_preferences_id, portal_project_id, 'TC-CUS-007', 'Update contact preferences', 'Profile', 'User is authenticated and has an existing communication preference setting.', '["Open preferences page","Change opt-in selection","Save changes","Re-open page to confirm persistence"]'::jsonb, 'Preference changes are saved and displayed correctly on reload.', 'medium', 'uat', 'draft', analyst_id, analyst_id)
  on conflict (case_id) do nothing;

  insert into public.test_runs (id, project_id, release_id, name, description, status, assigned_to, started_at, created_by)
  values
    (payments_run_id, payments_project_id, payments_release_id, 'Regression Pack A', 'Primary regression execution for core payments release scope.', 'in_progress', analyst_id, timezone('utc', now()) - interval '1 day', admin_id),
    (portal_run_id, portal_project_id, portal_release_id, 'UAT Dry Run', 'Early execution shell for upcoming customer portal release.', 'not_started', coalesce(viewer_id, analyst_id), null, analyst_id)
  on conflict do nothing;

  insert into public.test_run_cases (id, test_run_id, test_case_id, result, execution_notes, executed_by, executed_at)
  values
    (trc_card_payment_id, payments_run_id, tc_card_payment_id, 'passed', 'Successful execution in UAT. Receipt and audit trail verified.', analyst_id, timezone('utc', now()) - interval '12 hours'),
    (trc_retry_invoice_id, payments_run_id, tc_retry_invoice_id, 'failed', 'Retry action generated duplicate pending transaction after gateway timeout.', analyst_id, timezone('utc', now()) - interval '10 hours')
  on conflict (test_run_id, test_case_id) do nothing;

  insert into public.defects (id, project_id, release_id, test_run_case_id, defect_key, title, description, severity, priority, status, environment, assigned_owner_id, reported_by)
  values
    (defect_retry_invoice_id, payments_project_id, payments_release_id, trc_retry_invoice_id, 'BUG-PAY-014', 'Duplicate pending transaction created on invoice retry timeout', 'When retrying a timed-out invoice payment, the application creates a second pending transaction before the first request is resolved.', 'critical', 'high', 'open', 'UAT', admin_id, analyst_id)
  on conflict (defect_key) do nothing;

  update public.test_run_cases
  set linked_defect_id = defect_retry_invoice_id
  where id = trc_retry_invoice_id;

  insert into public.activity_logs (project_id, actor_id, entity_type, entity_id, action, summary, metadata)
  values
    (payments_project_id, analyst_id, 'test_run', payments_run_id, 'updated', 'Regression Pack A execution updated after billing scenario failure.', jsonb_build_object('release', 'Payments Platform 2026.03')),
    (payments_project_id, analyst_id, 'defect', defect_retry_invoice_id, 'created', 'Critical defect BUG-PAY-014 logged from failed invoice retry test result.', jsonb_build_object('severity', 'critical', 'status', 'open'));
end $$;
