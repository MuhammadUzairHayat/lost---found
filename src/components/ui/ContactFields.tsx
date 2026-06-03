"use client";

import { CONTACT_METHODS } from "@/lib/constants/constants";
import type { ContactInfo } from "@/lib/types";
import type { ContactMethodId } from "@/lib/constants/constants";

export function ContactFields({
  contact,
  onChange,
}: {
  contact: ContactInfo;
  onChange: (contact: ContactInfo) => void;
}) {
  const setMethod = (method: ContactMethodId) =>
    onChange({ ...contact, method });

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="field-label uppercase tracking-wider mb-2">
          Preferred contact
        </legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`rounded-full px-3 py-1.5 text-xs border transition-colors ${
                contact.method === m.id
                  ? "bg-ink text-paper border-ink"
                  : "border-line text-body hover:border-ink/40"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-1">
        <label className="field-label">
          Phone
          <input
            type="tel"
            value={contact.phone}
            onChange={(e) =>
              onChange({ ...contact, phone: e.target.value })
            }
            className="field-input"
            placeholder="+1 555 000 0000"
          />
        </label>
        <label className="field-label">
          Email
          <input
            type="email"
            value={contact.email}
            onChange={(e) =>
              onChange({ ...contact, email: e.target.value })
            }
            className="field-input"
            placeholder="you@email.com"
          />
        </label>
        <label className="field-label">
          WhatsApp
          <input
            type="tel"
            value={contact.whatsapp}
            onChange={(e) =>
              onChange({ ...contact, whatsapp: e.target.value })
            }
            className="field-input"
            placeholder="+1 555 000 0000"
          />
        </label>
      </div>
    </div>
  );
}
