import { docTypeLabel } from "@/lib/document-labels";
import type { RequiredDocument } from "@/lib/requirements";

function DocumentRow({ document }: { document: RequiredDocument }) {
  return (
    <li className="border-b border-hairline px-5 py-4 last:border-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-ink">
          {docTypeLabel(document.docType)}
        </span>
        {document.authority ? (
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            {document.authority}
          </span>
        ) : null}
      </div>
      {document.notes ? (
        <p className="mt-1 text-sm text-muted">{document.notes}</p>
      ) : null}
      {document.sourceUrl ? (
        <a
          href={document.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block text-xs font-medium text-signal-teal hover:underline"
        >
          Source
        </a>
      ) : null}
    </li>
  );
}

function Group({
  title,
  documents,
}: {
  title: string;
  documents: RequiredDocument[];
}) {
  if (documents.length === 0) {
    return null;
  }
  return (
    <div>
      <h3 className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-muted">
        {title}
      </h3>
      <ul className="border-t border-hairline">
        {documents.map((document) => (
          <DocumentRow key={document.docType} document={document} />
        ))}
      </ul>
    </div>
  );
}

export function RequiredDocumentsList({
  documents,
}: {
  documents: RequiredDocument[];
}) {
  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-hairline bg-cloud px-5 py-8 text-center">
        <p className="text-sm text-muted">
          No document rules are on file for this corridor yet.
        </p>
      </div>
    );
  }
  const required = documents.filter((document) => document.required);
  const conditional = documents.filter((document) => !document.required);
  return (
    <div className="overflow-hidden rounded-lg border border-hairline">
      <Group title="Required" documents={required} />
      <Group title="May apply (verify)" documents={conditional} />
    </div>
  );
}
