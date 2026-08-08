export const auth = jest.fn().mockResolvedValue({ userId: null, sessionId: null });
export const currentUser = jest.fn().mockResolvedValue(null);
export const clerkClient = {
  users: {
    getUser: jest.fn(),
    updateUser: jest.fn(),
  },
};
