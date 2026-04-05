import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { ListTodo, Calendar, User, MessageCircle, MoreHorizontal } from 'lucide-react';
import { Tag as AntdTag, Dropdown, Popconfirm, Progress } from 'antd';
import useTaskStore from '../../store/useTaskStore';

/**
 * 單一任務卡片 (原生 HTML5 Drag and Drop)
 */
export default function KanbanCard({ task, index, isDarkMode, onEdit }) {
  const [isDragging, setIsDragging] = useState(false);
  const { deleteTask } = useTaskStore();

  const completedCount = task.checklistItems?.filter(i => i.isCompleted).length || 0;
  const totalCount = task.checklistItems?.length || 0;

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onEdit && onEdit(task)}
      className={cn(
        "group p-5 rounded-[20px] border transition-all duration-200 cursor-grab active:cursor-grabbing",
        {
          "bg-slate-800/80 border-slate-700 shadow-xl": isDarkMode && !isDragging,
          "bg-white border-slate-200 shadow-md hover:shadow-lg": !isDarkMode && !isDragging,
          "opacity-40 scale-95 border-blue-500 border-2 border-dashed": isDragging,
          "hover:border-blue-400/50": !isDragging
        }
      )}
    >
      <div className="flex flex-col gap-3 relative">
        {/* Labels */}
        {task.labels?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {task.labels.map(label => (
              <div 
                key={label.id}
                className="px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider text-white shadow-sm border border-black/5"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </div>
            ))}
          </div>
        )}

        {/* Actions Button */}
        <div 
          className="absolute right-[-10px] top-[-10px] z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'delete',
                  danger: true,
                  label: (
                    <Popconfirm
                      title="確定要刪除此待辦事項嗎？"
                      onConfirm={() => {
                        deleteTask(task.id);
                      }}
                      onCancel={(e) => e.stopPropagation()}
                      okText="確定"
                      cancelText="取消"
                      placement="left"
                    >
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                         刪除待辦事項
                      </div>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <button className={cn(
              "p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-100",
              { "hover:bg-slate-700": isDarkMode }
            )}>
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </button>
          </Dropdown>
        </div>

        <div>
          <h4 className={cn(
            "font-bold text-[15px] leading-tight mb-1 group-hover:text-blue-500 transition-colors",
            {
              "text-white": isDarkMode,
              "text-slate-900": !isDarkMode
            }
          )}>
            {task.title}
          </h4>
          <p className={cn(
            "text-xs line-clamp-2 leading-relaxed opacity-70",
            { "text-slate-400": isDarkMode, "text-slate-500": !isDarkMode }
          )}>
            {task.description}
          </p>
        </div>

        {/* Progress Bar for Checklist */}
        {totalCount > 0 && (
          <div className="mt-1">
            <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] font-semibold opacity-50">執行進度</span>
               <span className="text-[10px] font-bold">{completedCount}/{totalCount}</span>
            </div>
            <Progress 
              percent={Math.round((completedCount / totalCount) * 100)} 
              showInfo={false} 
              size="small"
              strokeColor={isDarkMode ? '#3b82f6' : '#2563eb'}
              trailColor={isDarkMode ? '#1e293b' : '#f1f5f9'}
            />
          </div>
        )}

        <div className={cn(
          "pt-3 mt-1 border-t flex items-center justify-between",
          { "border-slate-700/50": isDarkMode, "border-slate-100": !isDarkMode }
        )}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[11px] font-medium opacity-60">
              <Calendar className="w-3 h-3" />
              <span>
                {new Intl.DateTimeFormat('zh-TW', { month: 'long', day: 'numeric' }).format(new Date(task.createdAt))}
              </span>
            </div>
            
            {totalCount > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-medium opacity-60">
                <ListTodo className="w-3 h-3" />
                <span>{completedCount}/{totalCount}</span>
              </div>
            )}
          </div>

          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
              <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
