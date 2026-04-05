import React, { useState, useEffect, useMemo } from 'react';
import useTaskStore from '../store/useTaskStore';
import KanbanBoard from '../components/kanban/KanbanBoard';
import KanbanTable from '../components/kanban/KanbanTable';
import TaskModal from '../components/kanban/TaskModal';
import { Plus, LayoutGrid, List as ListIcon, Search, Filter } from 'lucide-react';
import { Input, Select, Segmented, Button, Space } from 'antd';
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
    deleteTask
  } = useTaskStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    // 優先初始化看板清單
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

  // 取得當前正在編輯的實體資料（確保與 Store 同步）
  const editingTask = useMemo(() => {
    return tasks.find(t => t.id === editingTaskId) || null;
  }, [tasks, editingTaskId]);

  return (
    <div className="p-8 h-full flex flex-col gap-8 select-none">
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
            className="w-64 h-10 rounded-xl"
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
