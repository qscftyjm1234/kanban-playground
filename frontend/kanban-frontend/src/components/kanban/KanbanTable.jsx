import React from 'react';
import { Table, Tag, Button, Space, Popconfirm, Tooltip } from 'antd';
import { Edit2, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * 看板表格視圖 (Ant Design Table)
 */
export default function KanbanTable({ tasks, onEdit, onDelete, isDarkMode }) {
  const statusMap = {
    TODO: { color: 'blue', label: '待處理' },
    IN_PROGRESS: { color: 'orange', label: '進行中' },
    IN_REVIEW: { color: 'purple', label: '待驗收' },
    DONE: { color: 'green', label: '已完成' },
  };

  const columns = [
    {
      title: '待辦事項',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <span 
          className="font-bold cursor-pointer hover:text-blue-500 transition-colors"
          onClick={() => onEdit(record)}
        >
          {text}
        </span>
      ),
    },
    {
      title: '目前狀態',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={statusMap[status]?.color || 'default'}>
          {statusMap[status]?.label || status}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (desc) => (
        <Tooltip placement="topLeft" title={desc}>
          <span className="opacity-70 text-xs">{desc || '無描述'}</span>
        </Tooltip>
      ),
    },
    {
      title: '建立日期',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => (
        <span className="text-[12px] opacity-60">
          {new Intl.DateTimeFormat('zh-TW', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }).format(new Date(date))}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="編輯">
            <Button 
              type="text" 
              icon={<Edit2 className="w-4 h-4 text-blue-500" />} 
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="刪除">
            <Popconfirm
              title="確定要刪除此待辦事項嗎？"
              onConfirm={() => onDelete(record.id)}
              okText="確定"
              cancelText="取消"
            >
              <Button 
                type="text" 
                danger
                icon={<Trash2 className="w-4 h-4" />} 
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden p-2 transition-all duration-300",
      {
        "bg-slate-900 border-slate-800": isDarkMode,
        "bg-white border-slate-200 shadow-sm": !isDarkMode
      }
    )}>
      <Table 
        columns={columns} 
        dataSource={tasks} 
        rowKey="id"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: false,
          hideOnSinglePage: true 
        }}
        className={cn({ "dark-antd-table": isDarkMode })}
        locale={{ emptyText: '暫無待辦事項' }}
      />
    </div>
  );
}
