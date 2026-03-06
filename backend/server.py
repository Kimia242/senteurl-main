from fastapi import FastAPI, APIRouter, HTTPException, Query, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe configuration
stripe_api_key = os.environ.get('STRIPE_API_KEY')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ==================== MODELS ====================

# Brand Models
class Brand(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    logo_url: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BrandCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    description: Optional[str] = None

class BrandUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None


# Category Models
class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str

class CategoryUpdate(BaseModel):
    name: Optional[str] = None


# Product Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    gender: str  # "homme", "femme", "unisex"
    stock: int = 0
    brand_id: str
    category_id: str
    image_url: Optional[str] = None
    images: List[str] = []
    is_new: bool = False
    is_promotion: bool = False
    discount_percentage: Optional[float] = None
    notes: Optional[str] = None  # Fragrance notes
    volume: Optional[str] = None  # e.g., "100ml"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    gender: str
    stock: int = 0
    brand_id: str
    category_id: str
    image_url: Optional[str] = None
    images: List[str] = []
    is_new: bool = False
    is_promotion: bool = False
    discount_percentage: Optional[float] = None
    notes: Optional[str] = None
    volume: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    gender: Optional[str] = None
    stock: Optional[int] = None
    brand_id: Optional[str] = None
    category_id: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    is_new: Optional[bool] = None
    is_promotion: Optional[bool] = None
    discount_percentage: Optional[float] = None
    notes: Optional[str] = None
    volume: Optional[str] = None


# Cart Models
class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    items: List[CartItem] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = 1


# Order Models
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price_at_purchase: float
    image_url: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    shipping_address: Optional[str] = None
    items: List[OrderItem] = []
    total_amount: float
    status: str = "pending"  # pending, paid, processing, shipped, delivered, cancelled
    payment_session_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    session_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str


# Payment Transaction Models
class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    checkout_session_id: str
    order_id: str
    amount: float
    currency: str = "xof"
    payment_status: str = "pending"  # pending, paid, failed, expired
    metadata: Dict[str, str] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Checkout Request Model
class CheckoutRequest(BaseModel):
    session_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    origin_url: str


# ==================== HELPER FUNCTIONS ====================

def serialize_datetime(doc: dict) -> dict:
    """Convert datetime objects to ISO strings for MongoDB storage"""
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc

def deserialize_datetime(doc: dict, fields: List[str]) -> dict:
    """Convert ISO strings back to datetime objects"""
    for field in fields:
        if field in doc and isinstance(doc[field], str):
            doc[field] = datetime.fromisoformat(doc[field])
    return doc


# ==================== ROOT ENDPOINT ====================

@api_router.get("/")
async def root():
    return {"message": "Senteur L API - Bienvenue"}


# ==================== BRAND ENDPOINTS ====================

@api_router.post("/brands", response_model=Brand)
async def create_brand(input: BrandCreate):
    brand = Brand(**input.model_dump())
    doc = serialize_datetime(brand.model_dump())
    await db.brands.insert_one(doc)
    return brand

@api_router.get("/brands", response_model=List[Brand])
async def get_brands():
    brands = await db.brands.find({}, {"_id": 0}).to_list(100)
    for b in brands:
        deserialize_datetime(b, ["created_at"])
    return brands

@api_router.get("/brands/{brand_id}", response_model=Brand)
async def get_brand(brand_id: str):
    brand = await db.brands.find_one({"id": brand_id}, {"_id": 0})
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    deserialize_datetime(brand, ["created_at"])
    return brand

@api_router.put("/brands/{brand_id}", response_model=Brand)
async def update_brand(brand_id: str, input: BrandUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    result = await db.brands.update_one({"id": brand_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    brand = await db.brands.find_one({"id": brand_id}, {"_id": 0})
    deserialize_datetime(brand, ["created_at"])
    return brand

@api_router.delete("/brands/{brand_id}")
async def delete_brand(brand_id: str):
    result = await db.brands.delete_one({"id": brand_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    return {"message": "Brand deleted"}


# ==================== CATEGORY ENDPOINTS ====================

@api_router.post("/categories", response_model=Category)
async def create_category(input: CategoryCreate):
    category = Category(**input.model_dump())
    doc = serialize_datetime(category.model_dump())
    await db.categories.insert_one(doc)
    return category

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    for c in categories:
        deserialize_datetime(c, ["created_at"])
    return categories

@api_router.get("/categories/{category_id}", response_model=Category)
async def get_category(category_id: str):
    category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    deserialize_datetime(category, ["created_at"])
    return category

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, input: CategoryUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    result = await db.categories.update_one({"id": category_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    deserialize_datetime(category, ["created_at"])
    return category

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}


# ==================== PRODUCT ENDPOINTS ====================

@api_router.post("/products", response_model=Product)
async def create_product(input: ProductCreate):
    product = Product(**input.model_dump())
    doc = serialize_datetime(product.model_dump())
    await db.products.insert_one(doc)
    return product

@api_router.get("/products", response_model=List[Product])
async def get_products(
    gender: Optional[str] = None,
    brand_id: Optional[str] = None,
    category_id: Optional[str] = None,
    is_new: Optional[bool] = None,
    is_promotion: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    limit: int = Query(default=50, le=100),
    skip: int = 0
):
    query = {}
    
    if gender:
        query["gender"] = gender
    if brand_id:
        query["brand_id"] = brand_id
    if category_id:
        query["category_id"] = category_id
    if is_new is not None:
        query["is_new"] = is_new
    if is_promotion is not None:
        query["is_promotion"] = is_promotion
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    if max_price is not None:
        if "price" in query:
            query["price"]["$lte"] = max_price
        else:
            query["price"] = {"$lte": max_price}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    for p in products:
        deserialize_datetime(p, ["created_at"])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    deserialize_datetime(product, ["created_at"])
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, input: ProductUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    result = await db.products.update_one({"id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    deserialize_datetime(product, ["created_at"])
    return product

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}


# ==================== CART ENDPOINTS ====================

@api_router.get("/cart/{session_id}")
async def get_cart(session_id: str):
    cart = await db.carts.find_one({"session_id": session_id}, {"_id": 0})
    if not cart:
        # Return empty cart
        return {"id": str(uuid.uuid4()), "session_id": session_id, "items": [], "total": 0}
    
    # Get product details for each item
    items_with_details = []
    total = 0
    for item in cart.get("items", []):
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            # Apply discount if promotion
            price = product["price"]
            if product.get("is_promotion") and product.get("discount_percentage"):
                price = price * (1 - product["discount_percentage"] / 100)
            
            item_total = price * item["quantity"]
            total += item_total
            items_with_details.append({
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "product": product,
                "price": price,
                "item_total": item_total
            })
    
    return {
        "id": cart.get("id"),
        "session_id": session_id,
        "items": items_with_details,
        "total": round(total, 2)
    }

@api_router.post("/cart/{session_id}/add")
async def add_to_cart(session_id: str, input: CartItemAdd):
    # Check if product exists and has stock
    product = await db.products.find_one({"id": input.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product["stock"] < input.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    cart = await db.carts.find_one({"session_id": session_id})
    
    if cart:
        # Check if product already in cart
        item_found = False
        for item in cart["items"]:
            if item["product_id"] == input.product_id:
                new_quantity = item["quantity"] + input.quantity
                if new_quantity > product["stock"]:
                    raise HTTPException(status_code=400, detail="Insufficient stock")
                item["quantity"] = new_quantity
                item_found = True
                break
        
        if not item_found:
            cart["items"].append({"product_id": input.product_id, "quantity": input.quantity})
        
        cart["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.carts.update_one(
            {"session_id": session_id},
            {"$set": {"items": cart["items"], "updated_at": cart["updated_at"]}}
        )
    else:
        # Create new cart
        new_cart = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "items": [{"product_id": input.product_id, "quantity": input.quantity}],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.carts.insert_one(new_cart)
    
    return {"message": "Product added to cart"}

@api_router.put("/cart/{session_id}/update")
async def update_cart_item(session_id: str, input: CartItemAdd):
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    if input.quantity <= 0:
        # Remove item
        cart["items"] = [item for item in cart["items"] if item["product_id"] != input.product_id]
    else:
        # Check stock
        product = await db.products.find_one({"id": input.product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if product["stock"] < input.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        
        # Update quantity
        for item in cart["items"]:
            if item["product_id"] == input.product_id:
                item["quantity"] = input.quantity
                break
    
    cart["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.carts.update_one(
        {"session_id": session_id},
        {"$set": {"items": cart["items"], "updated_at": cart["updated_at"]}}
    )
    
    return {"message": "Cart updated"}

@api_router.delete("/cart/{session_id}/remove/{product_id}")
async def remove_from_cart(session_id: str, product_id: str):
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart["items"] = [item for item in cart["items"] if item["product_id"] != product_id]
    cart["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.carts.update_one(
        {"session_id": session_id},
        {"$set": {"items": cart["items"], "updated_at": cart["updated_at"]}}
    )
    
    return {"message": "Item removed from cart"}

@api_router.delete("/cart/{session_id}/clear")
async def clear_cart(session_id: str):
    await db.carts.delete_one({"session_id": session_id})
    return {"message": "Cart cleared"}


# ==================== CHECKOUT & PAYMENT ENDPOINTS ====================

@api_router.post("/checkout")
async def create_checkout(request: Request, input: CheckoutRequest):
    # Get cart
    cart = await db.carts.find_one({"session_id": input.session_id})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total and create order items
    order_items = []
    total_amount = 0.0
    
    for item in cart["items"]:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item['product_id']} not found")
        if product["stock"] < item["quantity"]:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product['name']}")
        
        # Apply discount if promotion
        price = product["price"]
        if product.get("is_promotion") and product.get("discount_percentage"):
            price = price * (1 - product["discount_percentage"] / 100)
        
        item_total = price * item["quantity"]
        total_amount += item_total
        
        order_items.append(OrderItem(
            product_id=item["product_id"],
            product_name=product["name"],
            quantity=item["quantity"],
            price_at_purchase=round(price, 2),
            image_url=product.get("image_url")
        ))
    
    total_amount = round(total_amount, 2)
    
    # Create order
    order = Order(
        session_id=input.session_id,
        customer_name=input.customer_name,
        customer_email=input.customer_email,
        customer_phone=input.customer_phone,
        shipping_address=input.shipping_address,
        items=[item.model_dump() for item in order_items],
        total_amount=total_amount,
        status="pending"
    )
    
    order_doc = serialize_datetime(order.model_dump())
    await db.orders.insert_one(order_doc)
    
    # Create Stripe checkout session
    host_url = input.origin_url.rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    success_url = f"{host_url}/order-confirmation?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/cart"
    
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    checkout_request = CheckoutSessionRequest(
        amount=float(total_amount),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "order_id": order.id,
            "session_id": input.session_id,
            "customer_email": input.customer_email
        }
    )
    
    checkout_session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Update order with payment session ID
    await db.orders.update_one(
        {"id": order.id},
        {"$set": {"payment_session_id": checkout_session.session_id}}
    )
    
    # Create payment transaction record
    payment_transaction = PaymentTransaction(
        session_id=input.session_id,
        checkout_session_id=checkout_session.session_id,
        order_id=order.id,
        amount=float(total_amount),
        currency="usd",
        payment_status="pending",
        metadata={
            "order_id": order.id,
            "customer_email": input.customer_email
        }
    )
    
    payment_doc = serialize_datetime(payment_transaction.model_dump())
    await db.payment_transactions.insert_one(payment_doc)
    
    return {
        "checkout_url": checkout_session.url,
        "session_id": checkout_session.session_id,
        "order_id": order.id
    }


@api_router.get("/checkout/status/{checkout_session_id}")
async def get_checkout_status(request: Request, checkout_session_id: str):
    # Get payment transaction
    transaction = await db.payment_transactions.find_one(
        {"checkout_session_id": checkout_session_id},
        {"_id": 0}
    )
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # If already processed, return cached status
    if transaction["payment_status"] in ["paid", "failed"]:
        order = await db.orders.find_one({"id": transaction["order_id"]}, {"_id": 0})
        return {
            "status": transaction["payment_status"],
            "order_id": transaction["order_id"],
            "order": order
        }
    
    # Check with Stripe
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(checkout_session_id)
    
    # Update transaction status
    new_status = "pending"
    if checkout_status.payment_status == "paid":
        new_status = "paid"
    elif checkout_status.status == "expired":
        new_status = "expired"
    
    await db.payment_transactions.update_one(
        {"checkout_session_id": checkout_session_id},
        {"$set": {
            "payment_status": new_status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # If payment successful, update order and decrease stock
    if new_status == "paid":
        order = await db.orders.find_one({"id": transaction["order_id"]})
        
        if order and order["status"] != "paid":
            # Update order status
            await db.orders.update_one(
                {"id": transaction["order_id"]},
                {"$set": {"status": "paid"}}
            )
            
            # Decrease stock for each product
            for item in order["items"]:
                await db.products.update_one(
                    {"id": item["product_id"]},
                    {"$inc": {"stock": -item["quantity"]}}
                )
            
            # Clear cart
            await db.carts.delete_one({"session_id": order["session_id"]})
        
        order = await db.orders.find_one({"id": transaction["order_id"]}, {"_id": 0})
        return {
            "status": "paid",
            "order_id": transaction["order_id"],
            "order": order
        }
    
    return {
        "status": new_status,
        "order_id": transaction["order_id"]
    }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update payment transaction
        await db.payment_transactions.update_one(
            {"checkout_session_id": webhook_response.session_id},
            {"$set": {
                "payment_status": webhook_response.payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if webhook_response.payment_status == "paid":
            # Get transaction to find order
            transaction = await db.payment_transactions.find_one(
                {"checkout_session_id": webhook_response.session_id}
            )
            
            if transaction:
                order = await db.orders.find_one({"id": transaction["order_id"]})
                
                if order and order["status"] != "paid":
                    # Update order status
                    await db.orders.update_one(
                        {"id": transaction["order_id"]},
                        {"$set": {"status": "paid"}}
                    )
                    
                    # Decrease stock
                    for item in order["items"]:
                        await db.products.update_one(
                            {"id": item["product_id"]},
                            {"$inc": {"stock": -item["quantity"]}}
                        )
                    
                    # Clear cart
                    await db.carts.delete_one({"session_id": order["session_id"]})
        
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# ==================== ORDER ENDPOINTS ====================

@api_router.get("/orders", response_model=List[Order])
async def get_orders(
    session_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(default=50, le=100),
    skip: int = 0
):
    query = {}
    if session_id:
        query["session_id"] = session_id
    if status:
        query["status"] = status
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    for o in orders:
        deserialize_datetime(o, ["created_at"])
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    deserialize_datetime(order, ["created_at"])
    return order

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str):
    valid_statuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated"}


# ==================== ADMIN STATS ENDPOINT ====================

@api_router.get("/admin/stats")
async def get_admin_stats():
    total_products = await db.products.count_documents({})
    total_brands = await db.brands.count_documents({})
    total_categories = await db.categories.count_documents({})
    total_orders = await db.orders.count_documents({})
    paid_orders = await db.orders.count_documents({"status": "paid"})
    
    # Calculate total revenue
    pipeline = [
        {"$match": {"status": {"$in": ["paid", "processing", "shipped", "delivered"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Low stock products
    low_stock = await db.products.count_documents({"stock": {"$lte": 5}})
    
    return {
        "total_products": total_products,
        "total_brands": total_brands,
        "total_categories": total_categories,
        "total_orders": total_orders,
        "paid_orders": paid_orders,
        "total_revenue": round(total_revenue, 2),
        "low_stock_products": low_stock
    }


# ==================== SEED DATA ENDPOINT ====================

@api_router.post("/seed")
async def seed_database():
    """Seed the database with initial data"""
    
    # Check if data already exists
    existing_brands = await db.brands.count_documents({})
    if existing_brands > 0:
        return {"message": "Database already seeded"}
    
    return await _seed_data()

@api_router.post("/reseed")
async def reseed_database():
    """Clear and reseed the database"""
    # Clear existing data
    await db.products.delete_many({})
    await db.brands.delete_many({})
    await db.categories.delete_many({})
    
    return await _seed_data()

async def _seed_data():
    """Internal function to seed data"""
    # Create categories
    categories_data = [
        {"name": "Eau de Parfum"},
        {"name": "Eau de Toilette"},
        {"name": "Parfum"},
        {"name": "Cologne"},
        {"name": "Body Mist"}
    ]
    
    categories = []
    for cat_data in categories_data:
        cat = Category(**cat_data)
        doc = serialize_datetime(cat.model_dump())
        await db.categories.insert_one(doc)
        categories.append(cat)
    
    # Create brands
    brands_data = [
        {"name": "Chanel", "description": "Maison de luxe française fondée en 1909", "logo_url": "https://images.unsplash.com/photo-1640975972263-1f73398e943b?w=200"},
        {"name": "Dior", "description": "Élégance et sophistication depuis 1946", "logo_url": "https://images.unsplash.com/photo-1630512873562-ee0deb00ed4f?w=200"},
        {"name": "Guerlain", "description": "Parfumeur français depuis 1828", "logo_url": "https://images.unsplash.com/photo-1725139695447-f75e1b482708?w=200"},
        {"name": "Tom Ford", "description": "Luxe américain contemporain", "logo_url": "https://images.unsplash.com/photo-1643797517590-c44cb552ddcc?w=200"},
        {"name": "Yves Saint Laurent", "description": "Audace et modernité depuis 1961", "logo_url": "https://images.unsplash.com/photo-1733348172372-31f147483275?w=200"},
        {"name": "Armani", "description": "Style italien raffiné", "logo_url": "https://images.unsplash.com/photo-1726051810799-cb6c9a057236?w=200"}
    ]
    
    brands = []
    for brand_data in brands_data:
        brand = Brand(**brand_data)
        doc = serialize_datetime(brand.model_dump())
        await db.brands.insert_one(doc)
        brands.append(brand)
    
    # Product images
    product_images = [
        "https://images.unsplash.com/photo-1725139695447-f75e1b482708?w=400",
        "https://images.unsplash.com/photo-1643797517590-c44cb552ddcc?w=400",
        "https://images.unsplash.com/photo-1640975972263-1f73398e943b?w=400",
        "https://images.unsplash.com/photo-1630512873562-ee0deb00ed4f?w=400",
        "https://images.unsplash.com/photo-1733348172372-31f147483275?w=400",
        "https://images.unsplash.com/photo-1726051810799-cb6c9a057236?w=400",
        "https://images.unsplash.com/photo-1644820850778-034b767387dd?w=400",
        "https://images.unsplash.com/photo-1625502664816-4938b1d0d685?w=400"
    ]
    
    # Create products with XOF prices (Franc CFA)
    products_data = [
        # Chanel Products
        {"name": "N°5 Eau de Parfum", "description": "L'essence même du luxe féminin. Un bouquet floral aldehydé qui incarne l'élégance intemporelle. Créé en 1921 par Ernest Beaux pour Coco Chanel, ce parfum mythique reste le symbole absolu de la féminité raffinée.", "price": 115000.00, "gender": "femme", "stock": 25, "brand_id": brands[0].id, "category_id": categories[0].id, "image_url": product_images[0], "is_new": False, "is_promotion": False, "notes": "Rose, Jasmin, Ylang-Ylang, Santal", "volume": "100ml"},
        {"name": "Coco Mademoiselle", "description": "Une fragrance moderne et pétillante pour la femme audacieuse. Un parfum frais et oriental qui capture l'esprit libre et irrésistible de la femme Chanel contemporaine.", "price": 98000.00, "gender": "femme", "stock": 30, "brand_id": brands[0].id, "category_id": categories[0].id, "image_url": product_images[1], "is_new": True, "is_promotion": False, "notes": "Orange, Jasmin, Rose, Patchouli", "volume": "100ml"},
        {"name": "Bleu de Chanel", "description": "Une fraîcheur boisée pour l'homme libre et déterminé. Un parfum qui exprime la force tranquille de celui qui trace son propre chemin.", "price": 89000.00, "gender": "homme", "stock": 20, "brand_id": brands[0].id, "category_id": categories[1].id, "image_url": product_images[2], "is_new": False, "is_promotion": True, "original_price": 105000.00, "discount_percentage": 15, "notes": "Menthe, Cèdre, Santal, Encens", "volume": "100ml"},
        
        # Dior Products
        {"name": "J'adore", "description": "Un hymne à la féminité absolue, floral et sensuel. Ce chef-d'œuvre de la parfumerie moderne célèbre la femme dans toute sa splendeur avec un bouquet de fleurs précieuses.", "price": 105000.00, "gender": "femme", "stock": 35, "brand_id": brands[1].id, "category_id": categories[0].id, "image_url": product_images[3], "is_new": False, "is_promotion": False, "notes": "Ylang-Ylang, Rose, Jasmin", "volume": "100ml"},
        {"name": "Sauvage", "description": "L'esprit de grands espaces, frais et magnétique. Inspiré par les paysages désertiques, ce parfum incarne la liberté sauvage et l'authenticité masculine.", "price": 85000.00, "gender": "homme", "stock": 40, "brand_id": brands[1].id, "category_id": categories[1].id, "image_url": product_images[4], "is_new": False, "is_promotion": False, "notes": "Bergamote, Poivre, Ambroxan", "volume": "100ml"},
        {"name": "Miss Dior", "description": "Romance et élégance dans un flacon iconique. Un parfum qui capture l'essence de l'amour parisien avec sa fraîcheur florale et sa sensualité délicate.", "price": 95000.00, "gender": "femme", "stock": 28, "brand_id": brands[1].id, "category_id": categories[0].id, "image_url": product_images[5], "is_new": True, "is_promotion": False, "notes": "Rose, Pivoine, Iris", "volume": "100ml"},
        
        # Guerlain Products
        {"name": "Shalimar", "description": "Un classique oriental, mystérieux et envoûtant. Créé en 1925, ce parfum légendaire s'inspire des jardins de Shalimar et de l'histoire d'amour du Shah Jahan.", "price": 118000.00, "gender": "femme", "stock": 15, "brand_id": brands[2].id, "category_id": categories[2].id, "image_url": product_images[6], "is_new": False, "is_promotion": True, "original_price": 145000.00, "discount_percentage": 20, "notes": "Bergamote, Iris, Vanille, Opoponax", "volume": "90ml"},
        {"name": "L'Homme Idéal", "description": "Le parfum du gentleman moderne et charismatique. Un équilibre parfait entre douceur et intensité pour l'homme qui sait ce qu'il veut.", "price": 78000.00, "gender": "homme", "stock": 22, "brand_id": brands[2].id, "category_id": categories[1].id, "image_url": product_images[7], "is_new": False, "is_promotion": False, "notes": "Amande, Cuir, Vanille", "volume": "100ml"},
        
        # Tom Ford Products
        {"name": "Black Orchid", "description": "Une création audacieuse et glamour. Ce parfum unisexe aux notes sombres et sensuelles est devenu une icône de la parfumerie de niche.", "price": 135000.00, "gender": "unisex", "stock": 18, "brand_id": brands[3].id, "category_id": categories[0].id, "image_url": product_images[0], "is_new": True, "is_promotion": False, "notes": "Truffe Noire, Orchidée, Patchouli", "volume": "100ml"},
        {"name": "Oud Wood", "description": "L'essence du luxe oriental. Un parfum sophistiqué qui marie la richesse de l'oud aux bois précieux pour une élégance rare.", "price": 175000.00, "gender": "unisex", "stock": 12, "brand_id": brands[3].id, "category_id": categories[0].id, "image_url": product_images[1], "is_new": False, "is_promotion": False, "notes": "Oud, Santal, Cardamome, Poivre", "volume": "100ml"},
        {"name": "Tobacco Vanille", "description": "Chaleur et sophistication dans un accord unique. Un parfum gourmand et opulent qui évoque les clubs privés et les soirées élégantes.", "price": 165000.00, "gender": "unisex", "stock": 10, "brand_id": brands[3].id, "category_id": categories[0].id, "image_url": product_images[2], "is_new": False, "is_promotion": True, "original_price": 185000.00, "discount_percentage": 10, "notes": "Tabac, Vanille, Cacao, Tonka", "volume": "100ml"},
        
        # YSL Products
        {"name": "Libre", "description": "La liberté incarnée dans un parfum floral lavande. Un hommage à la femme indépendante qui ose être elle-même sans compromis.", "price": 88000.00, "gender": "femme", "stock": 32, "brand_id": brands[4].id, "category_id": categories[0].id, "image_url": product_images[3], "is_new": True, "is_promotion": False, "notes": "Lavande, Fleur d'Oranger, Musc", "volume": "90ml"},
        {"name": "La Nuit de L'Homme", "description": "Séduction nocturne pour l'homme mystérieux. Un parfum intense et captivant qui laisse une empreinte inoubliable.", "price": 75000.00, "gender": "homme", "stock": 25, "brand_id": brands[4].id, "category_id": categories[1].id, "image_url": product_images[4], "is_new": False, "is_promotion": False, "notes": "Cardamome, Cèdre, Vétiver", "volume": "100ml"},
        {"name": "Mon Paris", "description": "L'amour parisien dans un flacon. Un parfum fruité et floral qui capture la passion et l'intensité des nuits parisiennes.", "price": 82000.00, "gender": "femme", "stock": 28, "brand_id": brands[4].id, "category_id": categories[0].id, "image_url": product_images[5], "is_new": False, "is_promotion": True, "original_price": 95000.00, "discount_percentage": 15, "notes": "Fraise, Pivoine, Patchouli", "volume": "90ml"},
        
        # Armani Products
        {"name": "Sì", "description": "L'essence de la femme moderne et confiante. Un parfum qui célèbre l'élégance italienne et la féminité affirmée.", "price": 85000.00, "gender": "femme", "stock": 30, "brand_id": brands[5].id, "category_id": categories[0].id, "image_url": product_images[6], "is_new": False, "is_promotion": False, "notes": "Cassis, Rose, Vanille Blonde", "volume": "100ml"},
        {"name": "Acqua di Giò", "description": "La fraîcheur méditerranéenne pour homme. Inspiré par l'île de Pantelleria, ce parfum iconique évoque les vagues et le soleil italien.", "price": 72000.00, "gender": "homme", "stock": 45, "brand_id": brands[5].id, "category_id": categories[1].id, "image_url": product_images[7], "is_new": False, "is_promotion": False, "notes": "Agrumes, Jasmin, Notes Marines", "volume": "100ml"},
        {"name": "Code Absolu", "description": "L'élégance masculine intense et magnétique. Un parfum sophistiqué pour l'homme qui assume sa sensualité.", "price": 82000.00, "gender": "homme", "stock": 20, "brand_id": brands[5].id, "category_id": categories[0].id, "image_url": product_images[0], "is_new": True, "is_promotion": False, "notes": "Pomme, Tonka, Cuir", "volume": "110ml"},
    ]
    
    for prod_data in products_data:
        product = Product(**prod_data)
        doc = serialize_datetime(product.model_dump())
        await db.products.insert_one(doc)
    
    return {"message": "Database seeded successfully", "brands": len(brands), "categories": len(categories), "products": len(products_data)}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
