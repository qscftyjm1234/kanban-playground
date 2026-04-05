import React from 'react';
import { cn } from '../../lib/utils';
import { LayoutPanelLeft, Plus, Trash2, Pencil } from 'lucide-react';
import logoImg from '../../assets/logo.jpg';
import { Modal, Input, message } from 'antd';
import useTaskStore from '../../store/useTaskStore';

export default function Sidebar({ isDarkMode }) {
  const { 
    boards, 
    selectedBoardId, 
    selectBoard, 
    createBoard,
    updateBoard,
    deleteBoard
  } = useTaskStore();
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalType, setModalType] = React.useState('create'); // 'create' | 'edit'
  const [targetBoard, setTargetBoard] = React.useState(null);
  const [newTitle, setNewTitle] = React.useState('');

  const handleOpenCreate = () => {
    setModalType('create');
    setTargetBoard(null);
    setNewTitle('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e, board) => {
    e.stopPropagation();
    setModalType('edit');
    setTargetBoard(board);
    setNewTitle(board.title);
    setIsModalOpen(true);
  };

  const handleDelete = (e, boardId) => {
    e.stopPropagation();
    Modal.confirm({
      title: '確定要刪除此看板嗎？',
      content: '刪除看板將會連同其中的所有代辦事項一併移除，且無法復原。',
      okText: '確定刪除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await deleteBoard(boardId);
        message.success('已刪除看板');
      },
    });
  };

  const handleSubmit = async () => {
    if (!newTitle.trim()) return;
    
    if (modalType === 'create') {
      await createBoard(newTitle);
      message.success('已建立新看板');
    } else {
      await updateBoard(targetBoard.id, newTitle);
      message.success('已更新看板名稱');
    }
    
    setNewTitle('');
    setIsModalOpen(false);
  };

  return (
    <aside className={cn(
      "w-72 border-r transition-all duration-300 flex flex-col",
      {
        "bg-slate-900 border-slate-800 text-white": isDarkMode,
        "bg-slate-50 border-slate-200 text-slate-800": !isDarkMode
      }
    )}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10 overflow-hidden p-0.5">
            <img src={logoImg} alt="Company Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">我的看板</h1>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <nav className="mt-2 px-4 flex-1 overflow-y-auto space-y-1">
        {boards.map((board) => (
          <div
            key={board.id}
            onClick={() => selectBoard(board.id)}
            className={cn(
              "group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-left cursor-pointer",
              {
                "bg-blue-600 text-white shadow-md": selectedBoardId === board.id,
                "hover:bg-slate-200": selectedBoardId !== board.id && !isDarkMode,
                "hover:bg-slate-800": selectedBoardId !== board.id && isDarkMode,
                "text-slate-500": selectedBoardId !== board.id
              }
            )}
          >
            <div className="flex items-center gap-3 truncate">
              <div 
                className="w-2 h-2 rounded-full shrink-0" 
                style={{ backgroundColor: board.color || '#3b82f6' }}
              />
              <span className="truncate">{board.title}</span>
            </div>
            
            {/* 操作按鈕 - 僅在 Hover 或選中時顯示部分 (或直接顯示) */}
            <div className={cn(
              "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
              { "opacity-100": selectedBoardId === board.id }
            )}>
              <button 
                onClick={(e) => handleOpenEdit(e, board)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => handleDelete(e, board.id)}
                className="p-1 hover:bg-white/20 rounded transition-colors text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </nav>

      {/* 看板 Modal (建立/編輯) */}
      <Modal
        title={modalType === 'create' ? "建立新看板" : "編輯看板名稱"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText={modalType === 'create' ? "建立" : "儲存"}
        cancelText="取消"
      >
        <Input 
          placeholder="輸入看板名稱..." 
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onPressEnter={handleSubmit}
          autoFocus
        />
      </Modal>
    </aside>
  );
}
