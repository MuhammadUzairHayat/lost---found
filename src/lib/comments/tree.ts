import type { Comment, CommentWithReplies } from "@/lib/types";

export function buildCommentTree(comments: Comment[]): CommentWithReplies[] {
  const map = new Map<string, CommentWithReplies>();

  for (const comment of comments) {
    map.set(comment.id, { ...comment, replies: [] });
  }

  const roots: CommentWithReplies[] = [];

  for (const comment of comments) {
    const node = map.get(comment.id)!;
    if (comment.parentId) {
      map.get(comment.parentId)?.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortByDate = (a: CommentWithReplies, b: CommentWithReplies) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

  const sortTree = (nodes: CommentWithReplies[]) => {
    nodes.sort(sortByDate);
    for (const node of nodes) {
      sortTree(node.replies);
    }
  };

  sortTree(roots);
  return roots;
}

export function flattenRecentComments(
  tree: CommentWithReplies[],
  limit: number
): Comment[] {
  const flat: Comment[] = [];

  const walk = (nodes: CommentWithReplies[]) => {
    for (const node of nodes) {
      if (flat.length >= limit) return;
      const { replies, ...comment } = node;
      flat.push(comment);
      if (replies.length > 0) walk(replies);
    }
  };

  walk([...tree].reverse());
  return flat.slice(0, limit);
}
