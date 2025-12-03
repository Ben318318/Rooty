import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../test-utils";
import userEvent from "@testing-library/user-event";
import Auth from "./Auth";
import * as authContext from "../context/AuthContext";

// Mock the auth context
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();

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

describe("Auth Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (authContext.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      signIn: mockSignIn,
      signUp: mockSignUp,
    });
  });

  it("renders login form by default", () => {
    render(<Auth />);

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("switches to signup mode when clicking toggle", async () => {
    const user = userEvent.setup();
    render(<Auth />);

    const toggleButton = screen.getByText(/sign up/i);
    await user.click(toggleButton);

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("submits login form with email and password", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ error: null });

    render(<Auth />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  it("submits signup form with all fields", async () => {
    const user = userEvent.setup();
    mockSignUp.mockResolvedValue({ error: null });

    render(<Auth />);

    // Switch to signup mode
    const toggleButton = screen.getByText(/sign up/i);
    await user.click(toggleButton);

    const displayNameInput = screen.getByLabelText("Display Name");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    await user.type(displayNameInput, "Test User");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
        "Test User"
      );
    });
  });

  it("displays error message on login failure", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({
      error: { message: "Invalid credentials" },
    });

    render(<Auth />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("displays error message on signup failure", async () => {
    const user = userEvent.setup();
    mockSignUp.mockResolvedValue({
      error: { message: "Email already exists" },
    });

    render(<Auth />);

    // Switch to signup mode
    const toggleButton = screen.getByText(/sign up/i);
    await user.click(toggleButton);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    await user.type(emailInput, "existing@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });
  });

  it("navigates to /learn on successful login", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ error: null });

    render(<Auth />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/learn");
    });
  });

  it("disables submit button when form is invalid", () => {
    render(<Auth />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when form is valid", async () => {
    const user = userEvent.setup();
    render(<Auth />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    expect(submitButton).not.toBeDisabled();
  });
});

