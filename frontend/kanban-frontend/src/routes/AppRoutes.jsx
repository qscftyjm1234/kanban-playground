import React from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import { routesConfig } from './config';
import useAuthStore from '../store/useAuthStore';

/**
 * 路由渲染元件
 * 支援從 App.jsx 注入全域屬性給元件
 */
export default function AppRoutes({ isDarkMode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const injectProps = (routes) => {
    return routes.map(route => {
      const newRoute = { ...route };
      
      if (route.element) {
        // 如果是受保護路由且未登入，跳轉至登入頁
        if (route.protected && !isAuthenticated) {
          newRoute.element = <Navigate to="/login" replace />;
        } else {
          // 使用 React.cloneElement 注入全域 Props
          newRoute.element = React.cloneElement(route.element, { 
            isDarkMode,
          });
        }
      }

      if (route.children) {
        newRoute.children = injectProps(route.children);
      }

      return newRoute;
    });
  };

  const processedRoutes = injectProps(routesConfig);
  const element = useRoutes(processedRoutes);

  return element;
}
