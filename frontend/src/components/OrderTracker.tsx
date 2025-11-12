"use client";

import { motion } from "framer-motion";
import React from "react";

interface OrderTrackerProps {
  status: "pending" | "packing" | "shipped" | "delivered" | "cancelled";
}

const STAGES = ["pending", "packing", "shipped", "delivered"];

const COLORS = {
  active: "#025a6a", // SLATE_TEAL
  complete: "#025a6a", // SLATE_TEAL
  inactive: "#e5e7eb", // gray-200
  cancelled: "#dc2626", // red-600
};

export default function OrderTracker({ status }: OrderTrackerProps) {
  const currentIndex =
    status === "cancelled" ? -1 : STAGES.indexOf(status.toLowerCase());

  const progressPercent =
    status === "cancelled"
      ? 100
      : (currentIndex / (STAGES.length - 1)) * 100;

  return (
    <div className="relative w-full mt-6 mb-2">
      {/* Background line */}
      <div
        className="absolute top-3 left-0 h-1 w-full rounded-full"
        style={{
          backgroundColor:
            status === "cancelled" ? COLORS.cancelled : COLORS.inactive,
        }}
      ></div>

      {/* Animated progress line */}
      <motion.div
        className="absolute top-3 left-0 h-1 rounded-full origin-left"
        style={{
          backgroundColor:
            status === "cancelled" ? COLORS.cancelled : COLORS.active,
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progressPercent}%` }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      ></motion.div>

      {/* Dots & Labels */}
      <div className="relative flex justify-between items-center">
        {STAGES.map((stage, index) => {
          const isCompleted = currentIndex > index;
          const isActive = currentIndex === index;
          const isCancelled = status === "cancelled";

          const circleColor = isCancelled
            ? COLORS.cancelled
            : isCompleted
            ? COLORS.complete
            : isActive
            ? COLORS.active
            : COLORS.inactive;

          return (
            <div key={stage} className="flex flex-col items-center w-full z-10">
              {/* Dot */}
              <motion.div
                className="w-6 h-6 rounded-full shadow flex items-center justify-center"
                style={{
                  backgroundColor: circleColor,
                }}
                whileHover={{ scale: 1.1 }}
              ></motion.div>

              {/* Label */}
              <span
                className="text-xs mt-2 font-medium capitalize"
                style={{
                  color: isCancelled
                    ? COLORS.cancelled
                    : isActive || isCompleted
                    ? COLORS.active
                    : "#6b7280", // gray-500
                }}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>

      {/* Cancelled Label */}
      {status === "cancelled" && (
        <div className="text-center mt-4 text-red-600 font-semibold text-sm">
          ❌ This order was cancelled
        </div>
      )}
    </div>
  );
}
