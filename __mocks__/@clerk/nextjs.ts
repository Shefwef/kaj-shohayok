export const auth = jest.fn().mockResolvedValue({ userId: null });
export const currentUser = jest.fn().mockResolvedValue(null);
export const ClerkProvider = ({ children }: { children: React.ReactNode }) => children;
export const useAuth = jest.fn().mockReturnValue({ userId: null, isLoaded: true });
export const useUser = jest.fn().mockReturnValue({ user: null, isLoaded: true });
export const SignInButton = () => null;
export const SignUpButton = () => null;
export const UserButton = () => null;
