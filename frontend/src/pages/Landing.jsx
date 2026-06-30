import { Link } from 'react-router-dom'
import Navbar1 from '../components/Navbar1.jsx'

// Your original design used `Wastemanagement.png`, but that file doesn't exist in this repo.
// This page uses an SVG placeholder that exists in `src/assets`.
import Wastemanagement from '../assets/Wastemanagement.png'

export function Landing() {
  return (
    <div className="bg-white text-gray-800">
      <Navbar1 />

      {/* HERO */}
      <section className="py-20 px-6 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full mb-6 text-sm">
              ♻ EcoCollect
            </p>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              EcoCollect{' '}
              <span className="text-green-600">for a Greener Future</span>
            </h1>

            <p className="text-gray-600 mb-6 max-w-lg">
              Schedule doorstep pickup, track recycling, and manage e-waste
              efficiently with a centralized system.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link
                to="/register"
                className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition shadow-md"
              >
                Start Recycling →
              </Link>

              <button className="border border-green-600 text-green-600 px-6 py-3 rounded-xl hover:bg-green-50 transition">
                Learn More
              </button>
            </div>

            <div className="flex gap-6 mt-6 text-sm text-gray-500 flex-wrap">
              <span>✔ Verified Collectors</span>
              <span>✔ Secure & Reliable</span>
              <span>✔ Eco Certified</span>
            </div>
          </div>

          <div className="hidden md:block">
            <img
              src={Wastemanagement}
              alt="recycling"
              className="w-full max-w-md mx-auto"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-12 mt-16 text-center flex-wrap">
          <div>
            <h3 className="text-3xl font-bold text-green-600">10+</h3>
            <p className="text-gray-500">Tons Recycled</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-green-600">98%</h3>
            <p className="text-gray-500">Accuracy Rate</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-green-600">150+</h3>
            <p className="text-gray-500">Device Types</p>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-4xl font-bold mb-6">
          The Growing <span className="text-green-600">E-Waste Problem</span>
        </h2>
        <p className="max-w-3xl mx-auto text-gray-600">
          Millions of tons of electronic waste are generated every year, and
          improper disposal harms the environment and human health. EcoCollect
          provides a smart solution to manage and recycle e-waste responsibly.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-green-50 px-6">
        <h2 className="text-4xl font-bold text-center mb-4">
          How It <span className="text-green-600">Works</span>
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Simple 3-step process to recycle responsibly
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: '📷',
              title: 'Upload Waste',
              desc: 'Upload or capture an image of your e-waste item.',
            },
            {
              icon: '🚚',
              title: 'Schedule Pickup',
              desc: 'Collector verifies and schedules pickup.',
            },
            {
              icon: '♻',
              title: 'Recycle',
              desc: 'We ensure safe and eco-friendly disposal.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow hover:shadow-xl hover:-translate-y-2 transition"
            >
              <div className="text-2xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">
                {i + 1}. {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Powerful <span className="text-green-600">Features</span>
        </h2>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
          {['Pickup Tracking', 'User Dashboard', 'Eco Impact Stats', 'Fast Collection'].map(
            (f, i) => (
              <div
                key={i}
                className="p-6 rounded-xl hover:bg-green-50 transition font-semibold"
              >
                {f}
              </div>
            ),
          )}
        </div>
      </section>

      {/* WHY US */}
      <section className="py-20 bg-green-50 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose <span className="text-green-600">Us?</span>
        </h2>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
          {['Fast Pickup', 'Easy Use', 'Secure System', 'Eco Friendly'].map(
            (item, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
              >
                {item}
              </div>
            ),
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-500 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">
          Start Recycling in 2 Minutes 🚀
        </h2>
        <p className="mb-8">Join the movement and make a real environmental impact.</p>
        <Link
          to="/register"
          className="bg-white text-green-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
        >
          Create Free Account →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-100 py-12 px-6">
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto text-gray-600">
          <div>
            <h3 className="font-bold text-green-600 mb-2">EcoCollect</h3>
            <p>E-waste management for a sustainable future.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <p>Home</p>
            <p>Dashboard</p>
            <p>About</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Resources</h4>
            <p>E-Waste Guide</p>
            <p>Recycling Tips</p>
            <p>Safety</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Contact</h4>
            <p>support@ecocollect.com</p>
            <p>+91 7508180639</p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          © 2026 EcoCollect. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

