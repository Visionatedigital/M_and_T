-- Allow MT### loan IDs and match Airtel SMS references like MT006 or MNT000001

ALTER TABLE public.loan_applications
DROP CONSTRAINT IF EXISTS loan_applications_loan_reference_format_check;

ALTER TABLE public.loan_applications
ADD CONSTRAINT loan_applications_loan_reference_format_check
CHECK (loan_reference IS NULL OR loan_reference ~ '^(MT[0-9]{3}|MNT[0-9]{6})$');

CREATE OR REPLACE FUNCTION public.process_airtel_loan_payment(
  p_transaction_id text,
  p_amount numeric,
  p_sender_phone text,
  p_loan_reference text,
  p_wallet_balance numeric,
  p_raw_message text,
  p_source text DEFAULT 'iphone-shortcuts'::text,
  p_device_name text DEFAULT NULL::text,
  p_received_at timestamp with time zone DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
declare
  v_transaction_id text;
  v_loan_reference text;
  v_haystack text;
  v_message_id uuid;
  v_repayment_id uuid;
  v_accounting_entry_id uuid;
  v_loan public.loan_applications%rowtype;
  v_current_balance numeric;
  v_new_balance numeric;
  v_new_amount_paid numeric;
  v_match_notes text;
begin
  v_transaction_id := upper(trim(p_transaction_id));
  v_haystack := upper(regexp_replace(
    coalesce(p_loan_reference, '') || coalesce(p_raw_message, ''),
    '[^A-Z0-9]',
    '',
    'g'
  ));

  if v_haystack ~ 'MNT[0-9]{6}' then
    v_loan_reference := substring(v_haystack from 'MNT[0-9]{6}');
  elsif v_haystack ~ 'MT[0-9]{3}' then
    v_loan_reference := substring(v_haystack from 'MT[0-9]{3}');
  else
    v_loan_reference := upper(trim(coalesce(p_loan_reference, '')));
  end if;

  if v_transaction_id is null or v_transaction_id = '' then
    raise exception 'Transaction ID is required';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Payment amount must be greater than zero';
  end if;

  if v_loan_reference !~ '^(MT[0-9]{3}|MNT[0-9]{6})$' then
    raise exception 'Invalid loan reference: %', coalesce(p_loan_reference, v_loan_reference);
  end if;

  insert into public.airtel_payment_messages (
    raw_message,
    transaction_id,
    transaction_type,
    amount,
    sender_phone,
    reference_raw,
    reference_normalized,
    wallet_balance,
    source,
    device_name,
    received_at,
    parse_status,
    processing_status,
    match_confidence,
    match_notes
  )
  values (
    p_raw_message,
    v_transaction_id,
    'RECEIVED',
    p_amount,
    p_sender_phone,
    p_loan_reference,
    v_loan_reference,
    p_wallet_balance,
    coalesce(nullif(trim(p_source), ''), 'iphone-shortcuts'),
    nullif(trim(p_device_name), ''),
    coalesce(p_received_at, now()),
    'PARSED',
    'PROCESSING',
    'EXACT_REFERENCE',
    'Searching for loan ID ' || v_loan_reference
  )
  on conflict (transaction_id) do nothing
  returning id into v_message_id;

  if v_message_id is null then
    return jsonb_build_object(
      'success', true,
      'status', 'duplicate',
      'transaction_id', v_transaction_id,
      'loan_reference', v_loan_reference,
      'message', 'This Airtel transaction was already received and was not processed again'
    );
  end if;

  select *
  into v_loan
  from public.loan_applications
  where upper(loan_reference) = v_loan_reference
  for update;

  v_match_notes := 'Loan matched using the unique loan ID';

  if not found and v_loan_reference ~ '^MT[0-9]{3}$' then
    select *
    into v_loan
    from public.loan_applications
    where id = (
      select la.id
      from public.loan_applications la
      where upper(la.loan_reference) = ('MNT' || substring(v_loan_reference from 3) || '001')
      order by case when la.status in ('approved', 'disbursed') then 0 else 1 end, la.created_at desc
      limit 1
    )
    for update;

    if found then
      v_match_notes := 'Loan matched using MT code alias on loan_reference';
    end if;
  end if;

  if v_loan.id is null and v_loan_reference ~ '^MT[0-9]{3}$' then
    select *
    into v_loan
    from public.loan_applications
    where id = (
      select la2.id
      from public.borrowers b
      join public.loan_applications la2
        on la2.borrower_id = b.id
        or (
          la2.borrower_id is null
          and coalesce(nullif(regexp_replace(regexp_replace(trim(coalesce(b.phone_number, '')), '^\+256', '0'), '\D', '', 'g'), ''), '') <> ''
          and regexp_replace(regexp_replace(trim(coalesce(la2.phone_number, '')), '^\+256', '0'), '\D', '', 'g')
            = regexp_replace(regexp_replace(trim(coalesce(b.phone_number, '')), '^\+256', '0'), '\D', '', 'g')
        )
      where upper(b.unique_number) = v_loan_reference
      order by
        case when la2.status in ('approved', 'disbursed') then 0 else 1 end,
        la2.created_at desc
      limit 1
    )
    for update;

    if found then
      v_match_notes := 'Loan matched using borrower MT code';
    end if;
  end if;

  if v_loan.id is null then
    update public.airtel_payment_messages
    set
      processing_status = 'MANUAL_REVIEW',
      match_confidence = 'NO_MATCH',
      match_notes = 'No loan application matched the supplied loan ID ' || v_loan_reference
    where id = v_message_id;

    return jsonb_build_object(
      'success', false,
      'status', 'manual_review',
      'reason', 'LOAN_NOT_FOUND',
      'transaction_id', v_transaction_id,
      'loan_reference', v_loan_reference,
      'message', 'No loan was found for the supplied reference'
    );
  end if;

  update public.airtel_payment_messages
  set
    matched_loan_application_id = v_loan.id,
    match_confidence = 'EXACT_REFERENCE',
    match_notes = v_match_notes
  where id = v_message_id;

  if v_loan.status not in ('approved', 'disbursed') then
    update public.airtel_payment_messages
    set
      processing_status = 'MANUAL_REVIEW',
      match_notes = 'Matched loan is not approved or disbursed'
    where id = v_message_id;

    if v_loan.assigned_officer_id is not null then
      insert into public.notifications (
        user_id, title, message, type, read
      )
      values (
        v_loan.assigned_officer_id,
        'Payment requires review',
        format(
          'UGX %s was received for %s, but the loan status is %s.',
          trim(to_char(p_amount, 'FM999,999,999,990')),
          v_loan_reference,
          v_loan.status
        ),
        'warning',
        false
      );
    end if;

    return jsonb_build_object(
      'success', false,
      'status', 'manual_review',
      'reason', 'LOAN_NOT_ACTIVE',
      'transaction_id', v_transaction_id,
      'loan_reference', v_loan_reference,
      'loan_status', v_loan.status,
      'message', 'The matched loan is not approved or disbursed'
    );
  end if;

  v_current_balance := greatest(
    0,
    coalesce(
      v_loan.outstanding_balance,
      v_loan.loan_amount - coalesce(v_loan.amount_paid, 0)
    )
  );

  if v_current_balance <= 0 then
    update public.airtel_payment_messages
    set
      processing_status = 'MANUAL_REVIEW',
      match_notes = 'Matched loan has no outstanding balance'
    where id = v_message_id;

    if v_loan.assigned_officer_id is not null then
      insert into public.notifications (
        user_id, title, message, type, read
      )
      values (
        v_loan.assigned_officer_id,
        'Payment received for fully paid loan',
        format(
          'UGX %s was received for %s, which currently has no outstanding balance.',
          trim(to_char(p_amount, 'FM999,999,999,990')),
          v_loan_reference
        ),
        'warning',
        false
      );
    end if;

    return jsonb_build_object(
      'success', false,
      'status', 'manual_review',
      'reason', 'LOAN_ALREADY_PAID',
      'transaction_id', v_transaction_id,
      'loan_reference', v_loan_reference,
      'current_balance', v_current_balance,
      'message', 'The matched loan has no outstanding balance'
    );
  end if;

  if p_amount > v_current_balance then
    update public.airtel_payment_messages
    set
      processing_status = 'MANUAL_REVIEW',
      match_notes = format(
        'Payment UGX %s exceeds outstanding balance UGX %s',
        p_amount,
        v_current_balance
      )
    where id = v_message_id;

    if v_loan.assigned_officer_id is not null then
      insert into public.notifications (
        user_id, title, message, type, read
      )
      values (
        v_loan.assigned_officer_id,
        'Possible loan overpayment',
        format(
          'UGX %s was received for %s, but its outstanding balance is UGX %s.',
          trim(to_char(p_amount, 'FM999,999,999,990')),
          v_loan_reference,
          trim(to_char(v_current_balance, 'FM999,999,999,990'))
        ),
        'warning',
        false
      );
    end if;

    return jsonb_build_object(
      'success', false,
      'status', 'manual_review',
      'reason', 'PAYMENT_EXCEEDS_BALANCE',
      'transaction_id', v_transaction_id,
      'loan_reference', v_loan_reference,
      'payment_amount', p_amount,
      'current_balance', v_current_balance,
      'message', 'Payment exceeds the recorded outstanding balance'
    );
  end if;

  insert into public.repayments (
    loan_application_id,
    amount,
    payment_date,
    recorded_by,
    notes,
    status,
    payment_method,
    penalty_amount,
    external_transaction_id,
    external_reference,
    sender_phone,
    raw_message
  )
  values (
    v_loan.id,
    p_amount,
    (coalesce(p_received_at, now()) at time zone 'Africa/Kampala')::date,
    null,
    'Automatically recorded from an authenticated Airtel Money SMS',
    'paid',
    'airtel_money',
    0,
    v_transaction_id,
    v_loan_reference,
    p_sender_phone,
    p_raw_message
  )
  returning id into v_repayment_id;

  insert into public.accounting_entries (
    entry_type,
    category,
    description,
    amount,
    entry_date,
    reference_id,
    payment_method,
    recorded_by,
    narration
  )
  values (
    'revenue',
    'loan_repayment',
    format('Airtel Money repayment for loan %s', v_loan_reference),
    p_amount,
    (coalesce(p_received_at, now()) at time zone 'Africa/Kampala')::date,
    v_repayment_id,
    'airtel_money',
    null,
    format(
      'Transaction %s received from %s',
      v_transaction_id,
      coalesce(p_sender_phone, 'unknown sender')
    )
  )
  returning id into v_accounting_entry_id;

  select amount_paid, outstanding_balance
  into v_new_amount_paid, v_new_balance
  from public.loan_applications
  where id = v_loan.id;

  update public.airtel_payment_messages
  set
    processing_status = 'PROCESSED',
    matched_loan_application_id = v_loan.id,
    match_confidence = 'EXACT_REFERENCE',
    match_notes = format('Repayment %s created successfully', v_repayment_id)
  where id = v_message_id;

  if v_loan.assigned_officer_id is not null then
    insert into public.notifications (
      user_id, title, message, type, read
    )
    values (
      v_loan.assigned_officer_id,
      'Loan payment received',
      format(
        'UGX %s was received for %s. The new outstanding balance is UGX %s.',
        trim(to_char(p_amount, 'FM999,999,999,990')),
        v_loan_reference,
        trim(to_char(v_new_balance, 'FM999,999,999,990'))
      ),
      'success',
      false
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'status', 'processed',
    'message', 'Payment recorded successfully',
    'transaction_id', v_transaction_id,
    'loan_reference', v_loan_reference,
    'loan_application_id', v_loan.id,
    'repayment_id', v_repayment_id,
    'accounting_entry_id', v_accounting_entry_id,
    'amount_received', p_amount,
    'previous_balance', v_current_balance,
    'new_balance', v_new_balance,
    'total_amount_paid', v_new_amount_paid
  );
end;
$function$;
