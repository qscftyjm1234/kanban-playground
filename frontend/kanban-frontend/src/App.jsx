import React, { useState, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AppRoutes from './routes/AppRoutes';
import { cn } from './lib/utils';
import useAuthStore from './store/useAuthStore';
import zhTW from 'antd/locale/zh_TW';
import 'dayjs/locale/zh-tw';

/**
 * Kanban 專案入口
 * 負責全域主題控制、版面配置與路由設定
 */
function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('kanban-theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('kanban-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('kanban-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  
  // 檢查目前是否為「非導航頁面」(如登入或註冊)
  const pathname = window.location.pathname;
  const isAuthPage = pathname === '/login' || pathname === '/register';
  // 僅在「已授權」且「非登入/註冊頁面」時顯示佈局
  const showDashboardLayout = isAuthenticated && !isAuthPage;

  return (
    <ConfigProvider
      locale={zhTW}
      theme={{
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#2563eb',
          borderRadius: 12,
          fontFamily: 'Inter, system-ui, sans-serif',
          colorBgContainer: isDarkMode ? '#0f172a' : '#ffffff',
          colorBgLayout: isDarkMode ? '#020617' : '#f8fafc',
        }
      }}
    >
      <BrowserRouter>
        <div className={cn(
          "flex min-h-screen transition-all duration-300",
          { "bg-slate-950 text-white": isDarkMode, "bg-slate-50 text-slate-900": !isDarkMode }
        )}>
          {showDashboardLayout ? (
            <>
              {/* 側邊欄 */}
              <Sidebar isDarkMode={isDarkMode} />

              {/* 主內容區域 */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* 頂部欄 */}
                <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

                {/* 主視圖區塊 */}
                <main className="flex-1 overflow-x-auto no-scrollbar relative">
                  {/* 背景微裝飾 */}
                  <div className={cn(
                    "absolute top-0 right-0 w-[500px] h-[500px] rounded-full -mr-64 -mt-64 blur-[120px] -z-10 transition-opacity duration-1000",
                    { "bg-blue-600/10 opacity-100": isDarkMode, "bg-blue-200/40 opacity-100": !isDarkMode }
                  )} />

                  <AppRoutes isDarkMode={isDarkMode} />
                </main>
              </div>
            </>
          ) : (
            <div className="flex-1">
              <AppRoutes isDarkMode={isDarkMode} />
            </div>
          )}
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
