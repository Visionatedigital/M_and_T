const OpenAI = require('openai');

const generateFinancialSummary = async (stats) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'mock' || apiKey.includes('sk-proj-placeholder')) {
        return "AI Summary is in mock mode or API key is invalid. Please configure a valid OpenAI API Key. Based on the data, the branch is showing consistent performance across all loan products.";
    }

    const openai = new OpenAI({ apiKey });

    try {
        const prompt = `
            Analyze the following financial data for M&T Growth Gateway (a microfinance institution) and provide a professional, concise executive summary (around 200-300 words). 
            Focus on trends, risks, and recommendations.

            Financial Metrics:
            - Total Applications: ${stats.loanStats.totalApplications}
            - Approved Loans: ${stats.loanStats.approvedLoans}
            - Pending Applications: ${stats.loanStats.pendingLoans}
            - Total Disbursed: UGX ${stats.loanStats.totalDisbursed.toLocaleString()}
            - Total Interest Expected: UGX ${stats.loanStats.totalInterest.toLocaleString()}
            - Total Collected: UGX ${stats.loanStats.totalPaid.toLocaleString()}
            - Outstanding Portfolio: UGX ${stats.loanStats.outstandingPortfolio.toLocaleString()}
            - Collection Efficiency: ${stats.loanStats.collectionEfficiency.toFixed(2)}%
            - Approval Rate: ${stats.loanStats.approvalRate.toFixed(1)}%
            - Active Clients: ${stats.clientStats.activeClients}
            - Average Client Credit Score: ${stats.clientStats.avgCreditScore}
            - New Clients This Month: ${stats.clientStats.newClientsThisMonth}
            
            Product Performance:
            ${stats.productStats.map(p => `- ${p.product}: ${p.applications} apps, UGX ${p.totalAmount.toLocaleString()} disbursed`).join('\n')}

            Output the summary as a structured report with:
            1. Executive Overview
            2. Portfolio Performance & Collection Analysis
            3. Operational Efficiency & Risk Metrics
            4. Strategic Recommendations for Growth and Risk Mitigation
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a senior financial analyst providing executive summaries for a microfinance institution." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating AI summary:', error);
        return "Failed to generate AI summary. Please check system logs for details.";
    }
};

/**
 * Analyze a loan application and provide AI-powered suggestions based on metrics.
 * @param {Object} application - Full loan application data
 * @param {Object} borrowerHistory - Optional: past loans, repayments, credit score
 * @returns {Promise<string>} - AI analysis and recommendations
 */
const analyzeApplication = async (application, borrowerHistory = {}) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'mock' || apiKey.includes('sk-proj-placeholder')) {
        return "AI analysis requires a valid OpenAI API key. Add OPENAI_API_KEY to your .env file. Based on the data provided: " +
            `Principal UGX ${(application.loan_amount || 0).toLocaleString()}, ` +
            `Duration ${application.loan_duration_months || 4} months, ` +
            `Product: ${application.loan_product || 'N/A'}. ` +
            "Consider: debt-to-income ratio, repayment capacity, and document completeness before approval.";
    }

    const openai = new OpenAI({ apiKey });

    const principal = parseFloat(application.loan_amount) || 0;
    const interestRate = 0.30;
    const totalAmount = principal * (1 + interestRate);
    const monthlyIncome = parseFloat(application.monthly_income) || 0;
    const debtToIncome = monthlyIncome > 0 ? ((totalAmount / (application.loan_duration_months || 4)) / monthlyIncome * 100).toFixed(1) : 'N/A';

    const prompt = `You are a senior loan officer at a microfinance institution (M&T Growth Gateway). Analyze this loan application and provide concise, actionable recommendations.

APPLICATION DATA:
- Applicant: ${application.full_name || 'N/A'}
- Product: ${application.loan_product || 'N/A'}
- Principal: UGX ${principal.toLocaleString()}
- Total Repayment (30% interest): UGX ${totalAmount.toLocaleString()}
- Duration: ${application.loan_duration_months || 4} months
- Monthly Income: ${monthlyIncome ? `UGX ${monthlyIncome.toLocaleString()}` : 'Not provided'}
- Debt-to-Income (installment/income): ${debtToIncome}%
- Employment: ${application.employment_status || 'N/A'}${application.employer_name ? ` at ${application.employer_name}` : ''}
- Loan Purpose: ${application.loan_purpose || 'Not stated'}
- Location: ${application.district || 'N/A'}, ${application.village || 'N/A'}
- Documents: National ID ${application.attachment_national_id ? '✓' : '✗'}, LC1 ${application.attachment_lc1_letter ? '✓' : '✗'}, Recommendation ${application.attachment_recommendation_letter ? '✓' : '✗'}, Income Statement ${application.attachment_income_statement ? '✓' : '✗'}
- Guarantors: ${(application.guarantors && application.guarantors.length) || 0}
${application.group_id ? `- Group Loan: ${application.group_name || 'Yes'}, Members: ${(application.group_members && application.group_members.length) || 0}` : ''}

BORROWER HISTORY (if available):
${borrowerHistory.pastLoans ? `- Past loans: ${borrowerHistory.pastLoans}` : '- No prior loan history'}
${borrowerHistory.totalPaid ? `- Total repaid: UGX ${borrowerHistory.totalPaid.toLocaleString()}` : ''}
${borrowerHistory.creditScore ? `- Credit score: ${borrowerHistory.creditScore}` : ''}

Provide a structured analysis in 2-4 short paragraphs:
1. Risk Assessment: Key risk factors (income verification, repayment capacity, document gaps, etc.)
2. Strengths: Positive indicators (documentation, guarantors, location, group structure if applicable)
3. Recommendations: Specific approve/reject/conditional suggestions with reasoning
4. Conditions (if any): Suggested conditions (e.g., reduce amount, add guarantor, verify income)

Be concise. Use bullet points where helpful. Focus on actionable insights for the loan officer.`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a senior loan officer at a microfinance institution. Provide clear, actionable analysis. Be concise and professional." },
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating application analysis:', error);
        return "Failed to generate AI analysis. Please check that OPENAI_API_KEY is valid and has credits.";
    }
};

/**
 * AI narrative for Altman Z-Score / financial risk export (Word report).
 */
const generateFinancialRiskAnalysis = async ({ zScore, components, interpretation }) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'mock' || apiKey.includes('sk-proj-placeholder')) {
        return [
            `The score is about ${Number(zScore).toFixed(2)} (${interpretation || 'see the gauge'}).`,
            '',
            'Turn on AI on the server to get a short plain-English summary here and in Word export.',
        ].join('\n');
    }

    const openai = new OpenAI({ apiKey });
    const compLines = (components || []).map((c) =>
        `${c.id} ${c.method}: ratio ${Number(c.ratio).toFixed(4)} × weight ${c.standard} → contribution ${(c.ratio * c.standard).toFixed(4)}`
    ).join('\n');

    const prompt = `M&T Growth Gateway (Uganda, microfinance).

Z-score (rounded): ${Number(zScore).toFixed(2)}. Band: ${interpretation || 'n/a'}.

Background numbers (use only to write simply, do not copy jargon):
${compLines}

Write for loan officers and managers who are NOT accountants. Rules:
- Very easy English. Short sentences. No academic tone.
- Do NOT use labels like "Grey Zone" alone — if you mention the band, add plain words (e.g. "some risk, in the middle").
- Avoid "X1, X2…" unless you rename them in plain words (e.g. "cash vs assets").
- Maximum 110 words in total.
- Format exactly:
  (1) One paragraph: 2–3 sentences only — what this score means for the institution in simple terms.
  (2) One paragraph: 2 sentences — the one or two things that matter most (liquidity, debt, or profit) in plain language.
  (3) Three lines, each starting with "• ", each line one short sentence with a simple action (no long clauses).

No titles. No markdown. No numbered lists except the bullets with "• ".`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content:
                        'You explain financial risk in very simple English for non-experts. Be brief. Never write long paragraphs.',
                },
                { role: 'user', content: prompt },
            ],
            temperature: 0.35,
        });
        return response.choices[0].message.content || '';
    } catch (error) {
        console.error('Error generating financial risk AI narrative:', error);
        return 'AI summary could not run. The Z-score numbers in the report are still valid.';
    }
};

module.exports = { generateFinancialSummary, analyzeApplication, generateFinancialRiskAnalysis };
