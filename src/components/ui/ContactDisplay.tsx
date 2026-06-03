import { contactHref, primaryContactValue } from "@/lib/validation/participants";
import { contactMethodLabel } from "@/lib/constants/constants";
import type { ContactInfo } from "@/lib/types";

export function ContactDisplay({
  contact,
  compact = false,
}: {
  contact: ContactInfo;
  compact?: boolean;
}) {
  const href = contactHref(contact);
  const value = primaryContactValue(contact);
  const methodLabel = contactMethodLabel(contact.method);

  if (!value) {
    return (
      <span className="text-xs text-mute">No contact info provided</span>
    );
  }

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <p className="text-[10px] uppercase tracking-wider text-mute">
        Preferred: {methodLabel}
      </p>
      {href ? (
        <a
          href={href}
          target={contact.method === "whatsapp" ? "_blank" : undefined}
          rel={contact.method === "whatsapp" ? "noopener noreferrer" : undefined}
          className="block text-sm font-medium text-ink underline-offset-2 hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium">{value}</p>
      )}
      {!compact && (contact.phone || contact.email || contact.whatsapp) && (
        <ul className="mt-2 space-y-0.5 border-t border-line pt-2 text-xs text-mute">
          {contact.phone && (
            <li>
              Phone:{" "}
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-ink hover:underline">
                {contact.phone}
              </a>
            </li>
          )}
          {contact.email && (
            <li>
              Email:{" "}
              <a href={`mailto:${contact.email}`} className="text-ink hover:underline">
                {contact.email}
              </a>
            </li>
          )}
          {contact.whatsapp && (
            <li>
              WhatsApp:{" "}
              <a
                href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink hover:underline"
              >
                {contact.whatsapp}
              </a>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
