/**
 * Create a new order
 * POST /orders/create
 */
export const createOrder = async (c: Context) => {
  try {
    console.log('📦 Order creation request received');
    
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      console.error('❌ Order creation failed - authentication error:', authError);
      return c.json({ 
        success: false,
        error: authError || "Unauthorized",
        errorAr: authError === 'Invalid JWT' ? 'رمز الوصول غير صالح' : 'غير مصرح',
        code: 401,
        message: authError || "Unauthorized"
      }, 401);
    }

    console.log('✅ User authenticated for order:', user.email);

    const body = await c.req.json();
    const {
      productId,
      quantity,
      deliveryMethod, // 'delivery' or 'meetup'
      deliveryAddress,
      paymentMethod, // 'cash', 'card', 'tabby', 'tamara'
      notes,
    } = body;

    // Validate inputs
    if (!productId) {
      return c.json({ error: "Product ID is required" }, 400);
    }

    if (!quantity || quantity < 1) {
      return c.json({ error: "Valid quantity is required" }, 400);
    }

    if (!deliveryMethod) {
      return c.json({ error: "Delivery method is required" }, 400);
    }

    if (deliveryMethod === "delivery" && !deliveryAddress) {
      return c.json(
        { error: "Delivery address is required for delivery orders" },
        400
      );
    }

    // Fetch product details
    const productData = await kv.get(`product:${productId}`);
    if (!productData) {
      return c.json({ error: "Product not found" }, 404);
    }

    const product = JSON.parse(productData);

    // Check if product is available
    if (product.status === "out_of_stock" || product.quantity === 0) {
      return c.json({ error: "Product is out of stock" }, 400);
    }

    // Check if enough stock available
    if (product.quantity < quantity) {
      return c.json(
        {
          error: `Only ${product.quantity} items available`,
          errorAr: `فقط ${product.quantity} قطعة متوفرة`,
        },
        400
      );
    }

    // Prevent self-purchase
    if (product.sellerId === user.id) {
      return c.json(
        {
          error: "You cannot purchase your own products",
          errorAr: "لا يمكنك شراء منتجاتك الخاصة",
        },
        400
      );
    }

    // Calculate pricing
    const subtotal = product.price * quantity;
    const platformFeeData = calculatePlatformFee(subtotal);
    const deliveryFee = deliveryMethod === "delivery" ? 20 : 0; // 20 SAR delivery fee
    const total = subtotal + platformFeeData.fee + deliveryFee;

    // Generate order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create order object
    const order = {
      id: orderId,
      buyerId: user.id,
      buyerName: user.fullName || user.name,
      buyerPhone: user.phone,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      sellerPhone: product.sellerPhone,
      
      // Product snapshot (important: capture product state at time of order)
      product: {
        id: product.id,
        title: product.title,
        titleAr: product.titleAr,
        description: product.description,
        descriptionAr: product.descriptionAr,
        price: product.price,
        category: product.category,
        condition: product.condition,
        images: product.images,
      },

      // Order details
      quantity,
      subtotal,
      platformFee: platformFeeData.fee,
      platformFeePercentage: platformFeeData.percentage,
      deliveryFee,
      total,

      // Delivery & payment
      deliveryMethod,
      deliveryAddress: deliveryAddress || null,
      paymentMethod,
      notes: notes || null,

      // Status tracking
      status: "pending", // pending, confirmed, shipped, delivered, cancelled
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date().toISOString(),
          note: "Order created",
        },
      ],

      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save order
    await kv.set(`order:${orderId}`, JSON.stringify(order));

    // Add to buyer's orders list
    const buyerOrdersKey = `buyer:${user.id}:orders`;
    const existingBuyerOrders = await kv.get(buyerOrdersKey);
    const buyerOrdersList = existingBuyerOrders
      ? JSON.parse(existingBuyerOrders)
      : [];
    buyerOrdersList.unshift(orderId); // Add to beginning (newest first)
    await kv.set(buyerOrdersKey, JSON.stringify(buyerOrdersList));

    // Add to seller's orders list
    const sellerOrdersKey = `seller:${product.sellerId}:orders`;
    const existingSellerOrders = await kv.get(sellerOrdersKey);
    const sellerOrdersList = existingSellerOrders
      ? JSON.parse(existingSellerOrders)
      : [];
    sellerOrdersList.unshift(orderId); // Add to beginning (newest first)
    await kv.set(sellerOrdersKey, JSON.stringify(sellerOrdersList));

    // Update product stock
    const updatedProduct = {
      ...product,
      quantity: product.quantity - quantity,
      stock: product.stock - quantity,
      status:
        product.quantity - quantity === 0 ? "out_of_stock" : product.status,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`product:${productId}`, JSON.stringify(updatedProduct));

    console.log(
      `Order created: ${orderId} - Buyer: ${user.id}, Seller: ${product.sellerId}, Product: ${productId}, Quantity: ${quantity}, Total: ${total} SAR`
    );

    return c.json({
      success: true,
      order,
      message: "Order created successfully",
      messageAr: "تم إنشاء الطلب بنجاح",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return c.json(
      { error: `Failed to create order: ${error.message}` },
      500
    );
  }
};

/**
 * Get order details by ID
 * POST /orders/details
 */
export const getOrderDetails = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { orderId } = body;

    if (!orderId) {
      return c.json({ error: "Order ID is required" }, 400);
    }

    // Fetch order
    const orderData = await kv.get(`order:${orderId}`);
    if (!orderData) {
      return c.json({ error: "Order not found" }, 404);
    }

    const order = JSON.parse(orderData);

    // Verify user has access to this order (buyer or seller)
    if (order.buyerId !== user.id && order.sellerId !== user.id) {
      return c.json(
        { error: "You don't have permission to view this order" },
        403
      );
    }

    return c.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return c.json(
      { error: `Failed to fetch order details: ${error.message}` },
      500
    );
  }
};

/**
 * Get buyer's orders
 * GET /orders/my-orders
 */
export const getBuyerOrders = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Fetch buyer's order list
    const buyerOrdersKey = `buyer:${user.id}:orders`;
    const orderListData = await kv.get(buyerOrdersKey);

    if (!orderListData) {
      return c.json({
        success: true,
        orders: [],
        total: 0,
      });
    }

    const orderIds = JSON.parse(orderListData);

    // Fetch all orders
    const orders = [];
    for (const orderId of orderIds) {
      const orderData = await kv.get(`order:${orderId}`);
      if (orderData) {
        orders.push(JSON.parse(orderData));
      }
    }

    return c.json({
      success: true,
      orders,
      total: orders.length,
    });
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    return c.json(
      { error: `Failed to fetch orders: ${error.message}` },
      500
    );
  }
};

/**
 * Get seller's orders
 * GET /orders/seller-orders
 */
export const getSellerOrders = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    // Fetch seller's order list
    const sellerOrdersKey = `seller:${user.id}:orders`;
    const orderListData = await kv.get(sellerOrdersKey);

    if (!orderListData) {
      return c.json({
        success: true,
        orders: [],
        total: 0,
      });
    }

    const orderIds = JSON.parse(orderListData);

    // Fetch all orders
    const orders = [];
    for (const orderId of orderIds) {
      const orderData = await kv.get(`order:${orderId}`);
      if (orderData) {
        orders.push(JSON.parse(orderData));
      }
    }

    return c.json({
      success: true,
      orders,
      total: orders.length,
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return c.json(
      { error: `Failed to fetch orders: ${error.message}` },
      500
    );
  }
};

/**
 * Update order status
 * POST /orders/update-status
 */
export const updateOrderStatus = async (c: Context) => {
  try {
    // Verify user authentication
    const { error: authError, user } = await verifyUser(c);
    if (authError || !user) {
      return c.json({ error: authError || "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { orderId, status, note } = body;

    // Validate inputs
    if (!orderId) {
      return c.json({ error: "Order ID is required" }, 400);
    }

    if (!status) {
      return c.json({ error: "Status is required" }, 400);
    }

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return c.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        400
      );
    }

    // Fetch order
    const orderData = await kv.get(`order:${orderId}`);
    if (!orderData) {
      return c.json({ error: "Order not found" }, 404);
    }

    const order = JSON.parse(orderData);

    // Verify user is the seller (only sellers can update order status)
    if (order.sellerId !== user.id) {
      return c.json(
        { error: "Only the seller can update order status" },
        403
      );
    }

    // Update order status
    const updatedOrder = {
      ...order,
      status,
      statusHistory: [
        ...order.statusHistory,
        {
          status,
          timestamp: new Date().toISOString(),
          note: note || null,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    // If order is cancelled, restore product stock
    if (status === "cancelled" && order.status !== "cancelled") {
      const productData = await kv.get(`product:${order.product.id}`);
      if (productData) {
        const product = JSON.parse(productData);
        const restoredProduct = {
          ...product,
          quantity: product.quantity + order.quantity,
          stock: product.stock + order.quantity,
          status: "active", // Make available again
          updatedAt: new Date().toISOString(),
        };
        await kv.set(`product:${order.product.id}`, JSON.stringify(restoredProduct));
        console.log(`Stock restored for product ${order.product.id}: +${order.quantity}`);
      }
    }

    // Save updated order
    await kv.set(`order:${orderId}`, JSON.stringify(updatedOrder));

    console.log(
      `Order status updated: ${orderId} - ${order.status} → ${status} by seller ${user.id}`
    );

    return c.json({
      success: true,
      order: updatedOrder,
      message: "Order status updated successfully",
      messageAr: "تم تحديث حالة الطلب بنجاح",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return c.json(
      { error: `Failed to update order status: ${error.message}` },
      500
    );
  }
};