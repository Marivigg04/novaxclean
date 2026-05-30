import ProductCard from './ProductCard';

export default function ProductGrid({ products, onAddToCart }) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.name} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}