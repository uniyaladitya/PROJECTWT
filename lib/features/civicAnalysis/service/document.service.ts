import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/api.error";

async function assertDocumentOwner(documentId: string, userId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { conversation: { select: { userId: true } } },
  });

  if (!document) throw new ApiError(404, "Document not found");
  if (document.conversation.userId !== userId) throw new ApiError(403, "Forbidden");
  return document;
}

export class DocumentService {
  static async create(userId: string, conversationId: string, file: File) {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new ApiError(404, "Conversation not found");
    if (conversation.userId !== userId) throw new ApiError(403, "Forbidden");

    return prisma.document.create({
      data: {
        documentName: file.name,
        fileUrl: `metadata://${conversationId}/${encodeURIComponent(file.name)}`,
        conversationId,
      },
    });
  }

  static async getOwned(documentId: string, userId: string) {
    return assertDocumentOwner(documentId, userId);
  }

  static async analyze(documentId: string, userId: string) {
    await assertDocumentOwner(documentId, userId);
    return {
      documentId,
      status: "pending" as const,
      message: "Document analysis is scheduled for the next RAG phase.",
    };
  }
}
