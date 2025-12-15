import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

async function executeTool(toolName: string, args: any, supabase: any) {
  console.log(`Executing tool: ${toolName}`, args);

  switch (toolName) {
    case "query_loan_applications": {
      const { status = "all", limit = 10 } = args;
      let query = supabase.from('loan_applications').select('*');
      
      if (status !== "all") {
        query = query.eq('status', status);
      }
      
      query = query.order('created_at', { ascending: false }).limit(limit);
      
      const { data, error } = await query;
      
      if (error) {
        return { error: error.message };
      }
      
      return { data, count: data?.length || 0 };
    }

    case "query_clients": {
      const { search = "", limit = 10 } = args;
      let query = supabase.from('profiles').select('*');
      
      if (search) {
        query = query.or(`full_name.ilike.%${search}%`);
      }
      
      query = query.limit(limit);
      
      const { data, error } = await query;
      
      if (error) {
        return { error: error.message };
      }
      
      return { data, count: data?.length || 0 };
    }

    case "get_loan_statistics": {
      const [totalApps, approved, rejected] = await Promise.all([
        supabase.from('loan_applications').select('id', { count: 'exact', head: true }),
        supabase.from('loan_applications').select('id, loan_amount').eq('status', 'approved'),
        supabase.from('loan_applications').select('id', { count: 'exact', head: true }).eq('status', 'rejected')
      ]);
      
      const totalAmount = approved.data?.reduce((sum: number, app: any) => sum + parseFloat(app.loan_amount || 0), 0) || 0;
      
      return {
        total_applications: totalApps.count || 0,
        approved_count: approved.data?.length || 0,
        rejected_count: rejected.count || 0,
        total_amount_disbursed: totalAmount,
        currency: "UGX"
      };
    }

    case "query_client_loans": {
      const { user_id } = args;
      
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });
      
      if (error) {
        return { error: error.message };
      }
      
      return { data, count: data?.length || 0 };
    }

    default:
      return { error: "Unknown tool" };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Initial API call
    let response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...messages],
        tools: tools,
        tool_choice: "auto",
        max_completion_tokens: 1000,
      }),
    });

    let data = await response.json();
    console.log("Initial response:", JSON.stringify(data, null, 2));

    // Handle tool calls
    const assistantMessage = data.choices[0].message;
    const conversationMessages = [systemMessage, ...messages, assistantMessage];

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      // Execute all tool calls
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        const toolResult = await executeTool(toolName, toolArgs, supabase);
        
        conversationMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult)
        });
      }

      // Get final response with tool results
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: conversationMessages,
          max_completion_tokens: 1000,
        }),
      });

      data = await response.json();
    }

    const finalResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: finalResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-financial-assistant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
