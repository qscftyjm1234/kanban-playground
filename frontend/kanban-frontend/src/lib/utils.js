import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 組合 Tailwind CSS 類別的工具函式
 * 整合了 clsx (條件判斷) 與 twMerge (衝突合併)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
