import React from "react";

export default function Orders() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-50 text-center">My Orders</h1>
        <p className="text-zinc-700 dark:text-zinc-200 text-center mb-6">You have no orders yet.</p>
        {/* Example order summary card with image error handling */}
        {/* Replace this with your actual orders mapping */}
        <div className="flex items-center bg-gradient-to-r from-gray-100 to-gray-200 shadow-lg rounded-xl p-4 border border-gray-300 max-w-lg mx-auto mt-8">
          <div className="w-20 h-20 flex items-center justify-center bg-white rounded-lg border mr-4">
            <img
              src={"http://localhost:4000/uploads/nonexistent.jpg"}
              alt="Product Title"
              className="w-16 h-16 object-cover rounded"
              onError={e => { e.target.onerror = null; e.target.src = "/placeholder.png"; }}
            />
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg mb-1">Product Title</div>
            <div className="text-gray-600 mb-1">Quantity: <span className="font-medium">1</span></div>
            <div className="text-gray-800 font-semibold">₹1235</div>
          </div>
        </div>
      </div>
    </div>
  );
}
