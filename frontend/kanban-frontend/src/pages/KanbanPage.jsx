import React, { useState, useEffect, useMemo } from 'react';
import useTaskStore from '../store/useTaskStore';
import KanbanBoard from '../components/kanban/KanbanBoard';
import KanbanTable from '../components/kanban/KanbanTable';
import TaskModal from '../components/kanban/TaskModal';
import {
  Plus,
  LayoutGrid,
  List as ListIcon,
  Search,
  Filter,
  LayoutPanelLeft,
  Sparkles,
  MousePointer2
} from 'lucide-react';
import { Input, Select, Segmented, Button, Space, Modal, message } from 'antd';
import { cn } from '../lib/utils';

/**
 * Kanban 頁面
 * 展示看板核心內容，包含統計摘要與任務編輯
 */
export default function KanbanPage({ isDarkMode }) {
  const {
    tasks,
    fetchTasks,
    fetchBoards,
    selectedBoardId,
    boards,
    isLoading,
    createBoard,
    deleteTask
  } = useTaskStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // 看板建立相關
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // 核心過濾邏輯
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || task.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [tasks, searchQuery, filterStatus]);

  // 查找當前選中的看板資訊
  const currentBoard = useMemo(() => {
    return boards.find(b => b.id === selectedBoardId);
  }, [boards, selectedBoardId]);

  const openNewTaskModal = () => {
    setEditingTaskId(null);
    setModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setModalOpen(true);
  };

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;
    await createBoard(newBoardTitle);
    message.success('已建立新看板');
    setNewBoardTitle('');
    setIsBoardModalOpen(false);
  };

  // 取得當前正在編輯的實體資料
  const editingTask = useMemo(() => {
    return tasks.find(t => t.id === editingTaskId) || null;
  }, [tasks, editingTaskId]);

  // --- 引導畫面 (Empty State) ---
  if (!isLoading && boards.length === 0) {
    return (
      <div className={cn(
        "h-full w-full flex items-center justify-center relative overflow-hidden p-8 select-none transition-colors duration-300",
        isDarkMode ? "bg-slate-950" : "bg-slate-50"
      )}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none opacity-50" />

        <div className="max-w-md w-full text-center relative z-10">
          <div className="relative inline-block mb-10 group">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative w-32 h-32 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 border border-slate-200 dark:border-slate-800 transition-transform duration-500 group-hover:scale-110">
              <LayoutPanelLeft className="w-16 h-16 text-blue-600 animate-in zoom-in duration-700" />
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg animate-bounce">
                <Plus className="w-5 h-5" />
              </div>
            </div>
            <Sparkles className="absolute -bottom-4 -left-4 w-10 h-10 text-yellow-400 opacity-50 animate-pulse delay-700" />
          </div>

          <h2 className="text-4xl font-black tracking-tight mb-4 bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            開始記錄大小事吧!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 leading-relaxed font-medium">
            目前沒有任何看板。建立一個新的看板來管理您的專案、團隊協作與待辦事項進度。
          </p>

          <Button
            type="primary"
            size="large"
            icon={<MousePointer2 className="w-5 h-5" />}
            onClick={() => setIsBoardModalOpen(true)}
            className="h-16 px-12 rounded-[2rem] bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-500/40 text-lg font-bold border-none transition-all hover:scale-105 active:scale-95"
          >
            建立我的第一個看板
          </Button>

          <div className="mt-8 text-xs text-slate-400 dark:text-slate-600 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            點擊上方按鈕立即開啟專案管理
          </div>
        </div>

        {/* 看板名稱輸入彈窗 */}
        <Modal
          title={<span className="text-lg font-bold">建立我的第一個看板</span>}
          open={isBoardModalOpen}
          onOk={handleCreateBoard}
          onCancel={() => setIsBoardModalOpen(false)}
          okText="建立看板"
          cancelText="取消"
          centered
          className="rounded-3xl overflow-hidden"
          okButtonProps={{ className: "bg-blue-600 rounded-xl h-10 font-bold" }}
          cancelButtonProps={{ className: "rounded-xl h-10" }}
        >
          <div className="py-4">
            <p className="text-sm text-slate-500 mb-2 font-medium">給您的看板取個專業的名字：</p>
            <Input
              placeholder="例如：產品研發、個人待辦、行銷計畫..."
              size="large"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              onPressEnter={handleCreateBoard}
              className="rounded-xl h-12 text-lg font-medium border-slate-200 dark:border-slate-800"
              autoFocus
            />
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-8 h-full flex flex-col gap-8 select-none transition-colors duration-300",
      isDarkMode ? "bg-slate-950" : "bg-slate-50"
    )}>
      {/* 標題與操作區 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            {currentBoard ? `${currentBoard.title}` : '待辦事項'}
          </h2>
          <p className="text-slate-500 text-sm">
            當前共有 <span className="font-semibold text-blue-600">{tasks.length}</span> 個待辦事項進行中
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 搜尋框 */}
          <Input
            prefix={<Search className="w-4 h-4 opacity-50" />}
            placeholder="搜尋待辦事項..."
            className="w-64 h-10 rounded-xl shadow-sm border-slate-200 dark:border-slate-800"
            allowClear
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* 狀態篩選 */}
          <Select
            placeholder="篩選狀態"
            defaultValue="ALL"
            options={[
              { value: 'ALL', label: '全部狀態' },
              { value: 'TODO', label: '待處理' },
              { value: 'IN_PROGRESS', label: '進行中' },
              { value: 'IN_REVIEW', label: '待驗收' },
              { value: 'DONE', label: '已完成' },
            ]}
            className="w-32 h-10 rounded-xl"
            onChange={setFilterStatus}
          />

          {/* 視圖切換器 */}
          <Segmented
            options={[
              { value: 'board', icon: <LayoutGrid className="w-4 h-4 inline-block -mt-1" /> },
              { value: 'table', icon: <ListIcon className="w-4 h-4 inline-block -mt-1" /> }
            ]}
            value={viewMode}
            onChange={setViewMode}
            className={cn("p-1 h-10 rounded-xl", { "bg-slate-800": isDarkMode })}
          />

          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={openNewTaskModal}
            className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 font-bold"
          >
            新增待辦事項
          </Button>
        </div>
      </div>

      {/* 核心內容區域 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === 'board' ? (
          <KanbanBoard
            tasks={filteredTasks}
            isDarkMode={isDarkMode}
            onEdit={handleEditTask}
          />
        ) : (
          <KanbanTable
            tasks={filteredTasks}
            isDarkMode={isDarkMode}
            onEdit={handleEditTask}
            onDelete={deleteTask}
          />
        )}
      </div>

      {/* 編輯/新增彈窗 */}
      <TaskModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingTaskId(null);
        }}
        taskId={editingTaskId}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
