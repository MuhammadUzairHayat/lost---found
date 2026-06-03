import { ProfileLink } from "@/components/ui/ProfileLink";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { Hand } from "@/lib/types";

export function HandRaisedCard({
  hand,
  highlight,
}: {
  hand: Hand;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight ? "border-ink bg-ink/5" : "border-line"
      }`}
    >
      <div className="flex items-start gap-3">
        <UserAvatar
          name={hand.userName}
          avatar={hand.userAvatar}
          size="xs"
          userId={hand.userId}
          linkToProfile
        />
        <div className="min-w-0 flex-1">
          <ProfileLink
            userId={hand.userId}
            name={hand.userName}
            className="text-sm font-medium text-ink"
          />
          <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-mute">
            {hand.studentId && <span>ID {hand.studentId}</span>}
            {hand.department && <span>{hand.department}</span>}
          </div>
          {hand.note ? (
            <p className="mt-2 text-xs leading-relaxed text-body">{hand.note}</p>
          ) : (
            <p className="mt-2 text-xs text-subtle italic">
              No description provided.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
