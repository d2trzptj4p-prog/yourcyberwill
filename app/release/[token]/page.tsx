import { ReleaseVaultViewer } from "@/components/release/release-vault-viewer";

type PageProps = { params: Promise<{ token: string }> };

export default async function ReleaseVaultPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Released vault access
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This link was shared because a scheduled check-in was missed.
        </p>
      </header>
      <ReleaseVaultViewer token={token} />
    </div>
  );
}
