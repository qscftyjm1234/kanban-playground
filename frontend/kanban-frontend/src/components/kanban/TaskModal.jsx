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
    } else {
      form.resetFields();
      form.setFieldsValue({ status: 'TODO' });
    }
  }, [open, taskId, task, form, fetchLabels]);

  const onFinish = async (values) => {
    const { labelIds, ...rest } = values;
    const selectedLabels = labelIds?.map(id => ({ id })) || [];

    if (task) {
      await updateTask(task.id, { 
        ...rest, 
        labels: selectedLabels,
        checklistItems: []
      });
    } else {
      await addTask(values.title, values.description, values.status, selectedLabels, []);
    }
    onCancel();
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
