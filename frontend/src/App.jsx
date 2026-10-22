import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Box, Text } from "@chakra-ui/react";
import Navbar from "./components/ui/navbar";
import { useColorModeValue } from "./components/ui/color-mode-hooks";
import { Toaster } from "./components/ui/toaster";
import { useProductStore } from "./store/product";
import { lazy, Suspense, useEffect } from "react";

const HomePage = lazy(() => import("./pages/HomePage"));
const CreatePage = lazy(() => import("./pages/CreatePage"));

function AppLayout() {
  const { checkAdminSession } = useProductStore();
  useEffect(() => {
    checkAdminSession();
  }, [checkAdminSession]);

  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      bg={useColorModeValue("gray.100", "gray.900")}
    >
      <Navbar />
      <Suspense fallback={<Text textAlign="center" py={12}>Loading page...</Text>}>
        <Outlet />
      </Suspense>
      <Toaster />
    </Box>
  );
}

function AdminPage() {
  const { authenticated, authChecked } = useProductStore();
  if (!authChecked) return <Text textAlign="center" py={12}>Checking administrator session...</Text>;
  if (!authenticated) {
    return <Text textAlign="center" py={12}>Sign in as administrator to manage products.</Text>;
  }
  return <CreatePage />;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<AdminPage />} />
    </Route>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
