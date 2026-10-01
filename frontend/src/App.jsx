import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import WelcomePage from './pages/WelcomePage.jsx'
import CustomersPage from './pages/CustomersPage.jsx'
import CustomerDetailPage from './pages/CustomerDetailPage.jsx'
import SearchPage from './pages/SearchPage.jsx'

// App is the top PARENT component. Header and Footer show on every page;
// <Routes> swaps the middle part depending on the URL.
export default function App() {
  return (
    <div className="app">
      {/* props: the parent passes data DOWN to a child, like a function argument */}
      <Header title="Simple Bank" />

      <main className="content">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
