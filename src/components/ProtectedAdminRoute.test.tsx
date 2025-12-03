import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../test-utils";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import * as authContext from "../context/AuthContext";

// Mock the auth context
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ProtectedAdminRoute", () => {
  const mockChildren = <div data-testid="protected-content">Protected Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users to /auth", async () => {
    (authContext.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isAdmin: false,
      loading: false,
    });

    render(<ProtectedAdminRoute>{mockChildren}</ProtectedAdminRoute>);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/auth");
    });

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("redirects non-admin users to /auth", async () => {
    (authContext.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "user-123", email: "user@example.com" },
      isAdmin: false,
      loading: false,
    });

    render(<ProtectedAdminRoute>{mockChildren}</ProtectedAdminRoute>);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/auth");
    });

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("allows admin users to access protected content", async () => {
    (authContext.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "admin-123", email: "admin@example.com" },
      isAdmin: true,
      loading: false,
    });

    render(<ProtectedAdminRoute>{mockChildren}</ProtectedAdminRoute>);

    await waitFor(() => {
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows loading state while checking authentication", () => {
    (authContext.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isAdmin: false,
      loading: true,
    });

    render(<ProtectedAdminRoute>{mockChildren}</ProtectedAdminRoute>);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not redirect while loading", () => {
    (authContext.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isAdmin: false,
      loading: true,
    });

    render(<ProtectedAdminRoute>{mockChildren}</ProtectedAdminRoute>);

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
