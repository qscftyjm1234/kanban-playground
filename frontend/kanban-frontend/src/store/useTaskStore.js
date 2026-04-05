import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

import taskApi from '../api/taskApi';

/**
 * 任務狀態管理 (Zustand)
 * 接軌後端 API，實現資料持久化
 */
const useTaskStore = create((set, get) => ({
  tasks: [],
  boards: [],
  labels: [],
  selectedBoardId: null,
  isLoading: false,

  // --- 看板管理 ---
  fetchBoards: async () => {
    try {
      const res = await taskApi.getBoards();
      set({ boards: res });
      // 如果還沒選擇看板，預設選第一個
      if (!get().selectedBoardId && res.length > 0) {
        get().selectBoard(res[0].id);
      }
    } catch (error) {
      console.error('獲取看板失敗', error);
    }
  },

  fetchLabels: async () => {
    try {
      const res = await taskApi.getLabels();
      set({ labels: res });
    } catch (error) {
      console.error('獲取標籤失敗', error);
    }
  },

  selectBoard: (boardId) => {
    set({ selectedBoardId: boardId });
    get().fetchTasks();
  },

  createBoard: async (title) => {
    try {
      const res = await taskApi.createBoard({ title });
      set((state) => ({ boards: [...state.boards, res] }));
      return res;
    } catch (error) {
      console.error('建立看板失敗', error);
    }
  },
  
  updateBoard: async (id, title) => {
    try {
      await taskApi.updateBoard(id, { id, title });
      set((state) => ({
        boards: state.boards.map(b => b.id === id ? { ...b, title } : b)
      }));
    } catch (error) {
      console.error('更新看板失敗', error);
    }
  },

  deleteBoard: async (id) => {
    try {
      await taskApi.deleteBoard(id);
      const { selectedBoardId, boards, selectBoard } = get();
      const newBoards = boards.filter(b => b.id !== id);
      set({ boards: newBoards });
      
      // 如果刪除的是目前選中的，則切換到第一個
      if (selectedBoardId === id) {
        if (newBoards.length > 0) {
          selectBoard(newBoards[0].id);
        } else {
          set({ selectedBoardId: null, tasks: [] });
        }
      }
    } catch (error) {
      console.error('刪除看板失敗', error);
    }
  },

  // --- 任務管理 ---
  // 從 API 讀取特定看板的所有任務
  fetchTasks: async () => {
    const boardId = get().selectedBoardId;
    set({ isLoading: true });
    try {
      const res = await taskApi.getAll(boardId);
      set({ tasks: res });
    } catch (error) {
      console.error('獲取任務失敗', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 新增任務 (歸屬於目前看板)
  addTask: async (title, description, status = 'TODO', selectedLabels = [], checklistItems = []) => {
    try {
      const newTask = {
        title,
        description,
        status,
        boardId: get().selectedBoardId,
        sortOrder: get().tasks.filter(t => t.status === status).length,
        labels: selectedLabels,
        checklistItems
      };
      const res = await taskApi.create(newTask);
      set((state) => ({ tasks: [...state.tasks, res] }));
      return res;
    } catch (error) {
      console.error('新增任務失敗', error);
    }
  },

  // --- 子任務管理 ---
  addChecklistItem: async (taskId, title) => {
    try {
      const res = await taskApi.addChecklistItem(taskId, { title });
      set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { ...t, checklistItems: [...(t.checklistItems || []), res] } 
            : t
        )
      }));
    } catch (error) {
      console.error('新增子任務失敗', error);
    }
  },

  toggleChecklistItem: async (taskId, itemId, isCompleted) => {
    try {
      await taskApi.toggleChecklistItem(itemId, isCompleted);
      set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                checklistItems: t.checklistItems.map(item => 
                  item.id === itemId ? { ...item, isCompleted } : item
                ) 
              } 
            : t
        )
      }));
    } catch (error) {
      console.error('更新子任務失敗', error);
    }
  },

  // (其餘 moveTask, updateTask, deleteTask 保持不變，但應確保資料同步)
  moveTask: async (taskId, newStatus) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return;

    const originalTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.map((t) => 
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    }));

    try {
      await taskApi.updatePosition(taskId, {
        status: newStatus,
        sortOrder: get().tasks.filter(t => t.status === newStatus).length
      });
    } catch (error) {
      console.error('同步位置失敗，正在回滾', error);
      set({ tasks: originalTasks });
    }
  },

  updateTask: async (taskId, updates) => {
    const originalTasks = get().tasks;
    const task = originalTasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, ...updates };

    try {
      await taskApi.update(taskId, updatedTask);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t))
      }));
    } catch (error) {
      console.error('更新任務失敗', error);
    }
  },

  deleteTask: async (taskId) => {
    try {
      await taskApi.delete(taskId);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId)
      }));
    } catch (error) {
      console.error('刪除任務失敗', error);
    }
  },
}));

export default useTaskStore;
