import React, { useState } from 'react';
import KanbanCard from './KanbanCard';
import { cn } from '../../lib/utils';
import { MoreHorizontal } from 'lucide-react';
import useTaskStore from '../../store/useTaskStore';

/**
 * 任務狀態欄位 (原生 HTML5 Drag and Drop)
 */
export default function KanbanColumn({ columnId, title, color, tasks, isDarkMode, onEdit }) {
  const [isOver, setIsOver] = useState(false);
  const { moveTask } = useTaskStore();

  const colorMap = {
    blue: 'bg-blue-600',
    orange: 'bg-orange-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      moveTask(taskId, columnId);
    }
  };

  return (
    <div className={cn(
      "flex-shrink-0 w-80 h-fit rounded-[24px] border flex flex-col transition-all duration-300 backdrop-blur-md",
      { 
        "bg-slate-900 border-slate-800 shadow-xl shadow-slate-950/20": isDarkMode, 
        "bg-white border-slate-200 shadow-sm": !isDarkMode,
        "ring-2 ring-blue-500 scale-[1.02]": isOver
      }
    )}>
      {/* Column Header */}
      <div className="p-5 flex items-center justify-between border-b border-transparent">
        <div className="flex items-center gap-3">
          <div className={cn("w-2 h-6 rounded-full", colorMap[color])} />
          <h3 className="font-bold tracking-tight text-lg">{title}</h3>
          <span className={cn(
            "ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold transition-all",
            { "bg-slate-800 text-slate-400": isDarkMode, "bg-slate-100 text-slate-500": !isDarkMode }
          )}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "p-4 min-h-[400px] flex flex-col gap-4 transition-colors duration-200 no-scrollbar overflow-y-auto max-h-[calc(100vh-250px)] rounded-b-[24px]",
          { 
            "bg-blue-600/5": isOver && isDarkMode, 
            "bg-blue-50/50": isOver && !isDarkMode 
          }
        )}
      >
        {tasks.map((task, index) => (
          <KanbanCard
            key={task.id}
            task={task}
            index={index}
            isDarkMode={isDarkMode}
            onEdit={onEdit}
          />
        ))}
        {isOver && (
          <div className="border-2 border-dashed border-blue-400/30 rounded-[20px] h-24 animate-pulse" />
        )}
      </div>
    </div>
  );
}
