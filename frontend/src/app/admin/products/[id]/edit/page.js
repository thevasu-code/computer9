import ProductForm from "../../ProductForm";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  return <ProductForm mode="edit" productId={id} />;
}
