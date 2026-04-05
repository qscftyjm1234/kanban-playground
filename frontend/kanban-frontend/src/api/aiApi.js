import axiosClient from './axiosClient';

const aiApi = {
  refineDescription: (description) => axiosClient.post('/AI/refine-description', { description }),
};

export default aiApi;
