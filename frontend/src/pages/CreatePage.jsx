import { useState } from "react";
import { Box, Button, Container, Heading, Input, Stack } from "@chakra-ui/react";
import { toaster } from "../components/ui/toaster-instance";
import { useProductStore } from "../store/product";

const CreatePage = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  });
  const { createProduct } = useProductStore();

  const handleAddProduct = async (event) => {
    event.preventDefault();
    const result = await createProduct({
      ...newProduct,
      price: Number(newProduct.price),
    });

    toaster.create({
      title: result.success ? "Product created" : "Unable to create product",
      description: result.message,
      type: result.success ? "success" : "error",
    });

    if (result.success) {
      setNewProduct({ name: "", description: "", price: "", image: "" });
    }
  };

  return (
    <Container maxW="container.md" px={4} py={10}>
      <Stack gap={4}>
        <Heading as="h1" size="xl" textAlign="center">
          Create New Product
        </Heading>
        <Box as="form" onSubmit={handleAddProduct} w="full" p={6} borderRadius="md" boxShadow="md">
          <Stack gap={4}>
            <Input
              placeholder="Product name"
              value={newProduct.name}
              onChange={(event) => setNewProduct({ ...newProduct, name: event.target.value })}
              required
            />
            <Input
              placeholder="Product description"
              value={newProduct.description}
              onChange={(event) => setNewProduct({ ...newProduct, description: event.target.value })}
              required
            />
            <Input
              placeholder="Product price"
              type="number"
              min="0.01"
              step="0.01"
              value={newProduct.price}
              onChange={(event) => setNewProduct({ ...newProduct, price: event.target.value })}
              required
            />
            <Input
              placeholder="Product image HTTPS URL"
              type="url"
              value={newProduct.image}
              onChange={(event) => setNewProduct({ ...newProduct, image: event.target.value })}
              required
            />
            <Button type="submit" colorPalette="blue" width="full">
              Add Product
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default CreatePage;
