import type { ContactInfo } from "@/lib/types";
import { ContactActionBar } from "@/components/ui/ContactActionBar";

export function ContactDisplay({
  contact,
  compact = false,
}: {
  contact: ContactInfo;
  compact?: boolean;
}) {
  return (
    <ContactActionBar
      contact={contact}
      compact={compact}
      showPreferredHint={!compact}
    />
  );
}
