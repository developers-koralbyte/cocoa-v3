import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {/* Logos */}
      <div className="flex space-x-8 mb-8">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="h-16 w-16" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="h-16 w-16" alt="React logo" />
        </a>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Vite + React + Tailwind</h1>

      {/* Counter Card */}
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
        <p className="mt-4 text-gray-500">
          Edit <code className="text-sm font-mono text-gray-700">src/App.jsx</code> and save to test HMR
        </p>
      </div>

      {/* Footer */}
      <p className="text-sm text-gray-600 mt-8">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
