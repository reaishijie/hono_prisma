import { getDb } from "../db";
import type { ChatRequest } from "../types/chat";
import { requestChatCompletion } from "../client/ai.client";

export const chatService = {
    async chat(data: ChatRequest) {
        const db = getDb()
        const model = await db.models.findFirst({
            where: {
                modelName: data.modelName
            },
            include: {
                channel: true
            }
        })

        if (!model) {
            throw new Error(`模型不存在: ${data.modelName}`)
        }

        const messages = data.messages ?? [
            {
                role: 'user' as const,
                content: data.message!
            }
        ]

        const res = await requestChatCompletion({
            baseUrl: model.channel.baseUrl,
            apiKey: model.channel.key,
            model: model.modelName,
            messages,
            stream: data.stream,
            extra_body: data.extra_body
        })

        return res
    }
} 