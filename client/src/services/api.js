import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
})

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('hrms_token')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
})

// Response interceptor: handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('hrms_token')
            localStorage.removeItem('hrms_org')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Auth
export const login = (data) => api.post('/api/auth/login', data)
export const register = (data) => api.post('/api/auth/register', data)

// Dashboard
export const getDashboard = () => api.get('/api/dashboard')

// Employees
export const getEmployees = () => api.get('/api/employees')
export const getEmployee = (id) => api.get(`/api/employees/${id}`)
export const createEmployee = (data) => api.post('/api/employees', data)
export const updateEmployee = (id, data) => api.put(`/api/employees/${id}`, data)
export const deleteEmployee = (id) => api.delete(`/api/employees/${id}`)

// Tasks
export const getTasks = (params) => api.get('/api/tasks', { params })
export const createTask = (data) => api.post('/api/tasks', data)
export const updateTaskStatus = (id, status, txHash) =>
    api.put(`/api/tasks/${id}/status`, { status, ...(txHash && { txHash }) })
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`)

// AI
export const getProductivity = (id) => api.get(`/api/ai/productivity/${id}`)
export const getSkillGap = (id) => api.get(`/api/ai/skill-gap/${id}`)
export const getInsights = () => api.get('/api/ai/insights')
export const getSmartAssign = (taskTitle, taskDescription) =>
    api.get('/api/ai/smart-assign', { params: { taskTitle, taskDescription } })

export default api
