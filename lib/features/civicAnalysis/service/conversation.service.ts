import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/api.error";

async function assertConversationOwner(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) throw new ApiError(404, "Conversation not found");
  if (conversation.userId !== userId) throw new ApiError(403, "Forbidden");
  return conversation;
}

export class ConversationService {
  static async create(userId: string, title: string = "New Conversation") {
    return prisma.conversation.create({
      data: {
        userId,
        title,
      },
    });
  }

  static list(userId: string) {
    return prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true, documents: true } },
      },
    });
  }

  static async get(conversationId: string, userId: string) {
    await assertConversationOwner(conversationId, userId);
    return prisma.conversation.findUniqueOrThrow({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: "asc" } }, documents: true },
    });
  }

  static async updateTitle(conversationId: string, userId: string, title: string) {
    await assertConversationOwner(conversationId, userId);
    const cleanTitle = title.trim();
    if (!cleanTitle || cleanTitle.length > 120) {
      throw new ApiError(400, "Title must be between 1 and 120 characters");
    }
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { title: cleanTitle },
    });
  }

  static async delete(conversationId: string, userId: string) {
    await assertConversationOwner(conversationId, userId);
    await prisma.conversation.delete({ where: { id: conversationId } });
  }
}
