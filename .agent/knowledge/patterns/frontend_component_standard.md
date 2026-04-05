# 前端組件實作標準 (Frontend Component Pattern)

本文件定義專案中 React 組件的標準實作模式，確保 UI 層架構的一致性。

---

## 1. 組件結構規範 (Standard Structure)

```jsx
import React from 'react';
import useTaskStore from '../../store/useTaskStore';
import { cn } from '../../lib/utils';

/**
 * 組件用途說明 (JSDoc)
 */
export default function ComponentName({ prop1, prop2, className }) {
  // 1. Store 掛載
  // 2. 本地狀態 Hooks (useState, useEffect)
  // 3. 邏輯處理 (Handlers)

  return (
    <div className={cn(
      "base-styles",
      "dynamic-variant-styles",
      className
    )}>
      {/* 渲染邏輯 */}
    </div>
  );
}
```

---

## 2. 關鍵實踐 (Key Practices)
- **Props 分發**: 容器組件負責分發資料，子組件純粹負責渲染。
- **樣式重用**: 所有的 UI 樣式必須符合「視覺規範師 (ui_styles)」，使用毛玻璃與深層色階。
- **數據通訊**: 優先使用 Zustand Store 中的 Actions，避免組件層級過深的 Props Drilling。
