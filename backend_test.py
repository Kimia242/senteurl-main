import requests
import sys
import json
from datetime import datetime

class PerfumeEcommerceAPITester:
    def __init__(self, base_url="https://perfume-boutique-39.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_id = f"test_session_{datetime.now().strftime('%H%M%S')}"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_ids = {
            'brands': [],
            'categories': [],
            'products': [],
            'orders': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_seed_database(self):
        """Test database seeding"""
        return self.run_test("Seed Database", "POST", "seed", 200)

    def test_brands_crud(self):
        """Test brands CRUD operations"""
        print("\n📋 Testing Brands CRUD...")
        
        # Create brand
        brand_data = {
            "name": "Test Brand",
            "description": "Test brand description",
            "logo_url": "https://example.com/logo.jpg"
        }
        success, response = self.run_test("Create Brand", "POST", "brands", 200, brand_data)
        if not success:
            return False
        
        brand_id = response.get('id')
        if brand_id:
            self.created_ids['brands'].append(brand_id)
        
        # Get all brands
        success, _ = self.run_test("Get All Brands", "GET", "brands", 200)
        if not success:
            return False
        
        # Get specific brand
        if brand_id:
            success, _ = self.run_test("Get Brand by ID", "GET", f"brands/{brand_id}", 200)
            if not success:
                return False
            
            # Update brand
            update_data = {"name": "Updated Test Brand"}
            success, _ = self.run_test("Update Brand", "PUT", f"brands/{brand_id}", 200, update_data)
            if not success:
                return False
        
        return True

    def test_categories_crud(self):
        """Test categories CRUD operations"""
        print("\n📋 Testing Categories CRUD...")
        
        # Create category
        category_data = {"name": "Test Category"}
        success, response = self.run_test("Create Category", "POST", "categories", 200, category_data)
        if not success:
            return False
        
        category_id = response.get('id')
        if category_id:
            self.created_ids['categories'].append(category_id)
        
        # Get all categories
        success, _ = self.run_test("Get All Categories", "GET", "categories", 200)
        if not success:
            return False
        
        # Get specific category
        if category_id:
            success, _ = self.run_test("Get Category by ID", "GET", f"categories/{category_id}", 200)
            if not success:
                return False
            
            # Update category
            update_data = {"name": "Updated Test Category"}
            success, _ = self.run_test("Update Category", "PUT", f"categories/{category_id}", 200, update_data)
            if not success:
                return False
        
        return True

    def test_products_crud(self):
        """Test products CRUD operations"""
        print("\n📋 Testing Products CRUD...")
        
        # First get a brand and category for the product
        success, brands_response = self.run_test("Get Brands for Product", "GET", "brands", 200)
        if not success or not brands_response:
            print("❌ No brands available for product creation")
            return False
        
        success, categories_response = self.run_test("Get Categories for Product", "GET", "categories", 200)
        if not success or not categories_response:
            print("❌ No categories available for product creation")
            return False
        
        brand_id = brands_response[0]['id']
        category_id = categories_response[0]['id']
        
        # Create product
        product_data = {
            "name": "Test Perfume",
            "description": "A test perfume",
            "price": 99.99,
            "gender": "unisex",
            "stock": 10,
            "brand_id": brand_id,
            "category_id": category_id,
            "image_url": "https://example.com/perfume.jpg",
            "is_new": True,
            "volume": "100ml"
        }
        success, response = self.run_test("Create Product", "POST", "products", 200, product_data)
        if not success:
            return False
        
        product_id = response.get('id')
        if product_id:
            self.created_ids['products'].append(product_id)
        
        # Get all products
        success, _ = self.run_test("Get All Products", "GET", "products", 200)
        if not success:
            return False
        
        # Get products with filters
        success, _ = self.run_test("Get Products by Gender", "GET", "products", 200, params={"gender": "unisex"})
        if not success:
            return False
        
        success, _ = self.run_test("Get New Products", "GET", "products", 200, params={"is_new": "true"})
        if not success:
            return False
        
        success, _ = self.run_test("Search Products", "GET", "products", 200, params={"search": "Test"})
        if not success:
            return False
        
        # Get specific product
        if product_id:
            success, _ = self.run_test("Get Product by ID", "GET", f"products/{product_id}", 200)
            if not success:
                return False
            
            # Update product
            update_data = {"name": "Updated Test Perfume", "price": 89.99}
            success, _ = self.run_test("Update Product", "PUT", f"products/{product_id}", 200, update_data)
            if not success:
                return False
        
        return True

    def test_cart_operations(self):
        """Test cart operations"""
        print("\n🛒 Testing Cart Operations...")
        
        # Get cart (should be empty initially)
        success, cart_response = self.run_test("Get Empty Cart", "GET", f"cart/{self.session_id}", 200)
        if not success:
            return False
        
        # Get a product to add to cart
        success, products_response = self.run_test("Get Products for Cart", "GET", "products", 200, params={"limit": 1})
        if not success or not products_response:
            print("❌ No products available for cart testing")
            return False
        
        product_id = products_response[0]['id']
        
        # Add item to cart
        cart_item = {"product_id": product_id, "quantity": 2}
        success, _ = self.run_test("Add to Cart", "POST", f"cart/{self.session_id}/add", 200, cart_item)
        if not success:
            return False
        
        # Get cart with items
        success, cart_response = self.run_test("Get Cart with Items", "GET", f"cart/{self.session_id}", 200)
        if not success:
            return False
        
        # Update cart item
        update_item = {"product_id": product_id, "quantity": 3}
        success, _ = self.run_test("Update Cart Item", "PUT", f"cart/{self.session_id}/update", 200, update_item)
        if not success:
            return False
        
        # Remove item from cart
        success, _ = self.run_test("Remove from Cart", "DELETE", f"cart/{self.session_id}/remove/{product_id}", 200)
        if not success:
            return False
        
        return True

    def test_checkout_flow(self):
        """Test checkout flow (without actual payment)"""
        print("\n💳 Testing Checkout Flow...")
        
        # Add item to cart first
        success, products_response = self.run_test("Get Products for Checkout", "GET", "products", 200, params={"limit": 1})
        if not success or not products_response:
            print("❌ No products available for checkout testing")
            return False
        
        product_id = products_response[0]['id']
        cart_item = {"product_id": product_id, "quantity": 1}
        success, _ = self.run_test("Add to Cart for Checkout", "POST", f"cart/{self.session_id}/add", 200, cart_item)
        if not success:
            return False
        
        # Create checkout (this will create Stripe session but we won't complete payment)
        checkout_data = {
            "session_id": self.session_id,
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "customer_phone": "+221771234567",
            "shipping_address": "Test Address, Dakar",
            "origin_url": self.base_url
        }
        success, checkout_response = self.run_test("Create Checkout", "POST", "checkout", 200, checkout_data)
        if not success:
            return False
        
        # Check if checkout URL is returned
        if 'checkout_url' in checkout_response:
            print("✅ Checkout URL generated successfully")
        else:
            print("❌ No checkout URL in response")
            return False
        
        return True

    def test_admin_stats(self):
        """Test admin statistics endpoint"""
        return self.run_test("Admin Stats", "GET", "admin/stats", 200)

    def test_orders_endpoint(self):
        """Test orders endpoint"""
        return self.run_test("Get Orders", "GET", "orders", 200)

    def cleanup_test_data(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete test products
        for product_id in self.created_ids['products']:
            self.run_test(f"Delete Product {product_id}", "DELETE", f"products/{product_id}", 200)
        
        # Delete test categories
        for category_id in self.created_ids['categories']:
            self.run_test(f"Delete Category {category_id}", "DELETE", f"categories/{category_id}", 200)
        
        # Delete test brands
        for brand_id in self.created_ids['brands']:
            self.run_test(f"Delete Brand {brand_id}", "DELETE", f"brands/{brand_id}", 200)
        
        # Clear test cart
        self.run_test("Clear Cart", "DELETE", f"cart/{self.session_id}/clear", 200)

def main():
    print("🧪 Starting Perfume E-commerce API Tests...")
    print("=" * 60)
    
    tester = PerfumeEcommerceAPITester()
    
    # Test sequence
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("Database Seeding", tester.test_seed_database),
        ("Brands CRUD", tester.test_brands_crud),
        ("Categories CRUD", tester.test_categories_crud),
        ("Products CRUD", tester.test_products_crud),
        ("Cart Operations", tester.test_cart_operations),
        ("Checkout Flow", tester.test_checkout_flow),
        ("Admin Stats", tester.test_admin_stats),
        ("Orders Endpoint", tester.test_orders_endpoint),
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Cleanup
    tester.cleanup_test_data()
    
    # Print results
    print(f"\n{'='*60}")
    print(f"📊 Test Results:")
    print(f"   Total tests run: {tester.tests_run}")
    print(f"   Tests passed: {tester.tests_passed}")
    print(f"   Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"   Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed test categories:")
        for test in failed_tests:
            print(f"   - {test}")
        return 1
    else:
        print(f"\n✅ All test categories passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())