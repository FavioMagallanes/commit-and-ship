"use server";

import { updateTag } from "next/cache";

// The tag is fixed here, never taken from the client, so a request cannot expire other caches.
export const retryConversation = async (): Promise<void> => {
  updateTag("conversation");
};
