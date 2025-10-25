"use client";

import React from "react";

interface OrderModalProps {
  order: any;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
  loading?: boolean;
}

const allowedStatuses = ["pending", "shipped", "delivered", "cancelled"];

const OrderModal: React.FC<OrderModalProps> = ({
  order,
  onClose,
  onStatusChange,
  loading = false,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative">
        {loading ? (
          <p className="text-gray-600">Loading order details...</p>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Customer:</strong> {order.user?.name} ({order.user?.email})</p>
              <p>
                <strong>Status:</strong>{" "}
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {allowedStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </p>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            </div>

            <hr className="my-4" />

            <h3 className="text-lg font-semibold mb-2">Items</h3>
            {order.items && order.items.length > 0 ? (
              <ul className="space-y-1">
                {order.items.map((item: any, i: number) => (
                  <li key={i} className="flex justify-between">
                    <span>{item.product.name} × {item.quantity}</span>
                    <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No items found</p>
            )}

            <hr className="my-4" />
            <p className="text-right font-semibold text-lg">Total: ${order.total.toFixed(2)}</p>

            <div className="flex justify-end mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
