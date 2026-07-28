/**
 * M&T Microfinance — Website Fact Validation Questionnaire
 * Creates a fillable Google Form in your Google account.
 *
 * SETUP (one time):
 * 1. Open https://script.google.com → New project
 * 2. Paste this entire file (replace default Code.gs contents)
 * 3. Select function: createMTMicrofinanceQuestionnaire
 * 4. Run ▶ → Authorize when prompted
 * 5. View → Logs (or Execution log) for the form URL
 *
 * Optional: Run addFormEditors() after creation to share edit access.
 */

function createMTMicrofinanceQuestionnaire() {
  const form = FormApp.create('M&T Microfinance — Website Fact Validation Questionnaire');

  form.setDescription(
    'Purpose: Confirm, correct, or expand every claim on the M&T Microfinance public website.\n\n' +
      'Instructions: Answer each section honestly. Where a website fact is shown, mark whether it is ' +
      'Confirmed, Needs Update, or should be Removed from the website.\n\n' +
      'Source: M&T Growth Gateway public site (Home, About, Products, Branches, Contact).'
  );

  form.setCollectEmail(true);
  form.setAllowResponseEdits(true);
  form.setPublishingSummary(true);
  form.setConfirmationMessage(
    'Thank you. Your responses will be used to validate and update the M&T Microfinance website.'
  );

  // --- Respondent info ---
  form.addTextItem()
    .setTitle('Your full name')
    .setRequired(true);

  form.addTextItem()
    .setTitle('Your role / department')
    .setHelpText('e.g. Marketing, Operations, Compliance, Management')
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Your relationship to M&T Microfinance')
    .setChoices([
      'Staff / Employee',
      'Management / Leadership',
      'Board member',
      'External consultant / vendor',
      'Other',
    ].map((c) => form.createChoice(c)))
    .setRequired(true);

  // --- Section A ---
  addSection(form, 'Section A — Company Identity & Branding');

  addFactCheck(
    form,
    'A1 — Full legal company name',
    'Website states: M&T Microfinance (U) Ltd'
  );
  addFactCheck(form, 'A2 — Official motto / tagline', 'Website states: "Developing Together"');
  addFactCheck(
    form,
    'A3 — One-line company description for homepage',
    'Website states: "Leading microfinance institution in Uganda"'
  );
  form.addTextItem()
    .setTitle('A4 — Year M&T Microfinance was established')
    .setHelpText('Not currently stated on the website')
    .setRequired(false);
  form.addParagraphTextItem()
    .setTitle('A5 — Licensing / regulation details')
    .setHelpText('Regulatory authority, license number, and any public disclaimer text')
    .setRequired(false);
  form.addTextItem()
    .setTitle('A6 — Approximate number of active clients')
    .setHelpText('Website states: "thousands of customers across Uganda"')
    .setRequired(false);
  form.addCheckboxItem()
    .setTitle('A7 — Customer segments you officially serve')
    .setChoices([
      'Individuals',
      'Civil servants',
      'Small & medium enterprises (SMEs)',
      'Groups',
      'Farmers / agriculture',
      'Other',
    ].map((c) => form.createChoice(c)))
    .setRequired(true);

  // --- Section B ---
  addSection(form, 'Section B — Mission, Vision & Values');

  addFactCheck(
    form,
    'B1 — Mission statement',
    'Website: "To provide accessible, reliable, and customer-focused financial services that empower individuals and businesses to achieve sustainable growth and prosperity."'
  );
  addFactCheck(
    form,
    'B2 — Vision statement',
    'Website: "To be the leading microfinance institution in Uganda, recognized for excellence in service delivery and commitment to financial inclusion."'
  );
  addFactCheck(
    form,
    'B3 — Core values',
    'Website lists: Integrity & transparency; Customer-centricity; Innovation & excellence; Community development'
  );
  form.addParagraphTextItem()
    .setTitle('B4 — Additional values, CSR, or community programs not on the website')
    .setRequired(false);

  // --- Section C ---
  addSection(form, 'Section C — Leadership & Governance');

  const directors = [
    ['C1 — Chairman', 'Dr. Michael Tumusiime — 20+ years in financial services'],
    ['C2 — Managing Director', 'Ms. Sarah Nakamya — financial inclusion focus'],
    ['C3 — Director of Operations', 'Mr. James Mukasa — risk management & operations'],
    ['C4 — Director of Finance', 'Ms. Grace Namukasa — certified accountant'],
    ['C5 — Director of Business Development', 'Mr. David Ssemwogerere — product & reach expansion'],
    ['C6 — Director of Compliance', 'Ms. Mary Nalubega — regulatory & governance'],
  ];

  directors.forEach(([title, website]) => addFactCheck(form, title, 'Website states: ' + website));

  form.addMultipleChoiceItem()
    .setTitle('C7 — Are any board names, titles, or bios incorrect or outdated?')
    .setChoices(['No — all correct', 'Yes — some need updating', 'Unsure'].map((c) => form.createChoice(c)))
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('C7b — If updates needed, list corrections (name, title, bio)')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('C8 — Should real photos and full bios be added for directors?')
    .setChoices(['Yes', 'No', 'Some directors only'].map((c) => form.createChoice(c)))
    .setRequired(true);

  // --- Section D ---
  addSection(form, 'Section D — Awards & Recognition');

  addFactCheck(
    form,
    'D1 — "Best Microfinance Institution 2023"',
    'Website: Recognized by Uganda Microfinance Association for service delivery and customer satisfaction'
  );
  addFactCheck(
    form,
    'D2 — "Financial Inclusion Award"',
    'Website mentions award but does not state issuing body or year'
  );
  form.addParagraphTextItem()
    .setTitle('D3 — Other awards, certifications, or partnerships to add to the website')
    .setRequired(false);
  form.addMultipleChoiceItem()
    .setTitle('D4 — Can you provide documentation for each award on the website?')
    .setChoices(['Yes — all documented', 'Partially', 'No / need to verify'].map((c) => form.createChoice(c)))
    .setRequired(true);

  // --- Section E ---
  addSection(form, 'Section E — Contact & Location');

  addFactCheck(
    form,
    'E1 — Head office address',
    'Website: Plot 2D/2E Nakasero Hill Road, Kampala'
  );
  addFactCheck(form, 'E2 — P.O. Box', 'Website: P.O. Box 29692, Kampala');
  addFactCheck(
    form,
    'E3 — Phone numbers',
    'Website: +256 785 609 370 and +256 756 790 357'
  );

  form.addMultipleChoiceItem()
    .setTitle('E4 — Official company email address')
    .setHelpText('Website conflict: Contact page shows info@m&tmicrofinance.com; Footer shows info@mtmicrofinance.com')
    .setChoices([
      'info@mtmicrofinance.com',
      'info@m&tmicrofinance.com',
      'Different address (specify in next question)',
      'Unsure',
    ].map((c) => form.createChoice(c)))
    .setRequired(true);

  form.addTextItem()
    .setTitle('E4b — If different email, enter the correct official address')
    .setRequired(false);

  addFactCheck(
    form,
    'E5 — Business hours',
    'Website: Mon–Fri 8:00 AM–5:00 PM; Sat 9:00 AM–1:00 PM; Sun closed'
  );
  form.addParagraphTextItem()
    .setTitle('E6 — Additional contact channels to publish (WhatsApp, social media, toll-free, etc.)')
    .setRequired(false);

  // --- Section F ---
  addSection(form, 'Section F — Branches & Geographic Reach');

  form.addTextItem()
    .setTitle('F1 — Total number of branches M&T operates')
    .setHelpText('Website implies multiple branches but only lists Head Office – Nakasero')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('F2 — List ALL branches (name, address, phone, hours)')
    .setHelpText('One branch per line or structured list')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('F3 — Agents or outreach offices not currently on the website')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('F4 — Should the map placeholder be replaced with an embedded map?')
    .setChoices(['Yes — Google Maps', 'Yes — other', 'No', 'Not sure'].map((c) => form.createChoice(c)))
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('F5 — Is the phrase "branches across Uganda" accurate?')
    .setChoices([
      'Yes — accurate',
      'Partially — update wording',
      'No — remove or change',
    ].map((c) => form.createChoice(c)))
    .setRequired(true);

  form.addTextItem()
    .setTitle('F5b — Suggested replacement wording (if needed)')
    .setRequired(false);

  // --- Section G — Products ---
  addSection(form, 'Section G — Loan Products');

  form.addMultipleChoiceItem()
    .setTitle('G0 — How many "core" loan product lines should the homepage advertise?')
    .setHelpText('Homepage says "4+ core lines" but Products page lists 8 products')
    .setChoices(['4', '5–6', '7', '8', 'Other (specify below)'].map((c) => form.createChoice(c)))
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('G0b — Which products are "core" and should appear on homepage/footer?')
    .setChoices(productNames().map((c) => form.createChoice(c)))
    .setRequired(true);

  const products = getProductFacts();
  products.forEach((p) => addProductBlock(form, p));

  form.addMultipleChoiceItem()
    .setTitle('G9 — Interest rate type published on website')
    .setHelpText('Website shows monthly "from X%" rates — clarify calculation method')
    .setChoices([
      'Flat monthly rate',
      'Reducing balance',
      'Varies by product',
      'Other (explain below)',
    ].map((c) => form.createChoice(c)))
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('G10 — Fees not currently on website (processing, insurance, late payment, etc.)')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('G11 — Minimum eligibility per product (age, income, documentation)')
    .setRequired(false);

  // --- Section H ---
  addSection(form, 'Section H — Application Process & Customer Journey');

  addFactCheck(
    form,
    'H1 — Four-step loan process',
    'Website: Apply → Assessment → Decision → Disbursement'
  );

  form.addMultipleChoiceItem()
    .setTitle('H2 — Can customers apply fully online today?')
    .setHelpText('Personal loans claim "online application available" but Apply links to contact form')
    .setChoices([
      'Yes — full online application exists',
      'Partial — inquiry only via contact form',
      'No — branch/phone only',
      'Planned soon',
    ].map((c) => form.createChoice(c)))
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('H3 — Typical review/approval timeline per product (days/weeks)')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('H4 — Required documents per product')
    .setRequired(false);

  form.addCheckboxItem()
    .setTitle('H5 — Disbursement channels currently used')
    .setChoices([
      'Cash at branch',
      'Bank transfer',
      'MTN Mobile Money',
      'Airtel Money',
      'Cheque',
      'Other',
    ].map((c) => form.createChoice(c)))
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('H6 — Does the website contact form reach a real inbox/CRM?')
    .setChoices([
      'Yes — working and monitored',
      'No — not connected yet',
      'Unsure',
    ].map((c) => form.createChoice(c)))
    .setRequired(true);

  form.addTextItem()
    .setTitle('H6b — If connected, which email/inbox receives submissions?')
    .setRequired(false);

  // --- Section I ---
  addSection(form, 'Section I — Marketing Claims Verification');

  const claims = [
    'I1 — "Quick approval process"',
    'I2 — "Fast loan approval and disbursement"',
    'I3 — "Flexible repayment plans aligned to cash flow"',
    'I4 — "Repayment terms from 3 to 96 months depending on product"',
    'I5 — "Competitive / affordable interest rates"',
    'I6 — "Professional financial advisors"',
    'I7 — "Dedicated team from application to repayment"',
    'I8 — "Transparent communication about requirements and timelines"',
    'I9 — "Support for individuals, groups, and business clients"',
    'I10 — "Minimal documentation" (where stated on products)',
  ];

  claims.forEach((claim) => {
    form.addMultipleChoiceItem()
      .setTitle(claim)
      .setChoices(['True', 'Partially true', 'False', 'Unverified / needs review'].map((c) => form.createChoice(c)))
      .setRequired(true);
  });

  // --- Section J ---
  addSection(form, 'Section J — Website Gaps & Compliance');

  const gaps = [
    ['J1', 'Publish APR / effective annual rate alongside monthly rates'],
    ['J2', 'Add Privacy Policy page'],
    ['J3', 'Add Terms of Use page'],
    ['J4', 'Publish complaints / ombudsman procedure'],
    ['J5', 'Publish KYC / anti-fraud requirements'],
    ['J6', 'Add regulatory disclaimer in footer (e.g. UMRA / BoU)'],
    ['J7', 'Add client testimonials or case studies'],
    ['J8', 'List all 8 products on homepage and footer (not just 4)'],
  ];

  gaps.forEach(([id, label]) => {
    form.addMultipleChoiceItem()
      .setTitle(id + ' — ' + label)
      .setChoices(['Yes — add soon', 'Already exists elsewhere', 'Not needed', 'Unsure'].map((c) => form.createChoice(c)))
      .setRequired(true);
  });

  // --- Section K — Client discovery ---
  addSection(form, 'Section K — Client Pre-Qualification (for website visitors)');

  form.addParagraphTextItem()
    .setTitle(
      'Optional: If you are completing this as a prospective borrower, fill in the fields below. ' +
        'Staff may skip this section.'
    )
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('K1 — I am applying as')
    .setChoices([
      'Individual',
      'Civil servant',
      'SME / business owner',
      'Farmer',
      'Student / guardian (education loan)',
      'Other',
    ].map((c) => form.createChoice(c)))
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('K2 — Product of interest')
    .setChoices(productNames().map((c) => form.createChoice(c)))
    .setRequired(false);

  form.addTextItem()
    .setTitle('K3 — Loan amount needed (UGX)')
    .setRequired(false);

  form.addTextItem()
    .setTitle('K4 — Preferred repayment period')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('K5 — Employment status')
    .setChoices([
      'Salaried — government',
      'Salaried — private sector',
      'Self-employed',
      'Business owner',
      'Unemployed / other',
    ].map((c) => form.createChoice(c)))
    .setRequired(false);

  form.addTextItem()
    .setTitle('K6 — Approximate monthly income (UGX)')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('K7 — Collateral available')
    .setChoices([
      'None',
      'Vehicle (logbook)',
      'Business assets',
      'Property',
      'Other',
    ].map((c) => form.createChoice(c)))
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('K8 — Purpose of loan')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('K9 — Preferred application channel')
    .setChoices(['Branch visit', 'Phone', 'Email', 'Online'].map((c) => form.createChoice(c)))
    .setRequired(false);

  form.addTextItem()
    .setTitle('K10 — Nearest town / branch location in Uganda')
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('K11 — Have you borrowed from M&T before?')
    .setChoices(['Yes', 'No'].map((c) => form.createChoice(c)))
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('K12 — How did you hear about M&T?')
    .setChoices([
      'Website',
      'Referral',
      'Branch',
      'Social media',
      'Other',
    ].map((c) => form.createChoice(c)))
    .setRequired(false);

  // --- Final ---
  addSection(form, 'Final — Priority Fixes & Additional Notes');

  form.addCheckboxItem()
    .setTitle('Which website inconsistencies should be fixed FIRST?')
    .setChoices([
      'Product count mismatch (4+ vs 8 products)',
      'Email mismatch (info@m&tmicrofinance.com vs info@mtmicrofinance.com)',
      'Branch coverage wording vs single branch listed',
      '"Online application" claim vs contact form only',
      'Interest rate / APR disclosure',
      'Awards missing issuer or year',
      'Missing founding year & license info',
      'Contact form not sending to real inbox',
    ].map((c) => form.createChoice(c)))
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('Any other corrections, facts, or content to add to the website?')
    .setRequired(false);

  const editUrl = form.getEditUrl();
  const publishedUrl = form.getPublishedUrl();

  Logger.log('Form created successfully.');
  Logger.log('Edit URL: ' + editUrl);
  Logger.log('Share / fill URL: ' + publishedUrl);

  // Store URLs in script properties for later retrieval
  PropertiesService.getScriptProperties().setProperties({
    MT_FORM_EDIT_URL: editUrl,
    MT_FORM_PUBLISHED_URL: publishedUrl,
  });

  return { editUrl: editUrl, publishedUrl: publishedUrl };
}

/** Run this to print stored form URLs if you already created the form. */
function showLastFormUrls() {
  const props = PropertiesService.getScriptProperties();
  Logger.log('Edit URL: ' + (props.getProperty('MT_FORM_EDIT_URL') || '(not set — run createMTMicrofinanceQuestionnaire first)'));
  Logger.log('Published URL: ' + (props.getProperty('MT_FORM_PUBLISHED_URL') || '(not set)'));
}

// --- Helpers ---

function addSection(form, title) {
  form.addPageBreakItem().setTitle(title);
}

function addFactCheck(form, title, websiteStatement) {
  form.addMultipleChoiceItem()
    .setTitle(title)
    .setHelpText(websiteStatement)
    .setChoices(['Confirmed', 'Needs Update', 'Remove from Website', 'Unsure'].map((c) => form.createChoice(c)))
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle(title + ' — Correct information (if update needed)')
    .setRequired(false);
}

function addProductBlock(form, product) {
  form.addPageBreakItem().setTitle('Product: ' + product.name);

  form.addMultipleChoiceItem()
    .setTitle(product.name + ' — Is this product currently offered?')
    .setChoices(['Yes — active', 'Planned', 'Discontinued', 'Unsure'].map((c) => form.createChoice(c)))
    .setRequired(true);

  const facts = [
    'Amount: ' + product.amount,
    'Term: ' + product.term,
    'Rate: ' + product.rate,
  ].concat(product.features.map((f) => 'Feature: ' + f));

  facts.forEach((fact) => {
    form.addMultipleChoiceItem()
      .setTitle(fact)
      .setChoices(['Confirmed', 'Needs Update', 'Remove', 'Unsure'].map((c) => form.createChoice(c)))
      .setRequired(true);
  });

  form.addParagraphTextItem()
    .setTitle(product.name + ' — Corrections or missing details')
    .setRequired(false);
}

function productNames() {
  return [
    'Personal Loans',
    'Civil Servants Loans',
    'Logbook Finance',
    'SME Loans',
    'Agriculture Loans',
    'Education Loans',
    'Medical Emergency Loans',
    'Asset Finance',
  ];
}

function getProductFacts() {
  return [
    {
      name: 'Personal Loans',
      amount: 'UGX 100,000 – 150,000,000',
      term: '18 & 24 months',
      rate: 'From 2.5% per month',
      features: [
        'Quick approval',
        'Minimal documentation',
        'No collateral for small amounts',
        'Online application available',
      ],
    },
    {
      name: 'Civil Servants Loans',
      amount: 'UGX 100,000 – 30,000,000',
      term: '3 – 96 months',
      rate: 'From 2.0% per month',
      features: [
        'Government employees only',
        'Salary-based assessment',
        'Salary deduction option',
        'Preferential rates',
      ],
    },
    {
      name: 'Logbook Finance',
      amount: 'UGX 3,000,000 – 50,000,000',
      term: '3 – 18 months',
      rate: 'From 2.8% per month',
      features: [
        'Up to 60% of vehicle value',
        'Keep and use vehicle',
        'Processing in 3 days',
        'All vehicle types accepted',
      ],
    },
    {
      name: 'SME Loans',
      amount: 'UGX 100,000 – 150,000,000',
      term: '1 – 36 months',
      rate: 'From 2.2% per month',
      features: [
        'Working capital support',
        'Equipment & inventory financing',
        'Business advisory included',
        'No prepayment penalties',
      ],
    },
    {
      name: 'Agriculture Loans',
      amount: 'UGX 500,000 – 50,000,000',
      term: '6 – 24 months',
      rate: 'From 2.0% per month',
      features: [
        'Seasonal / harvest-aligned repayment',
        'Crop & livestock financing',
        'Farm equipment loans',
        'Special rates for cooperatives',
      ],
    },
    {
      name: 'Education Loans',
      amount: 'UGX 500,000 – 20,000,000',
      term: '6 – 48 months',
      rate: 'From 2.3% per month',
      features: [
        'School fees financing',
        'Deferred payment options',
        'Support for multiple children',
        'Quick approval for students',
      ],
    },
    {
      name: 'Medical Emergency Loans',
      amount: 'UGX 200,000 – 10,000,000',
      term: '3 – 12 months',
      rate: 'From 2.5% per month',
      features: [
        'Fast emergency approval',
        'Hospital bill financing',
        'Same-day disbursement available',
        'Minimal documentation',
      ],
    },
    {
      name: 'Asset Finance',
      amount: 'UGX 1,000,000 – 100,000,000',
      term: '12 – 60 months',
      rate: 'From 2.0% per month',
      features: [
        'Vehicle financing',
        'Machinery & equipment',
        'Up to 80% financing',
        'Asset-based security',
      ],
    },
  ];
}
