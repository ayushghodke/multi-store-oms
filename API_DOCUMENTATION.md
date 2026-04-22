# M-OMS API Documentation

This document outlines the RESTful API endpoints available in the Multi-Store Order Management System (M-OMS). All endpoints are implemented natively as Next.js App Router API Routes (`/client/src/app/api`).

## Base URL
All API requests are prefixed with: `/api`

---

## 1. Stores

### `GET /api/stores`
Retrieves a list of all retail stores.

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Downtown Store",
      "location": "123 Main St",
      "created_at": "2024-04-20T10:00:00.000Z"
    }
  ]
}
```

### `POST /api/stores`
Creates a new retail store.

**Request Body**
```json
{
  "name": "Uptown Branch",
  "location": "456 High Ave"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Uptown Branch",
    "location": "456 High Ave",
    "created_at": "2024-04-20T10:05:00.000Z"
  }
}
```

---

## 2. Orders

### `GET /api/orders`
Retrieves a paginated list of orders, including their parent stores and related order items.

**Query Parameters**
- `page` (optional): Page number, defaults to 1.
- `limit` (optional): Number of records per page, defaults to 10.
- `store_id` (optional): Filter orders by a specific store ID.

**Example Request:** `/api/orders?page=1&limit=5&store_id=1`

**Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "store_id": 1,
      "total_amount": "150.50",
      "status": "pending",
      "created_at": "2024-04-21T08:00:00.000Z",
      "stores": { "id": 1, "name": "Downtown Store", "location": "123 Main St" },
      "order_items": [
        { "id": 501, "product_name": "Premium Widget", "quantity": 2, "price": "75.25" }
      ]
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 5,
    "totalPages": 9
  }
}
```

### `POST /api/orders`
Creates a new order along with its respective order items using an atomic database transaction.

**Request Body**
```json
{
  "store_id": 1,
  "total_amount": 150.50,
  "items": [
    {
      "product_name": "Premium Widget",
      "quantity": 2,
      "price": 75.25
    }
  ]
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": 102,
    "store_id": 1,
    "status": "pending",
    "total_amount": "150.50",
    "created_at": "2024-04-21T08:15:00.000Z",
    "order_items": [ /* items array */ ]
  }
}
```
*Note: Returns `400 Bad Request` with structured error array if Zod schema validation fails.*

### `PATCH /api/orders/[id]/status`
Updates the fulfillment status of an existing order.

**Request Body**
```json
{
  "status": "completed" // Enum: 'pending', 'completed', 'cancelled'
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": 102,
    "status": "completed",
    "updated_at": "2024-04-21T09:00:00.000Z",
    "...": "other order fields"
  }
}
```

---

## 3. Analytics & Admin (Archival)

### `GET /api/analytics`
Fetches pre-calculated business metrics and dashboard figures. Uses Raw SQL aggregations to calculate specific multi-model insights.

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "pendingOrdersCount": 14,
    "totalRevenue": 15420.75,
    "archiveEligibleCount": 2,
    "ordersPerDay": [
      { "date": "2024-04-21", "count": 25 }
    ],
    "revenueByStore": [
      { "store_name": "Downtown Store", "revenue": "8500.25" }
    ],
    "topProducts": [
      { "product": "Premium Widget", "quantity_sold": 150, "revenue": "11287.50" }
    ]
  }
}
```

### `POST /api/admin/archive`
Executes an atomic Prisma transaction to find all `completed` or `cancelled` orders older than 30 days. It snapshots the properties (including `order_items` as JSON), moves them to the `order_archive` table, and cascade-deletes the originals to optimize query performance on active tables.

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Archival process completed successfully.",
  "meta": {
    "archivedCount": 42
  }
}
```

---
## Error Handling
All endpoints follow a standardized JSON structure on failure:
```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [ /* Zod validation details if applicable */ ]
}
```
