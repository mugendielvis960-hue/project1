import { Button, Container, Flex, HStack, Input, Link, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useColorMode } from "./color-mode-hooks";
import { toaster } from "./toaster-instance";
import { useProductStore } from "../../store/product";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [password, setPassword] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const { authenticated, login, logout } = useProductStore();

  const handleLogin = async (event) => {
    event.preventDefault();
    const result = await login(password);
    toaster.create({
      title: result.success ? "Signed in" : "Sign-in failed",
      description: result.message,
      type: result.success ? "success" : "error",
    });
    if (result.success) {
      setPassword("");
      setShowLogin(false);
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    toaster.create({
      title: result.success ? "Signed out" : "Sign-out failed",
      description: result.message,
      type: result.success ? "success" : "error",
    });
  };

  return (
    <Container maxW="container.xl" px={4} py={4}>
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        flexDir={{ base: "column", md: "row" }}
        gap={4}
      >
        <Text fontWeight="bold" fontSize="lg">
          Vendo su Marketplace
        </Text>
        <Flex gap={4} align="center">
          <Link as={RouterLink} to="/">Home</Link>
          {authenticated && <Link as={RouterLink} to="/create">Create product</Link>}
        </Flex>
        <HStack gap={4} alignItems="center">
          {authenticated ? (
            <Button onClick={handleLogout} variant="outline">Sign out</Button>
          ) : (
            <Stack as="form" direction="row" onSubmit={handleLogin} gap={2}>
              {showLogin && (
                <Input
                  aria-label="Administrator password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Admin password"
                  required
                />
              )}
              <Button
                type={showLogin ? "submit" : "button"}
                onClick={() => {
                  if (!showLogin) setShowLogin(true);
                }}
                variant="outline"
              >
                {showLogin ? "Sign in" : "Admin sign in"}
              </Button>
              {showLogin && (
                <Button
                  type="button"
                  variant="plain"
                  onClick={() => {
                    setPassword("");
                    setShowLogin(false);
                  }}
                >
                  Cancel
                </Button>
              )}
            </Stack>
          )}
          <Button onClick={toggleColorMode} variant="outline">
            {colorMode === "light" ? "Dark Mode" : "Light Mode"}
          </Button>
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;
