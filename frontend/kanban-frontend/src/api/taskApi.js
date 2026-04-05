import axiosClient from './axiosClient';

/**
 * 待辦事項相關 API
 */
const taskApi = {
  // --- 看板 API ---
  getBoards: () => axiosClient.get('/boards'),
  createBoard: (data) => axiosClient.post('/boards', data),
  updateBoard: (id, data) => axiosClient.put(`/boards/${id}`, data),
  deleteBoard: (id) => axiosClient.delete(`/boards/${id}`),

  // --- 標籤 API ---
  getLabels: () => axiosClient.get('/labels'),
  createLabel: (data) => axiosClient.post('/labels', data),

  // --- 待辦事項 API ---
  // 獲取所有待辦事項 (可帶看板 ID 過濾)
  getAll: (boardId) => axiosClient.get('/tasks', { params: { boardId } }),

  // 新增待辦事項
  create: (taskData) => axiosClient.post('/tasks', taskData),

  // 更新待辦事項細節 (PUT)
  update: (id, taskData) => axiosClient.put(`/tasks/${id}`, taskData),

  // 更新位置/狀態 (PATCH)
  updatePosition: (id, positionData) => axiosClient.patch(`/tasks/${id}/position`, positionData),

  // 刪除任務
  delete: (id) => axiosClient.delete(`/tasks/${id}`),

  // --- 子任務 API ---
  addChecklistItem: (taskId, item) => axiosClient.post(`/tasks/${taskId}/checklist`, item),
  toggleChecklistItem: (itemId, isCompleted) => axiosClient.patch(`/tasks/checklist/${itemId}`, isCompleted),
};

export default taskApi;
