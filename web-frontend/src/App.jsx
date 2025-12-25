import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { Toaster, toast } from 'react-hot-toast';
import api from './services/api';
import './App.css';

// --- Shared Utilities ---
const triggerWhatsApp = (orderData) => {
    if (!orderData) return;
    const { customerName, phoneNumber, orderNo, category, status, trialDate, deliveryDate, totalAmount, advanceAmountPaid, balanceAmountReceived } = orderData;

    // Read shop settings from localStorage
    const shopSettings = JSON.parse(localStorage.getItem('shopSettings') || '{}');
    const shopName = shopSettings.name || "MOM & ME's";
    const shopPhone = shopSettings.phone || "91500 12965";
    const shopAddress = shopSettings.address || "No. 1B, Narasimman Street, Madanandhapuram, Porur, Chennai - 125.";
    const shopTagline = `${shopName}'s Custom fashion, refined — crafted for SHE`;

    // Ensure balance is calculated
    const calculatedBalance = orderData.balance !== undefined ? orderData.balance : (Number(totalAmount) || 0) - (Number(advanceAmountPaid) || 0) - (Number(balanceAmountReceived) || 0);

    let messageBody = '';
    const tDate = trialDate ? new Date(trialDate).toLocaleDateString('en-IN') : 'N/A';
    const dDate = deliveryDate ? new Date(deliveryDate).toLocaleDateString('en-IN') : 'N/A';

    // Header and Footer branding (Using Settings)
    const header = `*${shopName.toUpperCase()}*\\n\\n`;
    const footer = `\\n\\n${shopTagline}\\nAddress: ${shopAddress}\\nTel: ${shopPhone}`;

    if (status === 'Pending' || status === 'In Progress') {
        messageBody = `Namaskaram *${customerName}*, thank you for choosing ${shopName}!\\n\\nYour order *#${orderNo}* for *${category}* is confirmed.\\n\\nExpected Trial: ${tDate}\\nExpected Delivery: ${dDate}`;
    } else if (status === 'Ready for Trial') {
        messageBody = `Namaskaram *${customerName}*, your *${category}* is ready for trial!\\n\\nPlease visit us at your convenience. See you soon!\\n\\nThank you for your business!`;
    } else if (status === 'Completed') {
        messageBody = `Namaskaram *${customerName}*, great news!\\n\\nYour order *#${orderNo}* is ready for pick-up!\\n\\n*Payment Details:*\\nTotal: ₹${totalAmount}\\nAdvance: ₹${advanceAmountPaid}\\n*Pending Balance: ₹${calculatedBalance}*\\n\\nSee you at the shop! Thank you so very much.. C U AGAIN..`;
    }

    if (messageBody) {
        const fullMessage = header + messageBody + footer;
        let cleanPhone = phoneNumber.toString().replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        const encodedMsg = encodeURIComponent(fullMessage);
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

        const waWindow = window.open(whatsappUrl, '_blank');
        if (!waWindow) {
            toast.error("WhatsApp window was blocked! Please allow popups.");
        }
    }
};

// --- Components ---

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { username, password });
            onLogin(data);
            toast.success('Welcome back!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="logo-section">
                    <div className="login-logo-container">
                        <img src="/assets/images/logo.png" alt="Logo" className="login-logo" />
                    </div>
                    <h1>MOM & ME's</h1>
                    <p>Tailoring Management System</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Sidebar({ currentPage, setCurrentPage, onLogout, user }) {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo-container">
                    <img src="/assets/images/logo.png" alt="Mom & Me Logo" className="sidebar-logo" />
                </div>
                <h2>MOM & ME's</h2>
                <p>Welcome, {user?.fullName?.split(' ')[0]}</p>
            </div>
            <nav className="sidebar-nav">
                <button
                    className={currentPage === 'dashboard' ? 'active' : ''}
                    onClick={() => setCurrentPage('dashboard')}
                >
                    Dashboard
                </button>
                <button
                    className={currentPage === 'orders' ? 'active' : ''}
                    onClick={() => setCurrentPage('orders')}
                >
                    Orders
                </button>
                <button
                    className={currentPage === 'expenses' ? 'active' : ''}
                    onClick={() => setCurrentPage('expenses')}
                >
                    Expenses
                </button>
                <button
                    className={currentPage === 'reports' ? 'active' : ''}
                    onClick={() => setCurrentPage('reports')}
                >
                    Reports
                </button>
                <button
                    className={currentPage === 'settings' ? 'active' : ''}
                    onClick={() => setCurrentPage('settings')}
                >
                    Profile & Settings
                </button>
            </nav>
            <div className="sidebar-footer">
                <button onClick={onLogout} className="logout-btn">Logout</button>
            </div>
        </div>
    );
}

function Dashboard({ setCurrentPage, setOrderFilters }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    const fetchStats = async () => {
        setLoading(true);
        try {
            const params = {};
            if (dateRange.startDate) params.startDate = dateRange.startDate;
            if (dateRange.endDate) params.endDate = dateRange.endDate;

            const { data } = await api.get('/reports/dashboard', { params });
            setStats(data.data);
        } catch (error) {
            toast.error('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [dateRange]);

    const handleNavigateToOrders = (statusFilter) => {
        setOrderFilters({ status: statusFilter });
        setCurrentPage('orders');
    };

    if (loading && !stats) return <div className="loading">Loading Dashboard...</div>;

    return (
        <div className="page-content">
            <div className="page-banner-container">
                <img src="/dashboard_banner.jpg" alt="Mom & Me Boutique Banner" className="page-banner" />
            </div>
            <header className="page-header">
                <h2>Dashboard</h2>
                <div className="date-filter">
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        placeholder="From Date"
                    />
                    <span className="separator">to</span>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        placeholder="To Date"
                    />
                </div>
            </header>

            {/* Custom Range Stats (Show only if dates selected) */}
            {(dateRange.startDate || dateRange.endDate) && stats?.custom && (
                <div className="stats-section">
                    <h3>Selected Period ({dateRange.startDate || 'Beginning'} - {dateRange.endDate || 'Now'})</h3>
                    <div className="stats-grid">
                        <div className="stat-card gold">
                            <h3>₹{stats.custom.income?.toLocaleString()}</h3>
                            <p>Total Income</p>
                        </div>
                        <div className="stat-card blue">
                            <h3>{stats.custom.ordersCount}</h3>
                            <p>Total Orders</p>
                        </div>
                        <div className="stat-card green clickable" onClick={() => handleNavigateToOrders('Ready for Trial')}>
                            <h3>{stats.custom.readyForTrial}</h3>
                            <p>Ready for Trials</p>
                        </div>
                        <div className="stat-card purple clickable" onClick={() => handleNavigateToOrders('Completed')}>
                            <h3>{stats.custom.completed}</h3>
                            <p>Ready for Delivery (Completed)</p>
                        </div>
                        <div className="stat-card red clickable" onClick={() => handleNavigateToOrders('Pending')}>
                            <h3>{stats.custom.pending}</h3>
                            <p>Pending Orders</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Standard Stats (Brief if custom range active) */}
            <div className="stats-section">
                <h3>Today's Overview</h3>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>₹{stats?.today?.income?.toLocaleString()}</h3>
                        <p>Income</p>
                    </div>
                    <div className="stat-card">
                        <h3>₹{stats?.today?.expenses?.toLocaleString()}</h3>
                        <p>Expenses</p>
                    </div>
                    <div className="stat-card">
                        <h3>₹{stats?.today?.profit?.toLocaleString()}</h3>
                        <p>Profit</p>
                    </div>
                    <div className="stat-card highlight">
                        <h3>{stats?.today?.ordersCount}</h3>
                        <p>New Orders</p>
                    </div>
                </div>
            </div>

            <div className="stats-section">
                <h3>Recent Orders</h3>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Order No</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.recentOrders?.map(order => (
                                <tr key={order._id}>
                                    <td>{order.orderNo}</td>
                                    <td>{order.customerName}</td>
                                    <td>₹{order.totalAmount}</td>
                                    <td><span className={`status-badge ${order.status.toLowerCase().replace(/ /g, '-')}`}>{order.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Orders({ initialFilters, clearInitialFilters }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [viewingOrder, setViewingOrder] = useState(null); // For View Mode
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        startDate: '',
        endDate: ''
    });

    // Apply initial filters passed from Dashboard
    useEffect(() => {
        if (initialFilters) {
            setFilters(prev => ({ ...prev, ...initialFilters }));
            clearInitialFilters(); // Clear so it doesn't stick forever
        }
    }, [initialFilters]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                search,
                ...filters
            };
            const { data } = await api.get('/orders', { params });
            setOrders(data.data);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [search, filters]); // Re-fetch when search or filters change

    const handleEdit = (order) => {
        setEditingOrder(order);
        setShowForm(true);
    };

    const handleView = (order) => {
        setViewingOrder(order);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;
        try {
            await api.delete(`/orders/${id}`);
            toast.success("Order deleted");
            fetchOrders();
        } catch (err) {
            toast.error("Failed to delete order");
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingOrder(null);
        fetchOrders();
    };

    return (
        <div className="page-content">
            <header className="page-header">
                <h2>Orders Management</h2>
                <button onClick={() => setShowForm(true)} className="add-btn">+ New Order</button>
            </header>

            <div className="filters-section">
                <input
                    type="text"
                    placeholder="Search name, phone, order no..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Ready for Trial">Ready for Trial</option>
                    <option value="Completed">Completed</option>
                </select>
                <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                    <option value="">All Categories</option>
                    <option value="Blouse">Blouse</option>
                    <option value="Salwar/Chudi">Salwar/Chudi</option>
                    <option value="Skirt & Top">Skirt & Top</option>
                    <option value="Saree (Falls and Side Stitch)">Saree</option>
                    <option value="Others">Others</option>
                </select>
                <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    placeholder="From Date"
                    title="From Date"
                />
                <span className="separator" style={{ margin: '0 8px' }}>to</span>
                <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    placeholder="To Date"
                    title="To Date"
                />
            </div>

            <div className="orders-grid">
                {orders.map(order => (
                    <div key={order._id} className="order-card" onClick={() => handleView(order)}>
                        <div className="order-header">
                            <span className="order-no">{order.orderNo}</span>
                            <span className={`status-badge ${order.status.toLowerCase().replace(/ /g, '-')}`}>{order.status}</span>
                        </div>
                        <h3>{order.customerName}</h3>
                        <p className="phone">{order.phoneNumber}</p>
                        <div className="order-details">
                            <p>📅 Due: {new Date(order.deliveryDate).toLocaleDateString()}</p>
                            <p>💰 Bal: ₹{order.balance}</p>
                        </div>
                        <div className="order-actions">
                            <button onClick={(e) => { e.stopPropagation(); handleEdit(order); }}>Edit</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(order._id); }} className="delete-btn">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <OrderForm
                    order={editingOrder}
                    onClose={handleFormClose}
                />
            )}

            {viewingOrder && (
                <OrderDetailsModal order={viewingOrder} onClose={() => setViewingOrder(null)} />
            )}
        </div>
    );
}

function OrderDetailsModal({ order, onClose }) {
    if (!order) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content view-modal">
                <div className="modal-header">
                    <h2>Order Details: {order.orderNo}</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <div className="details-grid">
                        <div className="detail-section">
                            <h3>Customer Info</h3>
                            <p><strong>Name:</strong> {order.customerName}</p>
                            <p><strong>Phone:</strong> {order.phoneNumber}</p>
                            <p><strong>Address:</strong> {order.address || 'N/A'}</p>
                        </div>
                        <div className="detail-section">
                            <h3>Order Info</h3>
                            <p><strong>Category:</strong> {order.category}</p>
                            <p><strong>Book No:</strong> {order.orderNoFromBook || 'N/A'}</p>
                            <p><strong>Status:</strong> {order.status}</p>
                            <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                            <p><strong>Trial Date:</strong> {order.trialDate ? new Date(order.trialDate).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Delivery Date:</strong> {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div className="detail-section">
                            <h3>Payment</h3>
                            <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                            <p><strong>Advance:</strong> ₹{order.advanceAmountPaid}</p>
                            <p><strong>Balance Recvd:</strong> ₹{order.balanceAmountReceived}</p>
                            <p><strong>Pending:</strong> ₹{order.balance}</p>
                        </div>
                        <div className="detail-section full-width">
                            <h3>Measurements</h3>
                            <div className="measurements-display">
                                {Object.entries(order.measurements || {}).map(([key, value]) => {
                                    if (!value) return null;
                                    return <div key={key} className="measurement-item">
                                        <span className="label">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                        <span className="value">{value}</span>
                                    </div>
                                })}
                            </div>
                        </div>
                        {order.customerPhotos && order.customerPhotos.length > 0 && (
                            <div className="detail-section full-width">
                                <h3>Photos</h3>
                                <div className="photos-gallery">
                                    {order.customerPhotos.map((photo, index) => (
                                        <img key={index} src={photo} alt={`Customer ${index}`} className="order-photo" />
                                    ))}
                                </div>
                            </div>
                        )}
                        {order.notes && (
                            <div className="detail-section full-width">
                                <h3>Notes</h3>
                                <p>{order.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-footer" style={{ padding: '24px', borderTop: '1px solid var(--bg-tertiary)', textAlign: 'right' }}>
                    <button
                        onClick={() => triggerWhatsApp(order)}
                        className="add-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}
                    >
                        <span>Send WhatsApp Status</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function OrderForm({ order, onClose }) {
    const [loading, setLoading] = useState(false);
    const [sendWhatsApp, setSendWhatsApp] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        phoneNumber: '',
        address: '',
        orderNoFromBook: '',
        category: 'Blouse',
        orderDate: new Date().toLocaleDateString('en-CA'),
        trialDate: '',
        deliveryDate: '',
        totalAmount: '',
        advanceAmountPaid: '',
        balanceAmountReceived: '',
        status: 'Pending',
        notes: '',
        measurements: {
            bust: '', waist: '', hip: '', length: '', shoulder: '',
            sleeveLength: '', armHole: '', neck: '',
            blouseLength: '', salwarLength: '', bottom: '', slit: '',
            notes: ''
        }
    });
    const [photos, setPhotos] = useState([]);

    useEffect(() => {
        if (order) {
            const formatDate = (dateString) => dateString ? dateString.split('T')[0] : '';
            setFormData({
                ...order,
                orderDate: formatDate(order.orderDate),
                trialDate: formatDate(order.trialDate),
                deliveryDate: formatDate(order.deliveryDate),
                measurements: order.measurements || {}
            });
        }
    }, [order]);



    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('meas_')) {
            const field = name.replace('meas_', '');
            setFormData(prev => ({
                ...prev,
                measurements: { ...prev.measurements, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePhotoChange = (e) => {
        setPhotos(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let savedOrder;
            if (order) {
                const { data } = await api.put(`/orders/${order._id}`, formData);
                savedOrder = data.data;
                toast.success('Order updated successfully');
            } else {
                const { data } = await api.post('/orders', formData);
                savedOrder = data.data;
                toast.success('Order created successfully');
            }

            if (photos.length > 0) {
                const photoFormData = new FormData();
                for (let i = 0; i < photos.length; i++) {
                    photoFormData.append('photos', photos[i]);
                }
                await api.post(`/orders/${savedOrder._id}/photos`, photoFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (sendWhatsApp) {
                triggerWhatsApp(savedOrder);
            }

            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving order');
        } finally {
            setLoading(false);
        }
    };

    const balance = (Number(formData.totalAmount) || 0) - (Number(formData.advanceAmountPaid) || 0) - (Number(formData.balanceAmountReceived) || 0);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{order ? 'Edit Order' : 'New Order'}</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3>Customer Details</h3>
                        <div className="form-row">
                            <input name="customerName" placeholder="Customer Name *" value={formData.customerName} onChange={handleChange} required />
                            <input name="phoneNumber" placeholder="Phone Number *" value={formData.phoneNumber} onChange={handleChange} required />
                        </div>
                        <div className="form-row">
                            <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
                            <input name="orderNoFromBook" placeholder="Order No (Book)" value={formData.orderNoFromBook || ''} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Order Details</h3>
                        <div className="form-row">
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option value="Blouse">Blouse</option>
                                <option value="Blouse (1+1)">Blouse (1+1)</option>
                                <option value="Salwar/Chudi">Salwar/Chudi</option>
                                <option value="Salwar/Chudi(1+1)">Salwar/Chudi(1+1)</option>
                                <option value="Skirt & Top">Skirt & Top</option>
                                <option value="Saree (Falls and Side Stitch)">Saree (Falls and Side Stitch)</option>
                                <option value="Others">Others</option>
                            </select>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Ready for Trial">Ready for Trial</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <div className="date-input">
                                <label>Order Date</label>
                                <input type="date" name="orderDate" value={formData.orderDate} onChange={handleChange} required />
                            </div>
                            <div className="date-input">
                                <label>Trial Date</label>
                                <input type="date" name="trialDate" value={formData.trialDate || ''} onChange={handleChange} />
                            </div>
                            <div className="date-input">
                                <label>Delivery Date</label>
                                <input type="date" name="deliveryDate" value={formData.deliveryDate || ''} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-row full-width">
                            <label>Attach Photos (Max 6)</label>
                            <input type="file" multiple accept="image/*" onChange={handlePhotoChange} />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Measurements</h3>
                        <div className="measurements-grid">
                            {Object.keys(formData.measurements).map(key => (
                                key !== 'notes' &&
                                <input
                                    key={key}
                                    name={`meas_${key}`}
                                    placeholder={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                    value={formData.measurements[key]}
                                    onChange={handleChange}
                                />
                            ))}
                        </div>
                        <textarea
                            name="meas_notes"
                            placeholder="Measurement Notes"
                            value={formData.measurements.notes}
                            onChange={handleChange}
                            rows="2"
                        />
                    </div>

                    <div className="form-section">
                        <h3>Payment & Notes</h3>
                        <div className="form-row">
                            <input type="number" name="totalAmount" placeholder="Total Amount *" value={formData.totalAmount} onChange={handleChange} required />
                            <input type="number" name="advanceAmountPaid" placeholder="Advance Paid" value={formData.advanceAmountPaid} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <input type="number" name="balanceAmountReceived" placeholder="Balance Recvd" value={formData.balanceAmountReceived} onChange={handleChange} />
                            <div className="balance-display">Balance: <strong>₹{balance}</strong></div>
                        </div>
                        <textarea name="notes" placeholder="Order Notes" value={formData.notes} onChange={handleChange} rows="2" />
                    </div>

                    <div className="whatsapp-toggle">
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                checked={sendWhatsApp}
                                onChange={(e) => setSendWhatsApp(e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            Send WhatsApp Message to Customer
                        </label>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                        <button type="submit" className="save-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Order'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ description: '', amount: '', category: 'Material', date: new Date().toLocaleDateString('en-CA') });
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    const fetchExpenses = async () => {
        try {
            const params = {};
            if (dateRange.startDate) params.startDate = dateRange.startDate;
            if (dateRange.endDate) params.endDate = dateRange.endDate;
            const { data } = await api.get('/expenses', { params });
            setExpenses(data.data);
        } catch (error) {
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [dateRange]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses', formData);
            toast.success('Expense added');
            setFormData({ description: '', amount: '', category: 'Material', date: new Date().toLocaleDateString('en-CA') });
            fetchExpenses();
        } catch (error) {
            toast.error('Failed to add expense');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete expense?')) return;
        try {
            await api.delete(`/expenses/${id}`);
            fetchExpenses();
            toast.success('Deleted');
        } catch (e) { toast.error('Failed'); }
    };

    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="page-content">
            <header className="page-header">
                <h2>Expenses Tracker</h2>
            </header>

            <div className="filters-section">
                <span className="filter-label">Filter by Date: </span>
                <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
                <span className="separator">to</span>
                <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
            </div>

            <div className="expenses-container">
                <div className="expense-form-card">
                    <h3>Add Expense</h3>
                    <form className="expense-form-grid" onSubmit={handleSubmit}>
                        <input type="text" placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                        <input type="number" placeholder="Amount" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                            <option value="Material">Material</option>
                            <option value="Salary">Salary</option>
                            <option value="Rent">Rent</option>
                            <option value="Electricity">Electricity</option>
                            <option value="Others">Others</option>
                        </select>
                        <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                        <button type="submit" className="btn-add-expense">Add Expense</button>
                    </form>
                </div>

                <div className="expenses-list">
                    <h3>Recent Expenses (Total: ₹{totalExpenses})</h3>
                    {expenses.map(exp => (
                        <div key={exp._id} className="expense-item">
                            <div>
                                <strong>{exp.description}</strong>
                                <p>{new Date(exp.date).toLocaleDateString()} - {exp.category}</p>
                            </div>
                            <div className="expense-amount">
                                <span>₹{exp.amount}</span>
                                <button onClick={() => handleDelete(exp._id)} className="delete-icon">&times;</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Reports() {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [reportData, setReportData] = useState(null);
    const [monthlyStats, setMonthlyStats] = useState(null);

    // Fetch default stats on load
    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                const { data } = await api.get('/reports/dashboard');
                setMonthlyStats(data.data.thisMonth);
            } catch (e) { };
        };
        fetchDefaults();
    }, []);

    const fetchCustomReport = async () => {
        // Just fetch report if dates are selected
        if (!dateRange.startDate) return;

        setLoading(true);
        try {
            // We can use the dashboard endpoint which now returns custom stats
            const { data } = await api.get('/reports/dashboard', { params: dateRange });
            if (data.data.custom) {
                setReportData(data.data.custom);
            }
        } catch (e) {
            toast.error("Failed to fetch report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (dateRange.startDate && dateRange.endDate) {
            fetchCustomReport();
        }
    }, [dateRange]);

    const downloadReport = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            // Construct query parameters
            const params = new URLSearchParams({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                includeExpenses: 'true',
                token: token
            });

            // Use direct navigation download - most reliable method
            // This works because we now allow token in query params
            window.location.href = `${baseUrl}/reports/export?${params.toString()}`;

            toast.success('Download started...');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Download failed');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="page-content">
            <header className="page-header">
                <h2>Reports</h2>
            </header>

            <div className="filters-section reports-filter">
                <label>Select Date Range:</label>
                <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
                <span className="separator">to</span>
                <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
                <button onClick={downloadReport} className="export-btn" disabled={loading}>
                    {loading ? 'Processing...' : 'Download CSV Report'}
                </button>
            </div>

            <div className="stats-section">
                <h3>Current Month Overview</h3>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>₹{monthlyStats?.income?.toLocaleString() || 0}</h3>
                        <p>Total Income</p>
                    </div>
                    <div className="stat-card">
                        <h3>₹{monthlyStats?.advance?.toLocaleString() || 0}</h3>
                        <p>Advance Received</p>
                    </div>
                    <div className="stat-card">
                        <h3>₹{monthlyStats?.balanceRecd?.toLocaleString() || 0}</h3>
                        <p>Balance Received</p>
                    </div>
                    <div className="stat-card">
                        <h3 style={{ color: '#FFD166' }}>₹{monthlyStats?.pending?.toLocaleString() || 0}</h3>
                        <p>Pending (Receivable)</p>
                    </div>
                    <div className="stat-card">
                        <h3>₹{monthlyStats?.expenses?.toLocaleString() || 0}</h3>
                        <p>Expenses</p>
                    </div>
                    <div className="stat-card">
                        <h3>{monthlyStats?.ordersCount || 0}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>
            </div>

            <div className="reports-container">
                {dateRange.startDate && dateRange.endDate && reportData ? (
                    <div className="report-summary-card">
                        <h3>Report Summary ({dateRange.startDate} to {dateRange.endDate})</h3>
                        <div className="summary-grid">
                            <div className="s-item">
                                <span className="label">Total Income</span>
                                <span className="val highlight">₹{reportData.income}</span>
                            </div>
                            <div className="s-item">
                                <span className="label">Advance</span>
                                <span className="val">₹{reportData.advance}</span>
                            </div>
                            <div className="s-item">
                                <span className="label">Bal Recvd</span>
                                <span className="val">₹{reportData.balanceRecd}</span>
                            </div>
                            <div className="s-item">
                                <span className="label">Total Expenses</span>
                                <span className="val">₹{reportData.expenses}</span>
                            </div>
                            <div className="s-item">
                                <span className="label">Net Profit</span>
                                <span className="val" style={{ color: reportData.profit >= 0 ? '#4CAF50' : '#F44336' }}>
                                    ₹{reportData.profit}
                                </span>
                            </div>
                            <div className="s-item">
                                <span className="label">Pending</span>
                                <span className="val warning">₹{reportData.pendingAmount}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>Select a date range to view report summary</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function Settings() {
    const [settings, setSettings] = useState({
        name: "MOM & ME's",
        phone: "91500 12965",
        address: "No. 1B, Narasimman Street, Madanandhapuram, Porur, Chennai - 125."
    });

    useEffect(() => {
        const saved = localStorage.getItem('shopSettings');
        if (saved) setSettings(JSON.parse(saved));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('shopSettings', JSON.stringify(settings));
        toast.success('Shop Profile Updated!');
    };

    return (
        <div className="page-content">
            <header className="page-header">
                <h2>Shop Profile & Settings</h2>
            </header>

            <div className="settings-container">
                <div className="settings-card">
                    <div className="form-section">
                        <h3>WhatsApp & Branding Details</h3>
                        <p className="section-help">These details appear in the WhatsApp messages sent to customers.</p>

                        <div className="form-group">
                            <label>Shop Name</label>
                            <input
                                type="text"
                                name="name"
                                value={settings.name}
                                onChange={handleChange}
                                placeholder="MOM & ME's"
                            />
                        </div>

                        <div className="form-group">
                            <label>WhatsApp Number (With 91)</label>
                            <input
                                type="text"
                                name="phone"
                                value={settings.phone}
                                onChange={handleChange}
                                placeholder="91500 12965"
                            />
                            <p className="field-note">
                                ⚠️ <strong>Important:</strong> Make sure you're logged into WhatsApp (Web/Desktop) with this number.
                                Messages will be sent FROM your logged-in WhatsApp TO customers.
                            </p>
                        </div>

                        <div className="form-group">
                            <label>Shop Address</label>
                            <textarea
                                name="address"
                                value={settings.address}
                                onChange={handleChange}
                                placeholder="Enter full shop address..."
                                rows="3"
                            />
                        </div>

                        <button onClick={handleSave} className="save-btn" style={{ marginTop: '20px' }}>
                            Update Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [orderFilters, setOrderFilters] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogin = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    if (!user) return <Login onLogin={handleLogin} />;

    return (
        <div className="app-container">
            <Sidebar
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                onLogout={handleLogout}
                user={user}
            />
            <main className="main-content">
                {['orders', 'expenses', 'reports', 'settings'].includes(currentPage) && (
                    <div className="page-banner-container">
                        <img src="/banner.jpg" alt="Mom & Me Banner" className="page-banner" />
                    </div>
                )}
                {currentPage === 'dashboard' && <Dashboard setCurrentPage={setCurrentPage} setOrderFilters={setOrderFilters} />}
                {currentPage === 'orders' && <Orders initialFilters={orderFilters} clearInitialFilters={() => setOrderFilters(null)} />}
                {currentPage === 'expenses' && <Expenses />}
                {currentPage === 'reports' && <Reports />}
                {currentPage === 'settings' && <Settings />}
            </main>
            <Toaster position="top-right" />
        </div>
    );
}

export default App;
