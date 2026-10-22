import { useState } from "react";
import { Box, Button, Image, Input, Stack, Text } from "@chakra-ui/react";
import { toaster } from "./toaster-instance";

const ProductCard = ({ product, authenticated, handleDelete, handleUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);

  const updateField = (field, value) => {
    setEditedProduct((current) => ({ ...current, [field]: value }));
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    const result = await handleUpdate({
      ...editedProduct,
      price: Number(editedProduct.price),
    });
    toaster.create({
      title: result.success ? "Product updated" : "Unable to update product",
      description: result.message,
      type: result.success ? "success" : "error",
    });
    if (result.success) setEditing(false);
  };

  const removeProduct = async () => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    const result = await handleDelete(product._id);
    toaster.create({
      title: result.success ? "Product deleted" : "Unable to delete product",
      description: result.message,
      type: result.success ? "success" : "error",
    });
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" w="full">
      <Image
        src={product.image}
        alt={product.name}
        objectFit="cover"
        h="200px"
        w="full"
        mb={4}
        borderRadius="md"
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
      />
      {editing ? (
        <Stack as="form" gap={3} onSubmit={saveProduct}>
          <Input
            aria-label="Product name"
            value={editedProduct.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />
          <Input
            aria-label="Product description"
            value={editedProduct.description}
            onChange={(event) => updateField("description", event.target.value)}
            required
          />
          <Input
            aria-label="Product price"
            type="number"
            min="0.01"
            step="0.01"
            value={editedProduct.price}
            onChange={(event) => updateField("price", event.target.value)}
            required
          />
          <Input
            aria-label="Product image URL"
            type="url"
            placeholder="HTTPS image URL"
            value={editedProduct.image}
            onChange={(event) => updateField("image", event.target.value)}
            required
          />
          <Stack direction="row">
            <Button type="submit" colorPalette="blue">Save</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Stack align="start" gap={2}>
          <Text fontSize="xl" fontWeight="bold">{product.name}</Text>
          <Text color="fg.muted">{product.description}</Text>
          <Text color="blue.500" fontWeight="semibold">
            ${Number(product.price).toFixed(2)}
          </Text>
          {authenticated && (
            <Stack direction="row" pt={2}>
              <Button variant="outline" onClick={() => {
                setEditedProduct(product);
                setEditing(true);
              }}>
                Edit
              </Button>
              <Button colorPalette="red" variant="outline" onClick={removeProduct}>
                Delete
              </Button>
            </Stack>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default ProductCard;
