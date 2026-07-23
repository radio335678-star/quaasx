import { redirect } from "next/navigation";

/** Legacy Hybrid Engine URL — keep bookmarks working. */
export default function CorpusRedirectPage() {
  redirect("/benchmark");
}
