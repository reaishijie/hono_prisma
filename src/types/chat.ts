export type ChatMessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
    role: ChatMessageRole
    content: string
}

export interface ChatRequest {
    message?: string
    messages?: ChatMessage[]
    modelName: string
    userId?: number
    stream?: boolean
    extra_body?: {
        thinking?: {
            type: 'adaptive' | 'enabled' | 'disabled' | 'enable' | 'disable'
        }
        [key: string]: unknown
    }
}