import { prisma } from "@/lib/db";
import { runAutomationsForTrigger } from "@/lib/automation-engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// 1x1 transparent GIF
const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const msg = await prisma.emailMessage.findUnique({
      where: { trackToken: token },
      select: { id: true, ownerId: true, contactId: true, openedAt: true },
    });
    if (msg) {
      const firstOpen = !msg.openedAt;
      await prisma.emailMessage.update({
        where: { id: msg.id },
        data: { opens: { increment: 1 }, openedAt: msg.openedAt ?? new Date() },
      });
      if (firstOpen) {
        await runAutomationsForTrigger(msg.ownerId, "email_opened", {
          contactId: msg.contactId ?? undefined,
          emailOpened: true,
        });
      }
    }
  } catch {
    // tracking must never error visibly
  }

  return new Response(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(PIXEL.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
