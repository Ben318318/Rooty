import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "../test-utils";
import Home from "./Home";
import * as authContext from "../context/AuthContext";
import * as challenges from "../lib/challenges";

// Mock challenges
vi.mock("../lib/challenges", () => ({
  getChristmasThemeId: vi.fn(),
  getCompletedChallenges: vi.fn(),
  allChallengesComplete: vi.fn(),
}));

// Mock auth context
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
    useLocation: () => ({ pathname: "/" }),
  };
});

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (challenges.getChristmasThemeId as ReturnType<typeof vi.fn>).mockResolvedValue(1);
    (challenges.getCompletedChallenges as ReturnType<typeof vi.fn>).mockReturnValue(
      new Set()
    );
    (challenges.allChallengesComplete as ReturnType<typeof vi.fn>).mockReturnValue(
      false
    );
  });

  it("renders homepage title and description", () => {
    (authContext.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isAdmin: false,
      loading: false,
    });

    render(<Home />);

    expect(screen.getByText("🌱 Rooty")).toBeInTheDocument();
    expect(
      screen.getByText(/Learn Latin and Greek word roots through Christmas-themed quizzes/i)
    ).toBeInTheDocument();
  });

  it("displays daily challenge section for authenticated users", async () => {
    (authContext.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "user-123", email: "test@example.com" },
      isAdmin: false,
      loading: false,
    });

    render(<Home />);

    await screen.findByText("🎄 Daily Root Challenges – Christmas Special");
        expect(screen.getByText("Challenge 1 of 4")).toBeInTheDocument();
        expect(screen.getByText("Challenge 4 of 4")).toBeInTheDocument();
  });

  it("displays 4 challenge cards", async () => {
    (authContext.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "user-123", email: "test@example.com" },
      isAdmin: false,
      loading: false,
    });

    render(<Home />);

        await screen.findByText("Challenge 1 of 4");
        expect(screen.getByText("Challenge 1 of 4")).toBeInTheDocument();
        expect(screen.getByText("Challenge 2 of 4")).toBeInTheDocument();
        expect(screen.getByText("Challenge 3 of 4")).toBeInTheDocument();
        expect(screen.getByText("Challenge 4 of 4")).toBeInTheDocument();
  });

  it("shows completion message when all challenges are complete", async () => {
    (authContext.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "user-123", email: "test@example.com" },
      isAdmin: false,
      loading: false,
    });
    (challenges.allChallengesComplete as ReturnType<typeof vi.fn>).mockReturnValue(
      true
    );

    render(<Home />);

        await screen.findByText("You've finished today's 4 challenges!");
    expect(
      screen.getByText("Come back tomorrow for more!")
    ).toBeInTheDocument();
  });

  it("shows challenge status badges", async () => {
    (authContext.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "user-123", email: "test@example.com" },
      isAdmin: false,
      loading: false,
    });
    (challenges.getCompletedChallenges as ReturnType<typeof vi.fn>).mockReturnValue(
      new Set([1, 2])
    );

    render(<Home />);

        await screen.findByText("Challenge 1 of 4");
    // Should show completed status for challenges 1 and 2
    expect(screen.getAllByText("Completed ✅").length).toBeGreaterThan(0);
  });

  it("does not show daily challenges for unauthenticated users", () => {
    (authContext.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isAdmin: false,
      loading: false,
    });

    render(<Home />);

    expect(
      screen.queryByText("🎄 Daily Root Challenges – Christmas Special")
    ).not.toBeInTheDocument();
  });
});

