import React from 'react';
import { Sun, Moon, LogOut, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import useAuthStore from '../../store/useAuthStore';
import { Popconfirm, message } from 'antd';

/**
 * 頂部導航欄
 * 包含搜尋、通知以及主題切換功能
 */
export default function Header({ isDarkMode, toggleTheme }) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    message.success('已安全登出');
  };

  return (
    <header className={cn(
      "h-16 px-8 flex items-center justify-between border-b transition-all duration-300",
      { 
        "bg-slate-900 border-slate-800": isDarkMode, 
        "bg-white border-slate-200": !isDarkMode 
      }
    )}>
      <div className="flex items-center gap-4 flex-1">
        {/* 左側保留空間或可放置標題 */}
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className={cn(
            "p-2 rounded-xl transition-all",
            { "hover:bg-slate-800": isDarkMode, "hover:bg-slate-100": !isDarkMode }
          )}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none mb-1">{user?.username || '使用者'}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{user?.role || 'Guest'}</p>
          </div>
          <Popconfirm
            title="確定要登出系統嗎？"
            onConfirm={handleLogout}
            okText="確定"
            cancelText="取消"
            placement="bottomRight"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white dark:border-slate-800 shadow-sm shadow-blue-500/20 cursor-pointer flex items-center justify-center text-white hover:scale-105 transition-all">
              <User size={20} />
            </div>
          </Popconfirm>
        </div>
      </div>
    </header>
  );
}
