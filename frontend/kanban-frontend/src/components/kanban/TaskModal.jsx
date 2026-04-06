import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, Checkbox, Divider, message, Tag as AntdTag } from 'antd';
import { cn } from '../../lib/utils';
import { ListTodo, Plus, Tag as TagIcon, Sparkles, MoreHorizontal } from 'lucide-react';
import aiApi from '../../api/aiApi';
import useTaskStore from '../../store/useTaskStore';

/**
 * 任務編輯/新增 彈窗 - 專業版
 * 整合子任務管理與彩色標籤系統
 */
export default function TaskModal({ open, onCancel, taskId, isDarkMode }) {
  const [form] = Form.useForm();
  const {
    tasks,
    addTask,
    updateTask,
    labels,
    fetchLabels,
    addChecklistItem,
    toggleChecklistItem
  } = useTaskStore();

  // 從 Store 中尋找目前正在編輯的任務
  const task = tasks.find(t => t.id === taskId) || null;

  const [localChecklist, setLocalChecklist] = useState([]); // 統一用於彈窗內的「暫存」
  const [newItemTitle, setNewItemTitle] = useState('');

  // 初始化資料與表單
  useEffect(() => {
    if (!open) return;
    fetchLabels();

    if (task) {
      const labelIds = task.labels?.map(l => l.id) || [];
      form.setFieldsValue({
        ...task,
        labelIds
      });
      // 關鍵修復：編輯模式下，將現有子項目複製到緩衝區
      setLocalChecklist(task.checklistItems ? [...task.checklistItems] : []); 
    } else {
      form.resetFields();
      form.setFieldsValue({ status: 'TODO' });
      setLocalChecklist([]);
    }
  }, [open, taskId, task, form, fetchLabels]);

  const onFinish = async (values) => {
    const { labelIds, ...rest } = values;
    const selectedLabels = labelIds?.map(id => ({ id })) || [];

    // 統一從緩衝區提交子項目
    const checklistData = localChecklist.map(item => ({
      id: item.id && !item.id.toString().startsWith('local-') ? item.id : null,
      title: item.title,
      isCompleted: item.isCompleted || false
    }));

    if (task) {
      await updateTask(task.id, { 
        ...rest, 
        labels: selectedLabels,
        checklistItems: checklistData // 傳送完整清單執行 Diff Sync
      });
    } else {
      await addTask(values.title, values.description, values.status, selectedLabels, checklistData);
    }
    onCancel();
  };

  const handleAddCheckItem = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!newItemTitle.trim()) return;

    const title = newItemTitle.trim();
    setNewItemTitle(''); 

    // 不論新舊任務，統一加入緩衝區，暫不呼叫 API
    setLocalChecklist([...localChecklist, {
      id: `local-${Date.now()}`,
      title,
      isCompleted: false
    }]);
  };

  const handleToggleLocalItem = (id) => {
    setLocalChecklist(localChecklist.map(item =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    ));
  };

  const handleDeleteLocalItem = (id) => {
    setLocalChecklist(localChecklist.filter(item => item.id !== id));
  };

  // 統一輸入框與選擇器高度 (48px)
  const commonInputClass = cn(
    "h-12 rounded-xl text-base transition-all duration-300",
    isDarkMode
      ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
      : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 shadow-sm"
  );

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 py-1">
          <div className="w-2 h-6 bg-blue-500 rounded-full" />
          <span className={cn("text-xl font-bold tracking-tight", { "text-white": isDarkMode })}>
            {task ? '編輯待辦事項' : '新增待辦事項'}
          </span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={680}
      centered
      destroyOnClose
      styles={{
        mask: { backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.45)' },
        body: { padding: '24px 32px' },
      }}
      className={cn({ "dark-modal": isDarkMode })}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        className="space-y-5"
      >
        <Form.Item
          label={<span className={cn("font-bold text-sm uppercase tracking-wider", { "text-slate-500": isDarkMode, "text-slate-500/80": !isDarkMode })}>標題</span>}
          name="title"
          rules={[{ required: true, message: '請輸入標題' }]}
        >
          <Input placeholder="輸入待辦事項名稱..." className={commonInputClass} />
        </Form.Item>

        <div className="grid grid-cols-2 gap-6">
          <Form.Item
            label={<span className={cn("font-bold text-sm uppercase tracking-wider", { "text-slate-500": isDarkMode, "text-slate-500/80": !isDarkMode })}>目前狀態</span>}
            name="status"
          >
            <Select
              className={cn("w-full", commonInputClass, { "dark-select h-12": isDarkMode })}
              dropdownClassName={isDarkMode ? "dark-dropdown" : ""}
              options={[
                { value: 'TODO', label: '待處理 ' },
                { value: 'IN_PROGRESS', label: '進行中' },
                { value: 'IN_REVIEW', label: '待驗收' },
                { value: 'DONE', label: '已完成' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label={<span className={cn("font-bold text-sm uppercase tracking-wider", { "text-slate-500": isDarkMode, "text-slate-500/80": !isDarkMode })}>類別</span>}
            name="labelIds"
          >
            <Select
              mode="multiple"
              placeholder="指派類別..."
              className={cn("w-full", commonInputClass, { "dark-select h-12": isDarkMode })}
              tagRender={({ label, closable, onClose, value }) => {
                const labelData = labels.find(l => l.id === value);
                return (
                  <AntdTag
                    color={labelData?.color || 'blue'}
                    closable={closable}
                    onClose={onClose}
                    className="mr-1 rounded-md border-none font-bold"
                  >
                    {label}
                  </AntdTag>
                );
              }}
              options={labels.map(l => ({ label: l.name, value: l.id }))}
            />
          </Form.Item>
        </div>

        <Form.Item
          label={<span className={cn("font-bold text-sm uppercase tracking-wider", { "text-slate-500": isDarkMode, "text-slate-500/80": !isDarkMode })}>描述</span>}
          name="description"
        >
          <Input.TextArea
            placeholder="輸入詳細內容、連結或規格..."
            autoSize={{ minRows: 3, maxRows: 6 }}
            className={cn(commonInputClass, "py-3 min-h-[120px] leading-relaxed")}
          />
        </Form.Item>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-blue-500" />
              <span className={cn("font-bold text-base", { "text-white": isDarkMode })}>
                子項目清單
              </span>
              <AntdTag className="ml-1 opacity-60">
                {(task?.checklistItems?.length || 0) + localChecklist.length}
              </AntdTag>
            </div>
          </div>

          <div className="space-y-1 mb-4 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
            {localChecklist.map((item) => (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLocalItem(item.id);
                }}
                className={cn(
                  "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent hover:border-blue-500/30 hover:bg-blue-50/10 dark:hover:border-blue-500/30",
                  { "opacity-50 grayscale": item.isCompleted }
                )}
              >
                <Checkbox
                  checked={item.isCompleted}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleToggleLocalItem(item.id)}
                />
                <span className={cn("flex-1 text-sm font-bold", { "text-white": isDarkMode, "text-slate-900": !isDarkMode, "line-through opacity-40": item.isCompleted })}>
                  {item.title}
                </span>
                <Button
                  type="text"
                  size="small"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLocalItem(item.id);
                  }}
                  icon={<MoreHorizontal className="w-4 h-4 text-slate-400" />}
                />
              </div>
            ))}
            
            {localChecklist.length === 0 && (
              <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-slate-400 text-sm font-medium">尚無子項目</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="新增子項目後按 Enter..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onPressEnter={(e) => handleAddCheckItem(e)}
              className={cn(commonInputClass, "h-11 flex-1")}
            />
            <Button
              type="button"
              onClick={(e) => handleAddCheckItem(e)}
              icon={<Plus className="w-5 h-5 text-blue-600" />}
              className={cn(
                "h-11 w-11 flex items-center justify-center rounded-xl transition-all duration-300 border-2 shadow-sm",
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-blue-400 hover:border-blue-500 hover:text-blue-300"
                  : "bg-blue-50 border-blue-100 text-blue-600 hover:border-blue-500 hover:bg-blue-100"
              )}
            />
          </div>
        </div>

        <Divider className="my-8 opacity-40" />

        <div className="flex justify-end gap-4 pb-2">
          <Button
            type="button"
            onClick={onCancel}
            className={cn(
              "h-12 px-8 rounded-xl font-bold border-none transition-all",
              isDarkMode ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
          >
            取消
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="h-12 px-12 rounded-xl font-extrabold shadow-lg shadow-blue-500/20"
          >
            {task ? '儲存' : '建立待辦事項'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
