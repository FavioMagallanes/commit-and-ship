import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ConversationResult } from "@/features/conversation/api/get-conversation-statuses";
import { Conversation } from "@/features/conversation/components/conversation";
import type { MastodonStatus } from "@/features/conversation/model/mastodon-status";

const NOW = new Date("2026-10-10T12:00:00.000Z");

const status = (acct: string, favourites: number): MastodonStatus => ({
  id: `id-${acct}`,
  url: `https://mastodon.social/@${acct}/1`,
  created_at: "2026-10-10T10:00:00.000Z",
  content: `<p>Post de ${acct} sobre arquitectura de software &amp; equipos chicos.</p>`,
  language: "es",
  sensitive: false,
  spoiler_text: "",
  in_reply_to_id: null,
  reblog: null,
  favourites_count: favourites,
  reblogs_count: 0,
  account: { acct, bot: false, url: `https://mastodon.social/@${acct}` },
});

const loadStatuses = vi.fn<() => Promise<ConversationResult>>();
const mockStatuses = (statuses: MastodonStatus[]) =>
  loadStatuses.mockResolvedValueOnce({
    status: "ok",
    statuses,
    fetchedAt: "2026-10-10T11:00:00.000Z",
  });

describe("Conversation", () => {
  it("lists the top three posts under a named section, best first", async () => {
    mockStatuses([status("ana", 1), status("beto", 9), status("carla", 5), status("dani", 0)]);

    render(await Conversation({ loadStatuses, now: NOW }));

    const section = screen.getByRole("region", { name: "En conversación" });
    const items = within(section).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(within(items[0]!).getByText("@beto")).toBeInTheDocument();
    expect(within(items[0]!).getByText("· Mastodon")).toBeInTheDocument();
    const link = within(items[0]!).getByRole("link", {
      name: "Post de beto sobre arquitectura de software & equipos chicos.",
    });
    expect(link).toHaveAttribute("href", "https://mastodon.social/@beto/1");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows an error banner, not an empty list, when Mastodon fails", async () => {
    loadStatuses.mockRejectedValueOnce(new Error("boom"));

    render(await Conversation({ loadStatuses, now: NOW }));

    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar las conversaciones");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "El resto de las fuentes funciona con normalidad.",
    );
    expect(screen.getByRole("alert")).toContainElement(
      screen.getByRole("button", { name: "Reintentar" }),
    );
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("shows saved posts under a banner, inside the card, when Mastodon fails", async () => {
    loadStatuses.mockResolvedValueOnce({
      status: "error",
      fetchedAt: "2026-10-10T11:59:00.000Z",
      stale: { statuses: [status("ana", 1)], savedAt: "2026-10-10T09:00:00.000Z" },
    });

    render(await Conversation({ loadStatuses, now: NOW }));

    const section = screen.getByRole("region", { name: "En conversación" });
    const banner = within(section).getByRole("alert");
    expect(banner).toHaveTextContent("No pudimos actualizar las conversaciones");
    expect(banner).toHaveTextContent("Mostramos contenido guardado de hace 3 h");
    expect(banner).toContainElement(screen.getByRole("button", { name: "Reintentar" }));
    const item = within(section).getByRole("listitem");
    expect(banner.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(item).getByText("@ana")).toBeInTheDocument();
  });

  it("shows only the error banner when Mastodon fails with nothing saved", async () => {
    loadStatuses.mockResolvedValueOnce({ status: "error", fetchedAt: "2026-10-10T11:59:00.000Z" });

    render(await Conversation({ loadStatuses, now: NOW }));

    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar las conversaciones");
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("says so when no post is worth showing", async () => {
    mockStatuses([{ ...status("ana", 1), sensitive: true }]);

    render(await Conversation({ loadStatuses, now: NOW }));

    expect(screen.getByText("Todavía no hay conversaciones para mostrar.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
