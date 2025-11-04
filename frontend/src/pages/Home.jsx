// src/pages/Home.jsx
import Navbar from "../components/navbar";

export default function Home() {
  return (
    <div className="flex">
      <Navbar />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold test-blue-300">Welcome to My Home Page</h1>
        <p className="mt-4 text-gray-700">
          This is the main content of the home page.
        </p>
      </main>
    </div>
  );
}
