import React from 'react'

const TestComponent = () => {
  return (
    <div className="p-8 bg-blue-500 text-white rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Tailwind Test</h1>
      <p className="text-lg">If you can see this styled, Tailwind is working!</p>
      <div className="mt-4 p-4 bg-wellness-primary rounded">
        Custom wellness color test
      </div>
      <button className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded">
        Test Button
      </button>
    </div>
  )
}

export default TestComponent