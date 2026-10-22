import {
  Button,
  Container,
  Stack,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useProductStore } from "../store/product";
import { Link as RouterLink } from "react-router-dom";
import ProductCard from "../components/ui/ProductCard";

const HomePage = () => {
  const {
    products,
    fetchProducts,
    loading,
    error,
    authenticated,
    deleteProduct,
    updateProduct,
  } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <Container maxW="container.xl" py={12}>
      <Stack gap={8}>
        <Text
          fontSize={"30"}
          fontWeight={"bold"}
          textAlign={"center"}
          color={"blue.500"}
          bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
          bgClip="text"
        >
          Current Products
        </Text>

        {error && <Text color="red.500">{error}</Text>}
        {loading && <Text>Loading products...</Text>}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8} w="full">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              authenticated={authenticated}
              handleDelete={deleteProduct}
              handleUpdate={(updatedProduct) =>
                updateProduct(product._id, updatedProduct)
              }
            />
          ))}
        </SimpleGrid>

        {!loading && !error && products.length === 0 && (
          <Text fontSize="xl" textAlign="center" fontWeight="bold" color="gray.500">
            No products available.{" "}
            <Button asChild variant="plain" colorPalette="blue">
              <RouterLink to="/create">Create a new product</RouterLink>
            </Button>
          </Text>
        )}
      </Stack>
    </Container>
  );
};

export default HomePage;
