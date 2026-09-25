import { Disclaimer } from "@/components/disclaimer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      {children}
      <footer className="mt-auto border-t border-hairline bg-white">
        <div className="mx-auto w-full max-w-3xl px-6 py-6">
          <Disclaimer variant="compact" />
        </div>
      </footer>
    </div>
  );
}
