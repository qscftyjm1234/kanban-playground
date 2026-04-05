import React from 'react';
import useTaskStore from '../../store/useTaskStore';
import KanbanColumn from './KanbanColumn';
import { cn } from '../../lib/utils';

const COLUMNS = [
  { id: 'TODO', title: '待處理 (To Do)', color: 'blue' },
  { id: 'IN_PROGRESS', title: '進行中 (In Progress)', color: 'orange' },
  { id: 'IN_REVIEW', title: '待驗收 (In Review)', color: 'purple' },
  { id: 'DONE', title: '已完成 (Done)', color: 'green' },
];

/**
 * 看板容器組件
 * 整合四大欄位 (已切換為原生 HTML5 Drag and Drop)
 */
export default function KanbanBoard({ tasks, isDarkMode, onEdit }) {
  // 移除元件內部的 fetchTasks 邏輯，由 Page 分發資料

  return (
    <div className={cn(
      "flex gap-6 h-full pb-6 overflow-x-auto overflow-y-hidden no-scrollbar items-start",
    )}>
      {COLUMNS.map((col) => {
        const columnTasks = tasks
          .filter((t) => t.status === col.id)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        return (
          <KanbanColumn
            key={col.id}
            columnId={col.id}
            title={col.title}
            color={col.color}
            tasks={columnTasks}
            isDarkMode={isDarkMode}
            onEdit={col.id !== 'DONE' ? onEdit : null}
          />
        );
      })}
    </div>
  );
}
