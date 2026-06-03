import type { HandMessage, HandMessageWithReplies } from "@/lib/types";

export function buildHandMessageTree(
  messages: HandMessage[]
): HandMessageWithReplies[] {
  const map = new Map<string, HandMessageWithReplies>();

  for (const message of messages) {
    map.set(message.id, { ...message, replies: [] });
  }

  const roots: HandMessageWithReplies[] = [];

  for (const message of messages) {
    const node = map.get(message.id)!;
    if (message.parentId) {
      map.get(message.parentId)?.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortByDate = (a: HandMessageWithReplies, b: HandMessageWithReplies) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

  const sortTree = (nodes: HandMessageWithReplies[]) => {
    nodes.sort(sortByDate);
    for (const node of nodes) {
      sortTree(node.replies);
    }
  };

  sortTree(roots);
  return roots;
}
