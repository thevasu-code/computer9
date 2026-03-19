
import React, { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";

export default function ProductDetail({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!product) return <div className="text-center py-12 text-red-500">Product not found or unavailable.</div>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <img
          src={product.image}
          alt={product.name}
          className="w-80 h-80 object-contain rounded bg-white"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="mb-2 text-zinc-600">{product.brand}</div>
          <div className="mb-4 text-zinc-700">{product.description}</div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-primary">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-zinc-400 line-through text-lg">₹{product.originalPrice}</span>
            )}
          </div>
          <div className="mb-4">
            <label className="mr-2 font-medium">Quantity:</label>
            <input
              type="number"
              min={1}
              max={product.stock || 1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 px-2 py-1 border rounded"
              disabled={!product.stock || product.stock < 1}
            />
            <span className="ml-2 text-zinc-500">(In stock: {typeof product.stock === 'number' ? product.stock : 'N/A'})</span>
            {!product.stock || product.stock < 1 ? (
              <span className="ml-2 text-red-500 font-medium">Out of stock</span>
            ) : null}
          </div>
          <button
            className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90 transition-colors"
            onClick={() => {
              addToCart(product, quantity);
              setAdded(true);
              setTimeout(() => setAdded(false), 1200);
            }}
            disabled={added}
          >
            {added ? "Added!" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
