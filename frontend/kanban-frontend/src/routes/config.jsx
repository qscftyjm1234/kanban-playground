import { LayoutPanelLeft, LogIn, UserPlus } from 'lucide-react';
import KanbanPage from '../pages/KanbanPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

/**
 * 路由配置清單
 * 沿用 LifeHub 專案風格，便於動態生成 Sidebar 與路由組件
 */
export const routesConfig = [
  {
    key: 'kanban',
    path: '/',
    title: '工作看板',
    icon: <LayoutPanelLeft className="w-5 h-5" />,
    element: <KanbanPage />,
    protected: true,
  },
  {
    key: 'login',
    path: '/login',
    title: '登入',
    icon: <LogIn className="w-5 h-5" />,
    element: <LoginPage />,
    hideInSidebar: true,
  },
  {
    key: 'register',
    path: '/register',
    title: '註冊',
    icon: <UserPlus className="w-5 h-5" />,
    element: <RegisterPage />,
    hideInSidebar: true,
  }
];

export const getRouteByKey = (key) => routesConfig.find(r => r.key === key);
