const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');
const OpenAI = require('openai');

router.use(authenticateToken);

// Tools definition
const tools = [
    {
        type: "function",
        function: {
            name: "query_loan_applications",
            description: "Query loan applications from the database. Can filter by status (pending, approved, rejected).",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["pending", "approved", "rejected", "all"],
                        description: "Filter by application status"
                    },
                    limit: {
                        type: "number",
                        description: "Maximum number of results to return"
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "query_clients",
            description: "Query client information from the database. Can search by name or email.",
            parameters: {
                type: "object",
                properties: {
                    search: {
                        type: "string",
                        description: "Search term for client name or email"
                    },
                    limit: {
                        type: "number",
                        description: "Maximum number of results to return"
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_loan_statistics",
            description: "Get statistics about loans including total applications, approved loans, rejection rate, and total amount disbursed.",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "query_client_loans",
            description: "Get all loans for a specific client by their user_id.",
            parameters: {
                type: "object",
                properties: {
                    user_id: {
                        type: "string",
                        description: "The UUID of the client"
                    }
                },
                required: ["user_id"]
            }
        }
    }
];

// Tool execution logic
async function executeTool(toolName, args, user_id) {
    console.log(`Executing tool: ${toolName}`, args);

    switch (toolName) {
        case "query_loan_applications": {
            const { status = "all", limit = 10 } = args;
            let queryText = 'SELECT * FROM loan_applications';
            const queryParams = [];

            if (status !== "all") {
                queryText += ' WHERE status = $1';
                queryParams.push(status);
            }

            queryText += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1);
            queryParams.push(limit);

            try {
                const result = await db.query(queryText, queryParams);
                return { data: result.rows, count: result.rows.length };
            } catch (error) {
                return { error: error.message };
            }
        }

        case "query_clients": {
            const { search = "", limit = 10 } = args;
            let queryText = 'SELECT * FROM profiles';
            const queryParams = [];

            if (search) {
                queryText += ' WHERE full_name ILIKE $1 OR email ILIKE $1';
                queryParams.push(`%${search}%`);
            }

            queryText += ' LIMIT $' + (queryParams.length + 1);
            queryParams.push(limit);

            try {
                const result = await db.query(queryText, queryParams);
                return { data: result.rows, count: result.rows.length };
            } catch (error) {
                return { error: error.message };
            }
        }

        case "get_loan_statistics": {
            try {
                const totalAppsQuery = await db.query('SELECT COUNT(*) FROM loan_applications');
                const approvedQuery = await db.query('SELECT loan_amount FROM loan_applications WHERE status = $1', ['approved']);
                const rejectedQuery = await db.query('SELECT COUNT(*) FROM loan_applications WHERE status = $1', ['rejected']);

                const totalApps = parseInt(totalAppsQuery.rows[0].count);
                const approvedCount = approvedQuery.rows.length;
                const rejectedCount = parseInt(rejectedQuery.rows[0].count);
                const totalAmount = approvedQuery.rows.reduce((sum, row) => sum + parseFloat(row.loan_amount || 0), 0);

                return {
                    total_applications: totalApps,
                    approved_count: approvedCount,
                    rejected_count: rejectedCount,
                    total_amount_disbursed: totalAmount,
                    currency: "UGX"
                };
            } catch (error) {
                return { error: error.message };
            }
        }

        case "query_client_loans": {
            const { user_id: target_user_id } = args;

            try {
                const result = await db.query(
                    'SELECT * FROM loan_applications WHERE user_id = $1 ORDER BY created_at DESC',
                    [target_user_id]
                );
                return { data: result.rows, count: result.rows.length };
            } catch (error) {
                return { error: error.message };
            }
        }

        default:
            return { error: "Unknown tool" };
    }
}

// Get all conversations for the user
router.get('/conversations', async (req, res) => {
    try {
        const { user_id } = req.user;
        const result = await db.query(
            'SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC',
            [user_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Create a new conversation
router.post('/conversations', async (req, res) => {
    try {
        const { user_id } = req.user;
        const { title } = req.body;
        const result = await db.query(
            'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *',
            [user_id, title]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

// Save a message
router.post('/conversations/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { role, content } = req.body;

        // 1. Save message
        const result = await db.query(
            'INSERT INTO chat_messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING *',
            [id, role, content]
        );

        // 2. Update conversation timestamp
        await db.query(
            'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
            [id]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// Delete a conversation
router.delete('/conversations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM conversations WHERE id = $1', [id]);
        res.json({ message: 'Conversation deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

// AI Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        const { user_id } = req.user;
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

        if (!OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OPENAI_API_KEY is not configured' });
        }

        const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

        const systemMessage = {
            role: "system",
            content: `You are a financial assistant for a loan management system. You can help staff members:
- Query loan applications by status
- Search for client information
- Get loan statistics and analytics
- Retrieve specific client loan history

When providing information:
- Be concise and professional
- Format numbers clearly (use commas for thousands)
- Use UGX for currency
- Provide actionable insights when relevant
- If you need to query data, use the available tools

Always confirm what information you're retrieving before using a tool.`
        };

        const conversationMessages = [systemMessage, ...messages];

        // Initial API call
        let runner = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: conversationMessages,
            tools: tools,
            tool_choice: "auto",
        });

        const assistantMessage = runner.choices[0].message;

        // If there are tool calls, execute them
        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
            // Append assistant's message (with tool calls) to history
            conversationMessages.push(assistantMessage);

            for (const toolCall of assistantMessage.tool_calls) {
                const toolName = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments);

                const toolResult = await executeTool(toolName, toolArgs, user_id);

                conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(toolResult)
                });
            }

            // Get final response with tool results
            const finalResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: conversationMessages,
            });

            return res.json({ response: finalResponse.choices[0].message.content });
        }

        // No tool calls, just return the response
        res.json({ response: assistantMessage.content });

    } catch (err) {
        console.error('Error in AI chat:', err);
        res.status(500).json({ error: 'AI processing failed: ' + err.message });
    }
});

module.exports = router;
