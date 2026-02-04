import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="flex gap-8 mb-8">
        <a
          href="https://vite.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="transform hover:scale-105 transition-transform"
        >
          <img src={viteLogo} className="logo w-24 h-24" alt="Vite logo" />
        </a>
        <a
          href="https://react.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="transform hover:scale-105 transition-transform"
        >
          <img
            src={reactLogo}
            className="logo react w-24 h-24"
            alt="React logo"
          />
        </a>
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Vite + React</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg card max-w-md w-full">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          count is {count}
        </button>
        <p className="text-gray-600 mt-4 text-center">
          Edit <code className="bg-gray-100 p-1 rounded">src/App.jsx</code> and
          save to test HMR
        </p>
      </div>
      <p className="read-the-docs text-gray-500 mt-6 text-center max-w-lg">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
