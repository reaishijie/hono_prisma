interface ChatCompletionParams {
    baseUrl: string
    apiKey: string
    model: string
    extra_body?: Record<string, unknown>
    messages: {
        role: 'user' | 'assistant' | 'system'
        content: string
    }[]
    stream?: boolean
}

function normalizeExtraBody(extraBody?: Record<string, unknown>) {
    if (!extraBody) {
        return undefined
    }

    const normalized = { ...extraBody }
    const thinking = normalized.thinking

    if (thinking && typeof thinking === 'object' && !Array.isArray(thinking)) {
        const thinkingConfig = { ...(thinking as Record<string, unknown>) }

        if (thinkingConfig.type === 'enable') {
            thinkingConfig.type = 'enabled'
        }

        if (thinkingConfig.type === 'disable') {
            thinkingConfig.type = 'disabled'
        }

        normalized.thinking = thinkingConfig
    }

    return normalized
}

export async function requestChatCompletion(params: ChatCompletionParams) {
    const stream = params.stream ?? false
    const baseUrl = params.baseUrl.replace(/\/$/, '')

    const requestBody: Record<string, unknown> = {
        model: params.model,
        messages: params.messages,
        stream,
        ...normalizeExtraBody(params.extra_body),
    }

    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${params.apiKey}`
        },
        body: JSON.stringify(requestBody)
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(`AI 请求失败: ${res.status} ${text}`)
    }

    if (stream) {
        return res
    }

    return await res.json()
}