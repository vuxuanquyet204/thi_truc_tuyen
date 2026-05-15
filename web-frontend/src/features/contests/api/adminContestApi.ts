// Placeholder - adminContestApi will be created when backend integration is ready
// This file will contain the admin API client for contest management
export const adminContestApi = {
  // TODO: Implement when backend API is ready
  async getAll() { throw new Error('Not implemented'); },
  async getById(id: string) { throw new Error('Not implemented'); },
  async create(data: any) { throw new Error('Not implemented'); },
  async update(id: string, data: any) { throw new Error('Not implemented'); },
  async delete(id: string) { throw new Error('Not implemented'); },
  async getParticipants(contestId: string) { throw new Error('Not implemented'); },
  async approveParticipant(contestId: string, participantId: string) { throw new Error('Not implemented'); },
  async rejectParticipant(contestId: string, participantId: string) { throw new Error('Not implemented'); },
  async getStats() { throw new Error('Not implemented'); },
  async exportResults(contestId: string) { throw new Error('Not implemented'); },
};

export default adminContestApi;
