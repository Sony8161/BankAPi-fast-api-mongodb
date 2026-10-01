import FeatureCard from '../components/FeatureCard.jsx'

export default function WelcomePage() {
  return (
    <section className="welcome">
      <h2>Welcome to Simple Bank</h2>
      <p>
        Manage customers and their accounts. Every screen reads live data from the FastAPI
        backend, which stores it in MongoDB Atlas.
      </p>
      <div className="cards">
        {/* the same component, reused with different props */}
        <FeatureCard to="/customers" title="Customers" text="View, add and delete customers." />
        <FeatureCard to="/search" title="Search" text="Find customers by name, or list premium customers." />
      </div>
    </section>
  )
}
