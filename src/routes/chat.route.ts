import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import { Logger } from "../utils/logger";
import { chatService } from "../services/chat.service";
import { ApiResponse } from "../core/response";

const chatApp = new Hono()
const logger = new Logger('chatController')

const chatMessageSchema = z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1, '消息内容不能为空'),
})

const thinkingSchema = z.object({
    type: z.enum(['adaptive', 'enabled', 'disabled', 'enable', 'disable']),
})

const extraBodySchema = z.object({
    thinking: thinkingSchema.optional(),
}).passthrough()

const chatSchema = z.object({
    message: z.string().min(1, '消息不能为空').optional(),
    messages: z.array(chatMessageSchema).min(1, '上下文消息不能为空').optional(),
    modelName: z.string().min(1, '模型名称不能为空'),
    userId: z.number().int().positive().optional(),
    stream: z.boolean().optional().default(false),
    extra_body: extraBodySchema.optional(),
}).refine((data) => data.message || data.messages, {
    message: 'message 和 messages 至少传一个',
    path: ['message'],
})

chatApp.post('', zValidator('json', chatSchema), async (c) => {
    const data = c.req.valid('json')
    const startTime = Date.now()

    logger.log(`收到聊天请求，模型：${data.modelName}，stream：${data.stream}`)

    const result = await chatService.chat(data)

    if (data.stream) {
        const aiResponse = result as Response

        if (!aiResponse.body) {
            throw new Error('AI 流式响应体为空')
        }

        const reader = aiResponse.body.getReader()
        let loggedFirstChunk = false

        const stream = new ReadableStream({
            async pull(controller) {
                const { done, value } = await reader.read()

                if (done) {
                    controller.close()
                    return
                }

                if (!loggedFirstChunk) {
                    loggedFirstChunk = true
                    logger.log(`首字响应耗时：${Date.now() - startTime}ms`)
                }

                controller.enqueue(value)
            },
            cancel() {
                reader.cancel()
            },
        })

        return new Response(stream, {
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })
    }

    logger.log(`非流式响应耗时：${Date.now() - startTime}ms`)

    return c.json(ApiResponse.success(result, '请求成功'))
})

export default chatApp
