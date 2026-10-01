import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import PublicLayout from './layouts/PublicLayout.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import WelcomePage from './pages/WelcomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import DashboardPage from './pages/customer/DashboardPage.jsx'
import AccountPage from './pages/customer/AccountPage.jsx'
import TransferPage from './pages/customer/TransferPage.jsx'
import ActivityPage from './pages/customer/ActivityPage.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import AuditPage from './pages/admin/AuditPage.jsx'
import CustomersPage from './pages/CustomersPage.jsx'
import CustomerDetailPage from './pages/CustomerDetailPage.jsx'
import SearchPage from './pages/SearchPage.jsx'

// App is the top PARENT component. Three groups of pages:
//   public   (/, /login, /register)  -> PublicLayout: Header + page + Footer
//   customer (/app/...)              -> must be signed in as CUSTOMER, sidebar layout
//   admin    (/admin/...)            -> must be signed in as ADMIN, sidebar layout
// A layout route draws the frame; its child routes fill the <Outlet /> inside it.
export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/app" element={<ProtectedRoute role="CUSTOMER"><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="accounts/:id" element={<AccountPage />} />
        <Route path="transfer" element={<TransferPage />} />
        <Route path="activity" element={<ActivityPage />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AppLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="audit" element={<AuditPage />} />
      </Route>
    </Routes>
  )
}
