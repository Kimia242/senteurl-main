import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "./context/CartContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import CartDrawer from "./components/layout/CartDrawer";

// Pages
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import BrandsPage from "./pages/BrandsPage";
import BrandDetailPage from "./pages/BrandDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

// Admin Pages
import AdminLayout, { AdminDashboard } from "./pages/admin/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <CartDrawer />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/nouveautes" element={<ShopPage />} />
            <Route path="/promotions" element={<ShopPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/brands/:brandId" element={<BrandDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
            <Route path="/admin/brands" element={<AdminLayout><AdminBrands /></AdminLayout>} />
            <Route path="/admin/categories" element={<AdminLayout><AdminCategories /></AdminLayout>} />
            <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
          </Routes>

          <Footer />
          <Toaster position="top-right" />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
