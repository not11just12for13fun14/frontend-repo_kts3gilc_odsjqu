import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, CalendarDays, CheckCircle2, Clock, Download, LayoutDashboard, ListChecks, PlusCircle, Rupee, Users, TrendingUp } from 'lucide-react'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Navbar() {
  const location = useLocation()
  const tabs = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/new-order', label: 'New Order', icon: PlusCircle },
    { to: '/orders', label: 'All Orders', icon: ListChecks },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
  ]
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="text-xl font-semibold bg-gradient-to-r from-pink-500 to-fuchsia-600 bg-clip-text text-transparent">Lakshmi Ladies Tailor</div>
        <div className="ml-auto flex gap-1">
          {tabs.map(t => {
            const active = location.pathname === t.to
            const Icon = t.icon
            return (
              <Link key={t.to} to={t.to} className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-pink-50 ${active ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}>
                <Icon className="w-4 h-4" /> {t.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Stat({ title, value, icon: Icon, accent='from-pink-500 to-fuchsia-600' }){
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${accent} text-white flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${baseUrl}/api/summary`).then(r => r.json()).then(setSummary).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Customers" value={summary.customers} icon={Users} />
        <Stat title="Orders" value={summary.orders} icon={ListChecks} accent="from-indigo-500 to-blue-600" />
        <Stat title="Collected" value={`₹ ${summary.collected}`} icon={Rupee} accent="from-emerald-500 to-teal-600" />
        <Stat title="Profit" value={`₹ ${summary.profit}`} icon={TrendingUp} accent="from-amber-500 to-orange-600" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="font-semibold mb-3">Order Status</div>
          <div className="space-y-2">
            {Object.entries(summary.status_counts).map(([k,v]) => (
              <div key={k} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>{k}</span>
                </div>
                <div className="font-medium">{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="font-semibold mb-3">Payments</div>
          <div className="space-y-2">
            {Object.entries(summary.payment_counts).map(([k,v]) => (
              <div key={k} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Rupee className="w-4 h-4 text-emerald-600" />
                  <span>{k}</span>
                </div>
                <div className="font-medium">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function NewOrder() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState({
    customer_id: '',
    item_type: 'Blouse',
    measurements: {},
    order_date: new Date().toISOString().slice(0,10),
    due_date: new Date().toISOString().slice(0,10),
    status: 'In Progress',
    payment_status: 'Pending',
    total_amount: 0,
    amount_paid: 0,
    priority: 'Normal',
    notes: ''
  })

  useEffect(() => {
    fetch(`${baseUrl}/api/customers`).then(r=>r.json()).then(setCustomers)
  }, [])

  const measurementFields = useMemo(() => {
    switch(form.item_type){
      case 'Blouse': return ['bust','waist','shoulder','armhole','length']
      case 'Lehenga': return ['waist','hip','length']
      case 'Kurta': return ['bust','waist','length','sleeve']
      default: return []
    }
  }, [form.item_type])

  const submit = async (e) => {
    e.preventDefault()
    await fetch(`${baseUrl}/api/orders`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form)})
    navigate('/orders')
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <form onSubmit={submit} className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
        <div className="text-lg font-semibold mb-2">Create New Order</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Customer</label>
            <select value={form.customer_id} onChange={e=>setForm({...form, customer_id:e.target.value})} className="w-full border rounded p-2">
              <option value="">Select customer</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name} - {c.phone}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Item Type</label>
            <select value={form.item_type} onChange={e=>setForm({...form, item_type:e.target.value})} className="w-full border rounded p-2">
              {['Blouse','Lehenga','Kurta','Saree Fall'].map(i=> <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Due Date</label>
            <input type="date" value={form.due_date} onChange={e=>setForm({...form, due_date:e.target.value})} className="w-full border rounded p-2"/>
          </div>
          <div>
            <label className="text-sm text-gray-600">Priority</label>
            <select value={form.priority} onChange={e=>setForm({...form, priority:e.target.value})} className="w-full border rounded p-2">
              {['Normal','Urgent','Express'].map(i=> <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Total Amount</label>
            <input type="number" value={form.total_amount} onChange={e=>setForm({...form, total_amount:Number(e.target.value)})} className="w-full border rounded p-2"/>
          </div>
          <div>
            <label className="text-sm text-gray-600">Amount Paid</label>
            <input type="number" value={form.amount_paid} onChange={e=>setForm({...form, amount_paid:Number(e.target.value)})} className="w-full border rounded p-2"/>
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-600">Measurements</label>
          <div className="grid sm:grid-cols-3 gap-3">
            {measurementFields.map(f => (
              <div key={f} className="flex items-center gap-2">
                <span className="text-sm w-24 capitalize">{f}</span>
                <input type="number" step="0.1" className="flex-1 border rounded p-2" value={form.measurements[f] || ''} onChange={e=>setForm({...form, measurements:{...form.measurements, [f]: Number(e.target.value)}})} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-600">Notes</label>
          <textarea className="w-full border rounded p-2" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} />
        </div>
        <div className="flex justify-end">
          <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md">Create Order</button>
        </div>
      </form>
    </div>
  )
}

function Orders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('')

  const load = () => {
    const q = filter ? `?status=${encodeURIComponent(filter)}` : ''
    fetch(`${baseUrl}/api/orders${q}`).then(r=>r.json()).then(setOrders)
  }

  useEffect(() => { load() }, [filter])

  const exportCsv = () => {
    const headers = ['Customer','Item','Status','Payment','Priority','Total','Paid','Due Date']
    const rows = orders.map(o => [o.customer_id, o.item_type, o.status, o.payment_status, o.priority, o.total_amount, o.amount_paid, o.due_date])
    const csv = [headers.join(','), ...rows.map(r=>r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orders.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-3">
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="border rounded p-2">
          <option value="">All</option>
          {['New','In Progress','Completed','Delivered'].map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={exportCsv} className="ml-auto flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {orders.map((o, i) => (
          <div key={i} className="bg-white border rounded-xl shadow-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{o.item_type} • {o.priority}</div>
              <div className="text-sm text-gray-600">Due: {typeof o.due_date === 'string' ? o.due_date?.slice(0,10) : ''}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <div>Status: <span className="font-medium">{o.status}</span></div>
              <div>Payment: <span className="font-medium">{o.payment_status}</span></div>
              <div>Total: ₹ {o.total_amount}</div>
              <div>Paid: ₹ {o.amount_paid}</div>
            </div>
            {o.measurements && Object.keys(o.measurements).length > 0 && (
              <div className="text-xs text-gray-600">
                Measurements: {Object.entries(o.measurements).map(([k,v])=>`${k}:${v}`).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CalendarView() {
  const [events, setEvents] = useState([])
  useEffect(()=>{ fetch(`${baseUrl}/api/calendar`).then(r=>r.json()).then(setEvents)}, [])
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="p-4 font-semibold">Order Deadlines</div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 p-4">
          {events.map((e,i)=>(
            <div key={i} className="border rounded-lg p-3">
              <div className="text-sm text-gray-600">{e.date}</div>
              <div className="font-medium">{e.title}</div>
              <div className="text-xs text-gray-600">{e.status} • {e.priority}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Reports() {
  const [summary, setSummary] = useState(null)
  useEffect(()=>{ fetch(`${baseUrl}/api/summary`).then(r=>r.json()).then(setSummary)}, [])
  if(!summary) return <div className="p-6">Loading...</div>
  const income = summary.collected
  const expense = summary.expenses
  const profit = summary.profit
  const percent = income ? Math.round((profit/income)*100) : 0
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <div className="font-semibold mb-2">Financial Overview</div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">Income</div>
            <div className="text-2xl font-semibold">₹ {income}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Expenses</div>
            <div className="text-2xl font-semibold">₹ {expense}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Profit</div>
            <div className="text-2xl font-semibold">₹ {profit}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-1">Profit Margin</div>
          <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-emerald-500 to-teal-600" style={{width: `${percent}%`}}></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-5">
        <div className="font-semibold mb-2">Top Items</div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(summary.by_item).map(([k,v]) => (
            <div key={k} className="border rounded-lg p-3 flex items-center justify-between">
              <div>{k}</div>
              <div className="font-semibold">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Shell(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-fuchsia-50 text-gray-800">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new-order" element={<NewOrder />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </div>
  )
}

export default function App(){
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
