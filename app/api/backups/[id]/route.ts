import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBackup } from "@/lib/backups";

/** GET /api/backups/:id — downloads one config backup as a JSON file. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const backup = await getBackup(id);
  if (!backup) {
    return NextResponse.json({ error: "Backup not found" }, { status: 404 });
  }

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="lavamesh-backup-${backup.ts.slice(0, 10)}.json"`,
    },
  });
}
