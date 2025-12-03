import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../test-utils";
import Session from "./Session";
import * as api from "../lib/api";
import * as authContext from "../context/AuthContext";
import * as challenges from "../lib/challenges";

// Mock API functions
vi.mock("../lib/api", () => ({
  getSession: vi.fn(),
  getWordSession: vi.fn(),
  submitAttempt: vi.fn(),
  submitWordAttempt: vi.fn(),
}));

// Mock challenges
vi.mock("../lib/challenges", () => ({
  markChallengeComplete: vi.fn(),
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
    useSearchParams: () => [
      new URLSearchParams("?theme=1&challenge=1"),
    ],
  };
});

describe("Session Page", () => {
  const mockWordRoots = [
    {
      id: 1,
      english_word: "Christmas",
      component_roots: "Cristes mæsse",
      correct_meaning: "anointed one's mass",
      option_1: "jesuss party",
      option_2: "santa's birth",
      option_3: "anointed one's mass",
      option_4: "Turk bath",
      origin_lang: "Old English",
      source_title: "Etymonline",
      source_url: "https://www.etymonline.com/word/christmas",
      created_at: "2024-01-01",
    },
    {
      id: 2,
      english_word: "Advent",
      component_roots: "ad + venire",
      correct_meaning: "to come toward",
      option_1: "to come toward",
      option_2: "to shine from within",
      option_3: "to cry out loudly",
      option_4: "to give thanks secretly",
      origin_lang: "Latin",
      source_title: "Etymonline",
      source_url: "https://www.etymonline.com/word/advent",
      created_at: "2024-01-01",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (authContext.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: "user-123", email: "test@example.com" },
      isAdmin: false,
      loading: false,
    });
    (api.getWordSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockWordRoots,
      error: null,
    });
    (api.submitWordAttempt as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true },
      error: null,
    });
  });

  it("loads word quiz session on mount", async () => {
    render(<Session />);

    await waitFor(() => {
      expect(api.getWordSession).toHaveBeenCalledWith(1, 10);
    });
  });

  it("displays loading state initially", () => {
    (api.getWordSession as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<Session />);

    expect(screen.getByText("Loading quiz session...")).toBeInTheDocument();
  });

  it("displays error message when session fails to load", async () => {
    (api.getWordSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: new Error("Failed to load session"),
    });

    render(<Session />);

    await waitFor(() => {
      expect(screen.getByText("Error Loading Session")).toBeInTheDocument();
    });
  });

  it("redirects to auth when user is not authenticated", () => {
    (authContext.useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isAdmin: false,
      loading: false,
    });

    render(<Session />);

    expect(mockNavigate).toHaveBeenCalledWith("/auth");
  });

  it("displays quiz card when session loads", async () => {
    render(<Session />);

    await waitFor(() => {
      expect(screen.getByText("Quiz Session")).toBeInTheDocument();
    });
  });
});

