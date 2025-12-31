import { storage, STORAGE_KEYS } from "@/utils/storage";

export function streamChat(guid: string, message: string, attachments: any[], onChunk: (type: string, text: string) => void): { result: Promise<void>, abort: () => void } {
    const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
    let runId: string | null = null;

    const abort = async () => {
        console.log("Abort called. RunID:", runId);
        if (runId) {
            try {
                // Call stop endpoint
                await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/agent-executions/stop/${runId}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                console.log("Stop request sent successfully");
            } catch (error) {
                console.error("Failed to stop execution:", error);
            }
        }
    };

    const result = (async () => {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/agent-executions/execute/${guid}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "text/event-stream"
            },
            body: JSON.stringify({ message, attachments })
        });

        if (!response.ok) {
            console.error("Streaming failed:", response.statusText);
            return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            /* 
             User requirement: "stop the response immediatly and then wait for the already genrated content to keep on coming"
             This implies we should NOT break here if aborted on client side only, but rather wait for the backend to close the stream.
             However, if we want to force stop on client side, we could. 
             Since we are calling the backend stop endpoint, the backend will close the stream shortly. 
             We just keep reading until done.
            */
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split("\n\n");
            // The last element might be incomplete, keep it in buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
                const eventLine = line.split("\n").find(l => l.startsWith("event: "));
                const dataLine = line.split("\n").find(l => l.startsWith("data: "));

                if (eventLine && dataLine) {
                    const type = eventLine.substring(7).trim();
                    const data = dataLine.substring(6); // Keep raw data

                    if (type === "metadata") {
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.run_id) {
                                runId = parsed.run_id;
                            }
                            onChunk(type, data);
                        } catch (e) {
                            console.error("Failed to parse metadata", e);
                        }
                    } else if (type === "complete") {
                        onChunk("complete", "");
                    } else {
                        onChunk(type, data);
                    }
                }
            }
        }
    })();

    return { result, abort };
}