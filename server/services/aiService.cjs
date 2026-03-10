const OpenAI = require('openai');

const generateFinancialSummary = async (stats) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'mock' || apiKey.includes('sk-proj-placeholder')) { // Check for placeholder or missing
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
            - Approval Rate: ${stats.loanStats.approvalRate.toFixed(1)}%
            - Active Clients: ${stats.clientStats.activeClients}
            - New Clients This Month: ${stats.clientStats.newClientsThisMonth}
            
            Product Performance:
            ${stats.productStats.map(p => `- ${p.product}: ${p.applications} apps, UGX ${p.totalAmount.toLocaleString()} disbursed`).join('\n')}

            Output the summary as a structured report with:
            1. Overview
            2. Performance Highlights
            3. Risk Assessment
            4. Strategic Recommendations
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost-effective and fast
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

module.exports = {
    generateFinancialSummary
};
