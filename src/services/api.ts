// ── Mode Detection ──────────────────────────────────────────
// VITE_REMOTE_MODE=true  → connects to remote PostgreSQL server
// VITE_REMOTE_MODE=false → uses local SQLite (default for dev)
const isRemote = import.meta.env.VITE_REMOTE_MODE === 'true';
const REMOTE_URL = import.meta.env.VITE_REMOTE_API_URL || 'http://192.168.1.100:3000';
const LOCAL_URL = 'http://localhost:3000';

const API_URL = `${isRemote ? REMOTE_URL : LOCAL_URL}/api`;

export const isRemoteMode = isRemote;
console.log(`🌐 API Mode: ${isRemote ? 'REMOTE' : 'LOCAL'} → ${API_URL}`);

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
            if (!response.ok) throw new Error('Invalid credentials');
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
        create: (data: any) => fetch(`${API_URL}/repayments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) throw new Error('Failed to record repayment');
            return r.json();
        })
    },
    branches: {
        getAll: () => fetch(`${API_URL}/branches`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch branches');
            return r.json();
        }),
    },
    territories: {
        getAll: () => fetch(`${API_URL}/territories`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch territories');
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
        }).then(r => {
            if (!r.ok) throw new Error('Failed to update product');
            return r.json();
        }),
        create: (data: any) => fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) throw new Error('Failed to create product');
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
        getChartData: () => fetch(`${API_URL}/reports/chart-data`, { headers: getHeaders() }).then(r => {
            if (!r.ok) throw new Error('Failed to fetch chart data');
            return r.json();
        }),
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
        }
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
        create: async (data: any) => {
            const response = await fetch(`${API_URL}/applications`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create application');
            return response.json();
        },
        updateStatus: async (id: string, status: string) => {
            const response = await fetch(`${API_URL}/applications/${id}/status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status }),
            });
            if (!response.ok) throw new Error('Failed to update status');
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
    groups: {
        getAll: async () => {
            const response = await fetch(`${API_URL}/groups`, { headers: getHeaders() });
            if (!response.ok) throw new Error('Failed to fetch groups');
            return response.json();
        }
    },
    collateral: {
        getAll: async () => {
            const response = await fetch(`${API_URL}/collateral`, { headers: getHeaders() });
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
        }
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
        if (!response.ok) throw new Error('Failed to upload file');
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
    }
};
