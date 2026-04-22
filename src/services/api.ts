// ── Mode Detection ──────────────────────────────────────────
// VITE_USE_SUPABASE=true  → remote API (default http://localhost:5000 — must match Electron + PORT in .env)
// VITE_USE_SUPABASE=false → local SQLite in desktop (Port 3000)
const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
const REMOTE_URL = import.meta.env.VITE_REMOTE_API_URL || 'http://localhost:5000';
const LOCAL_URL = 'http://localhost:3000';

const API_URL = `${useSupabase ? REMOTE_URL : LOCAL_URL}/api`;

/** Base URL for uploaded files (e.g. `/uploads/...` or full URLs from POST /upload) */
export const API_ORIGIN = useSupabase ? REMOTE_URL : LOCAL_URL;

export const isRemoteMode = useSupabase;
console.log(`🌐 API Mode: ${useSupabase ? 'SUPABASE' : 'LOCAL'} → ${API_URL}`);

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    auth: {
        login: async (credentials: any) => {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            if (!response.ok) {
                let errorMsg = 'Invalid credentials';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) {
                    // Fallback to text or status if not JSON
                }
                throw new Error(errorMsg);
            }
            const data = await response.json();
            localStorage.setItem('token', data.token);
            return data;
        },
        getMe: async () => {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: getHeaders(),
            });
            if (!response.ok) throw new Error('Session expired');
            return response.json();
        },
        logout: () => {
            localStorage.removeItem('token');
        }
    },
    repayments: {
        getAll: async () => {
            const response = await fetch(`${API_URL}/repayments`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch repayments');
            return response.json();
        },
        create: async (data: any) => {
            const r = await fetch(`${API_URL}/repayments`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!r.ok) {
                let msg = 'Failed to record repayment';
                try {
                    const err = await r.json();
                    msg = err.error || msg;
                } catch { /* ignore */ }
                throw new Error(msg);
            }
            return r.json();
        },
        reallocateHistory: (data: any) => fetch(`${API_URL}/repayments/reallocate-history`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(async r => {
            if (!r.ok) {
                let msg = 'Failed to reallocate historical payment';
                try {
                    const err = await r.json();
                    msg = err.error || msg;
                } catch (_) { /* ignore */ }
                throw new Error(msg);
            }
            return r.json();
        }),
        getHistory: async (loanApplicationId: string) => {
            const r = await fetch(`${API_URL}/repayments/history/${loanApplicationId}`, {
                headers: getHeaders(),
            });
            if (!r.ok) {
                let msg = 'Failed to load repayment history';
                try { const err = await r.json(); msg = err.error || msg; } catch { /* ignore */ }
                throw new Error(msg);
            }
            return r.json();
        },
        update: async (id: string, data: any) => {
            const r = await fetch(`${API_URL}/repayments/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!r.ok) {
                let msg = 'Failed to update repayment';
                try { const err = await r.json(); msg = err.error || msg; } catch { /* ignore */ }
                throw new Error(msg);
            }
            return r.json();
        }
    },
    branches: {
        getAll: () => fetch(`${API_URL}/branches`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch branches');
            return r.json();
        }),
        create: (data: any) => fetch(`${API_URL}/branches`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) return r.json().then(e => { throw new Error(e.error || 'Failed to create branch'); });
            return r.json();
        }),
        update: (id: string, data: any) => fetch(`${API_URL}/branches/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) return r.json().then(e => { throw new Error(e.error || 'Failed to update branch'); });
            return r.json();
        }),
        remove: (id: string) => fetch(`${API_URL}/branches/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        }).then(r => {
            if (!r.ok) throw new Error('Failed to delete branch');
            return r.json();
        }),
    },
    territories: {
        getAll: () => fetch(`${API_URL}/territories`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch territories');
            return r.json();
        }),
        create: (data: any) => fetch(`${API_URL}/territories`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) return r.json().then(e => { throw new Error(e.error || 'Failed to create territory'); });
            return r.json();
        }),
        remove: (id: string) => fetch(`${API_URL}/territories/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        }).then(r => {
            if (!r.ok) throw new Error('Failed to delete territory');
            return r.json();
        }),
    },
    products: {
        getAll: () => fetch(`${API_URL}/products`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch products');
            return r.json();
        }),
        update: (id: string, data: any) => fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(async r => {
            if (!r.ok) {
                let msg = 'Failed to update product';
                try {
                    const j = await r.json();
                    msg = j.error || msg;
                } catch { /* ignore */ }
                throw new Error(msg);
            }
            return r.json();
        }),
        create: (data: any) => fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(async r => {
            if (!r.ok) {
                let msg = 'Failed to create product';
                try {
                    const j = await r.json();
                    msg = j.error || msg;
                } catch { /* ignore */ }
                throw new Error(msg);
            }
            return r.json();
        }),
        delete: (id: string) => fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        }).then(async r => {
            if (!r.ok) {
                let msg = 'Failed to delete product';
                try {
                    const j = await r.json();
                    msg = j.error || msg;
                } catch { /* ignore */ }
                throw new Error(msg);
            }
            return r.json();
        }),
    },
    reports: {
        getStats: () => fetch(`${API_URL}/reports/stats`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch report stats');
            return r.json();
        }),
        getDashboardStats: () => fetch(`${API_URL}/reports/dashboard-stats`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch dashboard stats');
            return r.json();
        }),
        getChartData: (params?: { months?: number }) => {
            const qs = params?.months ? `?months=${params.months}` : '';
            return fetch(`${API_URL}/reports/chart-data${qs}`, { headers: getHeaders() }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch chart data');
                return r.json();
            });
        },
        getGrowthStats: () => fetch(`${API_URL}/reports/growth-stats`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch growth stats');
            return r.json();
        }),
        getRoiStats: () => fetch(`${API_URL}/reports/roi-stats`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch ROI stats');
            return r.json();
        }),
        getForecast: () => fetch(`${API_URL}/reports/forecast`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch forecast');
            return r.json();
        }),
        downloadAiSummaryDocx: async () => {
            const response = await fetch(`${API_URL}/reports/ai-summary-docx`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to generate AI summary');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'MT_AI_Summary.docx';
            a.click();
        },
        downloadFinancialExportXlsx: async () => {
            const response = await fetch(`${API_URL}/reports/financial-export-xlsx`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to export financials');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'MT_Financial_Report.xlsx';
            a.click();
        },
        downloadFinancialAnalysisDocx: async () => {
            const response = await fetch(`${API_URL}/reports/financial-analysis-docx`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to generate financial analysis');
            const blob = await response.blob();
            const cd = response.headers.get('Content-Disposition') || '';
            const fnMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(cd);
            let filename = 'Financial_Analysis.docx';
            if (fnMatch?.[1]) filename = fnMatch[1].replace(/['"]/g, '').trim();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
        },
        getFinancialAnalysis: () => fetch(`${API_URL}/reports/financial-analysis`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch financial analysis');
            return r.json();
        }),
        getFinancialAnalysisAi: (): Promise<{ zScore: number; interpretation: string; narrative: string }> =>
            fetch(`${API_URL}/reports/financial-analysis-ai`, { headers: getHeaders() }).then(r => {
                if (!r.ok) throw new Error('Failed to generate AI analysis');
                return r.json();
            }),
        getAgingReport: (params?: { from?: string; to?: string }) => {
            const qs = new URLSearchParams();
            if (params?.from) qs.append('from', params.from);
            if (params?.to) qs.append('to', params.to);
            return fetch(`${API_URL}/reports/aging-report?${qs}`, { headers: getHeaders() }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch aging report');
                return r.json();
            });
        },
        getComprehensiveIncome: (params?: { from?: string; to?: string; year?: number }) => {
            const qs = new URLSearchParams();
            if (params?.from) qs.append('from', params.from);
            if (params?.to) qs.append('to', params.to);
            if (params?.year) qs.append('year', String(params.year));
            return fetch(`${API_URL}/reports/comprehensive-income?${qs}`, { headers: getHeaders() }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch comprehensive income');
                return r.json();
            });
        },
        downloadComprehensiveIncomeDocx: async (params?: { from?: string; to?: string; year?: number }) => {
            const qs = new URLSearchParams();
            if (params?.from) qs.append('from', params.from);
            if (params?.to) qs.append('to', params.to);
            if (typeof params?.year === 'number' && !Number.isNaN(params.year)) qs.append('year', String(params.year));
            const response = await fetch(`${API_URL}/reports/comprehensive-income-docx?${qs}`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to export comprehensive income');
            const blob = await response.blob();
            const cd = response.headers.get('Content-Disposition') || '';
            const fnMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(cd);
            let filename = 'ComprehensiveIncome.docx';
            if (fnMatch?.[1]) filename = fnMatch[1].replace(/['"]/g, '').trim();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
        },
        getFinancialPosition: (params?: { from?: string; to?: string; year?: number }) => {
            const qs = new URLSearchParams();
            if (params?.from) qs.append('from', params.from);
            if (params?.to) qs.append('to', params.to);
            if (params?.year) qs.append('year', String(params.year));
            return fetch(`${API_URL}/reports/financial-position?${qs}`, { headers: getHeaders() }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch financial position');
                return r.json();
            });
        },
        downloadFinancialPositionDocx: async (params?: { from?: string; to?: string; year?: number }) => {
            const qs = new URLSearchParams();
            if (params?.from) qs.append('from', params.from);
            if (params?.to) qs.append('to', params.to);
            if (typeof params?.year === 'number' && !Number.isNaN(params.year)) qs.append('year', String(params.year));
            const response = await fetch(`${API_URL}/reports/financial-position-docx?${qs}`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to export financial position');
            const blob = await response.blob();
            const cd = response.headers.get('Content-Disposition') || '';
            const fnMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(cd);
            let filename = 'Financial_Position.docx';
            if (fnMatch?.[1]) filename = fnMatch[1].replace(/['"]/g, '').trim();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
        },
        getCashflowStatement: (to?: string) => fetch(`${API_URL}/reports/cashflow-statement?to=${to || ''}`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch cashflow statement');
            return r.json();
        }),
        getEquityStatement: (params?: { from?: string; to?: string; year?: number }) => {
            const qs = new URLSearchParams();
            if (params?.from) qs.append('from', params.from);
            if (params?.to) qs.append('to', params.to);
            if (params?.year) qs.append('year', String(params.year));
            return fetch(`${API_URL}/reports/equity-statement?${qs}`, { headers: getHeaders() }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch equity statement');
                return r.json();
            });
        },
        downloadEquityStatementDocx: async (year?: number) => {
            const response = await fetch(`${API_URL}/reports/equity-statement-docx?year=${year || ''}`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to export equity statement');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `EquityStatement_${year || 2025}.docx`;
            a.click();
        },
    },
    applications: {
        getAll: async () => {
            const response = await fetch(`${API_URL}/applications`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch applications');
            return response.json();
        },
        getActive: async () => {
            const response = await fetch(`${API_URL}/applications/active`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch active loans');
            return response.json();
        },
        getById: async (id: string) => {
            const response = await fetch(`${API_URL}/applications/${id}`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch application details');
            return response.json();
        },
        analyze: async (id: string) => {
            const response = await fetch(`${API_URL}/applications/${id}/analyze`, {
                method: 'POST',
                headers: getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to analyze application');
            return response.json();
        },
        create: async (data: any) => {
            const response = await fetch(`${API_URL}/applications`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create application');
            return response.json();
        },
        updateStatus: async (id: string, status: string, extraData?: any) => {
            const response = await fetch(`${API_URL}/applications/${id}/status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status, ...extraData }),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                const msg = (err as { error?: string }).error;
                throw new Error(msg || 'Failed to update status');
            }
            return response.json();
        },
        update: async (id: string, data: any) => {
            const response = await fetch(`${API_URL}/applications/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update application');
            return response.json();
        },
    },
    clients: {
        getAll: async (isGroup = false) => {
            const response = await fetch(`${API_URL}/clients?isGroup=${isGroup}`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch clients');
            return response.json();
        },
        get: async (id: string) => {
            const response = await fetch(`${API_URL}/clients/${id}`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch client details');
            return response.json();
        },
        updateLocation: async (id: string, data: any) => {
            const response = await fetch(`${API_URL}/clients/${id}/location`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update location');
            return response.json();
        },
        create: async (data: any) => {
            const response = await fetch(`${API_URL}/clients`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create client');
            return response.json();
        },
    },
    borrowers: {
        getAll: async (isGroup = false) => {
            const response = await fetch(`${API_URL}/borrowers?isGroup=${isGroup}`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch borrowers');
            return response.json();
        },
        get: async (id: string) => {
            const response = await fetch(`${API_URL}/borrowers/${id}`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch borrower details');
            return response.json();
        },
        getAttachments: async (id: string) => {
            const response = await fetch(`${API_URL}/borrowers/${id}/attachments`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch borrower attachments');
            return response.json();
        },
        create: async (data: any) => {
            const response = await fetch(`${API_URL}/borrowers`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create borrower');
            return response.json();
        },
        updateLocation: async (id: string, data: any) => {
            const response = await fetch(`${API_URL}/borrowers/${id}/location`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update borrower location');
            return response.json();
        },
        update: async (id: string, data: Record<string, unknown>) => {
            const response = await fetch(`${API_URL}/borrowers/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                const msg = (err as { error?: string }).error;
                throw new Error(msg || `${response.status} ${response.statusText || 'Failed to update borrower'}`);
            }
            return response.json();
        },
    },
    groups: {
        getAll: async () => {
            const response = await fetch(`${API_URL}/groups`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch groups');
            return response.json();
        }
    },
    guarantors: {
        getAll: async () => {
            const response = await fetch(`${API_URL}/guarantors`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch guarantors');
            return response.json();
        },
        create: async (data: any) => {
            const response = await fetch(`${API_URL}/guarantors`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create guarantor');
            return response.json();
        },
        update: async (id: string, data: any) => {
            const response = await fetch(`${API_URL}/guarantors/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update guarantor');
            return response.json();
        },
        delete: async (id: string) => {
            const response = await fetch(`${API_URL}/guarantors/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to delete guarantor');
            return response.json();
        },
    },
    collateral: {
        getAll: async (availableOnly = false) => {
            const url = availableOnly ? `${API_URL}/collateral?available=true` : `${API_URL}/collateral`;
            const response = await fetch(url, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch collateral');
            return response.json();
        },
        getById: async (id: string) => {
            const response = await fetch(`${API_URL}/collateral/${id}`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch collateral');
            return response.json();
        },
        create: async (data: any) => {
            const response = await fetch(`${API_URL}/collateral`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create collateral');
            return response.json();
        },
        update: async (id: string, data: {
            borrower_id?: string | null;
            loan_application_id?: string | null;
            type?: string;
            description?: string;
            estimated_value?: number;
            current_value?: number | null;
            status?: string;
            location?: string | null;
            registration_number?: string | null;
            notes?: string | null;
        }) => {
            const response = await fetch(`${API_URL}/collateral/${id}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update collateral');
            return response.json();
        },
    },
    ai: {
        getConversations: () => fetch(`${API_URL}/ai/conversations`, { headers: getHeaders() }).then(r => r.json()),
        getMessages: (id: string) => fetch(`${API_URL}/ai/conversations/${id}/messages`, { headers: getHeaders() }).then(r => r.json()),
        createConversation: (title: string) => fetch(`${API_URL}/ai/conversations`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ title }),
        }).then(r => r.json()),
        saveMessage: (id: string, role: string, content: string) => fetch(`${API_URL}/ai/conversations/${id}/messages`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ role, content }),
        }).then(r => r.json()),
        deleteConversation: (id: string) => fetch(`${API_URL}/ai/conversations/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        }).then(r => r.json()),
        chat: (messages: any[]) => fetch(`${API_URL}/ai/chat`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ messages }),
        }).then(r => r.json()),
    },
    upload: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData,
        });
        if (!response.ok) {
            const detail = response.status === 401
                ? 'Not signed in or session expired — log in again.'
                : response.status === 404
                    ? 'Upload API not found — is the backend running with /api/upload?'
                    : `HTTP ${response.status}`;
            let body = '';
            try { body = (await response.clone().json()).error; } catch { /* ignore */ }
            throw new Error(body || detail);
        }
        return response.json();
    },
    users: {
        getAll: () => fetch(`${API_URL}/users`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch users');
            return r.json();
        }),
        create: (data: any) => fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) return r.json().then(err => { throw new Error(err.error || 'Failed to create user') });
            return r.json();
        })
    },
    notifications: {
        getAll: () => fetch(`${API_URL}/notifications`, { headers: getHeaders() }).then(r => r.json()),
        markRead: (id: string) => fetch(`${API_URL}/notifications/${id}/read`, {
            method: 'PATCH',
            headers: getHeaders()
        }).then(r => r.json()),
        markAllRead: () => fetch(`${API_URL}/notifications/read-all`, {
            method: 'PATCH',
            headers: getHeaders()
        }).then(r => r.json())
    },
    accounting: {
        getEntries: (params?: { type?: string; from?: string; to?: string; category?: string; limit?: number; offset?: number }) => {
            const qs = new URLSearchParams();
            if (params?.type) qs.append('type', params.type);
            if (params?.from) qs.append('from', params.from);
            if (params?.to) qs.append('to', params.to);
            if (params?.category) qs.append('category', params.category);
            if (params?.limit) qs.append('limit', String(params.limit));
            if (params?.offset) qs.append('offset', String(params.offset));
            return fetch(`${API_URL}/accounting/entries?${qs}`, { headers: getHeaders() }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch entries');
                return r.json();
            });
        },
        createEntry: (data: any) => fetch(`${API_URL}/accounting/entries`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) return r.json().then((e: any) => { throw new Error(e.error || 'Failed to create entry'); });
            return r.json();
        }),
        updateEntry: (id: string, data: {
            entry_type?: 'revenue' | 'expense';
            category?: string;
            description?: string | null;
            narration?: string | null;
            amount?: number;
            entry_date?: string;
            payment_method?: string;
        }) => fetch(`${API_URL}/accounting/entries/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) return r.json().then((e: any) => { throw new Error(e.error || 'Failed to update entry'); });
            return r.json();
        }),
        deleteEntry: (id: string) => fetch(`${API_URL}/accounting/entries/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        }).then(r => {
            if (!r.ok) throw new Error('Failed to delete entry');
            return r.json();
        }),
        getPlSummary: () => fetch(`${API_URL}/accounting/pl-summary`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch P&L summary');
            return r.json();
        }),
        getCurrentMonthSummary: () => fetch(`${API_URL}/accounting/current-month-summary`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch current month summary');
            return r.json();
        }),
        getCategories: () => fetch(`${API_URL}/accounting/categories`, { headers: getHeaders() }).then(r => r.json()),
        getIncomeStatement: (params?: { from?: string; to?: string; period?: string }) => {
            const qs = new URLSearchParams();
            if (params?.from) qs.append('from', params.from);
            if (params?.to) qs.append('to', params.to);
            if (params?.period) qs.append('period', params.period);
            return fetch(`${API_URL}/accounting/income-statement?${qs}`, { headers: getHeaders() }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch income statement');
                return r.json();
            });
        },
        getBalanceSheet: (params?: { to?: string }) => {
            const qs = params?.to ? `?to=${params.to}` : '';
            return fetch(`${API_URL}/accounting/balance-sheet${qs}`, { headers: getHeaders() }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch balance sheet');
                return r.json();
            });
        },
        getCashFlow: (params?: { from?: string; to?: string; period?: string }) => {
            const qs = new URLSearchParams();
            if (params?.from) qs.append('from', params.from);
            if (params?.to) qs.append('to', params.to);
            if (params?.period) qs.append('period', params.period);
            return fetch(`${API_URL}/accounting/cash-flow?${qs}`, { headers: getHeaders() }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch cash flow');
                return r.json();
            });
        },
        getLoanPortfolio: (params?: { to?: string }) => {
            const qs = params?.to ? `?to=${params.to}` : '';
            return fetch(`${API_URL}/accounting/loan-portfolio${qs}`, { headers: getHeaders() }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch loan portfolio');
                return r.json();
            });
        },
        getDelinquency: (params?: { to?: string }) => {
            const qs = params?.to ? `?to=${params.to}` : '';
            return fetch(`${API_URL}/accounting/delinquency${qs}`, { headers: getHeaders() }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch delinquency report');
                return r.json();
            });
        },
        getRepaymentCollection: (params?: { from?: string; to?: string; period?: string }) => {
            const qs = new URLSearchParams();
            if (params?.from) qs.append('from', params.from);
            if (params?.to) qs.append('to', params.to);
            if (params?.period) qs.append('period', params.period);
            return fetch(`${API_URL}/accounting/repayment-collection?${qs}`, { headers: getHeaders() }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch repayment collection');
                return r.json();
            });
        },
        getTrialBalance: (params?: { to?: string }) => {
            const qs = params?.to ? `?to=${params.to}` : '';
            return fetch(`${API_URL}/accounting/trial-balance${qs}`, { headers: getHeaders() }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch trial balance');
                return r.json();
            });
        },
        getDashboardKpis: () => fetch(`${API_URL}/accounting/dashboard-kpis`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch dashboard KPIs');
            return r.json();
        }),
        getCashBook: (params?: { from?: string; to?: string; account?: string }) => {
            const qs = new URLSearchParams();
            if (params?.from) qs.append('from', params.from);
            if (params?.to) qs.append('to', params.to);
            if (params?.account) qs.append('account', params.account);
            return fetch(`${API_URL}/accounting/cash-book?${qs}`, { headers: getHeaders() }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch cash book');
                return r.json();
            });
        },
    },
    creditors: {
        getAll: () => fetch(`${API_URL}/creditors`, { headers: getHeaders() }).then(r => r.json()),
        create: (data: any) => fetch(`${API_URL}/creditors`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) return r.json().then(err => { throw new Error(err.error || 'Failed to create creditor') });
            return r.json();
        }),
        update: (id: string, data: any) => fetch(`${API_URL}/creditors/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) return r.json().then(err => { throw new Error(err.error || 'Failed to update creditor') });
            return r.json();
        }),
        recordRepayment: (id: string, data: any) => fetch(`${API_URL}/creditors/${id}/repayments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) return r.json().then(err => { throw new Error(err.error || 'Failed to record repayment') });
            return r.json();
        }),
    },
    assets: {
        getAll: () => fetch(`${API_URL}/assets`, { headers: getHeaders() }).then(r => r.json()),
        create: (data: any) => fetch(`${API_URL}/assets`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) return r.json().then(err => { throw new Error(err.error || 'Failed to create asset') });
            return r.json();
        }),
        update: (id: string, data: any) => fetch(`${API_URL}/assets/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) return r.json().then(err => { throw new Error(err.error || 'Failed to update asset') });
            return r.json();
        }),
    },
    payroll: {
        getContracts: () => fetch(`${API_URL}/payroll/contracts`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch payroll contracts');
            return r.json();
        }),
        saveContract: (data: any) => fetch(`${API_URL}/payroll/contracts`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) return r.json().then(err => { throw new Error(err.error || 'Failed to save contract') });
            return r.json();
        }),
        getHistory: () => fetch(`${API_URL}/payroll/history`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch payroll history');
            return r.json();
        }),
        process: (data: { month: number; year: number }) => fetch(`${API_URL}/payroll/process`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) return r.json().then(err => { throw new Error(err.error || 'Failed to process payroll') });
            return r.json();
        }),
        markAsPaid: (id: string, data: { payment_method: string }) => fetch(`${API_URL}/payroll/records/${id}/pay`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) return r.json().then(err => { throw new Error(err.error || 'Failed to record payment') });
            return r.json();
        }),
        deleteRecord: (id: string) => fetch(`${API_URL}/payroll/records/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        }).then(r => {
            if (!r.ok) throw new Error('Failed to delete record');
            return r.json();
        }),
    }
};
