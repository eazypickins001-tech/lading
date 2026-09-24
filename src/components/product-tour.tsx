"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "lading_tour_dismissed";

const steps: { title: string; body: string }[] = [
  {
    title: "Welcome to Lading",
    body: "Capture a shipment once and let Lading handle the documents, requirements, and checks.",
  },
  {
    title: "Capture a shipment",
    body: "Add the corridor, mode, and line items. Every document is generated from this record.",
  },
  {
    title: "Know the required documents",
    body: "The requirements checker shows what a trade corridor needs before you ship.",
  },
  {
    title: "Check before you submit",
    body: "Consistency checks compare shipment data and flag issues so you fix them early.",
  },
];

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getSnapshot(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "true";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

function persistDismissed(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    return;
  }
}

export function ProductTour() {
  const storedVisible = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [dismissedNow, setDismissedNow] = useState(false);
  const [index, setIndex] = useState(0);

  const close = () => {
    persistDismissed();
    setDismissedNow(true);
  };

  const visible = storedVisible && !dismissedNow;

  useEffect(() => {
    if (!visible) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        persistDismissed();
        setDismissedNow(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  if (!visible) {
    return null;
  }

  const step = steps[index];
  const isLast = index === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-harbor/60 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-tour-title"
        className="w-full max-w-md rounded-xl border border-hairline bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Step {index + 1} of {steps.length}
          </span>
          <button
            type="button"
            onClick={close}
            className="text-xs font-medium text-muted hover:text-ink"
          >
            Skip
          </button>
        </div>

        <h2
          id="product-tour-title"
          className="mt-4 text-lg font-semibold text-deep-harbor"
        >
          {step.title}
        </h2>
        <p className="mt-2 text-sm text-muted">{step.body}</p>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
            disabled={index === 0}
            className="rounded-md border border-hairline px-4 py-2 text-sm font-medium text-ink hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={close}
              className="rounded-md bg-signal-teal px-5 py-2 text-sm font-medium text-white hover:bg-signal-teal/90"
            >
              Got it
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setIndex((value) => Math.min(steps.length - 1, value + 1))
              }
              className="rounded-md bg-signal-teal px-5 py-2 text-sm font-medium text-white hover:bg-signal-teal/90"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
