import Mermaid from "@/components/mermaid";
import { title } from "@/components/primitives";
import { appRoutes } from "@/config/site";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { useEffect } from "react";


const diagram26Nov2025 = `
graph TD
    START((START)) --> Router{needsPlanning?<br/>Model: gemini-2.0-flash-lite}
    
    %% Planning Phase
    Router -- "No Req / Empty" --> LLM[LLM Call <br/> Decision Node <br/> Model: gemini-2.5-flash-lite]
    Router -- COMPLEX --> Planning[Planning Node <br/> Model: gemini-2.5-flash-lite]
    Router -- SIMPLE --> LLM
    Planning --> LLM
    
    %% Main Execution Loop
    LLM --> Check{shouldContinue?}
    
    %% Branches from Decision
    Check -- "Msg > 12 OR <br/> Size > 200k & Msg > 5" --> Summarize[Summarize Node <br/> Model: gemini-2.0-flash-lite]
    Check -- "tool_call" --> Tool[Tool Node]
    Check -- "ready_to_reply" --> Final[Final Answer Node <br/> Model: gemini-2.5-flash-lite]
    Check -- "Steps >= 30 <br/> or No Msg" --> END((END))
    
    %% Tool Execution & Replanning
    Tool --> ReplanCheck{shouldReplan?}
    ReplanCheck -- "Success" --> LLM
    ReplanCheck -- "Failure >= 2 <br/> Loop Detected <br/> Steps >= 20" --> Replanner[Replanner Node <br/> Model: gemini-2.5-flash-lite]
    Replanner -- "New Plan" --> LLM
    
    %% Summarization Loop
    Summarize -- "Context Compressed" --> LLM
    
    %% Terminal States
    Final --> END
    
    %% Styling
    classDef plain fill:#000,stroke:#333,stroke-width:1px;
    classDef special fill:#000,stroke:#01579b,stroke-width:2px;
    classDef term fill:#000,stroke:#333,stroke-width:2px;
    
    class Planning,LLM,Tool,Replanner,Summarize,Final plain;
    class Router,Check,ReplanCheck special;
    class START,END term;
`;

const diagram31Nov2025 = `
graph TD
    START((START)) --> Router{needsPlanning?<br/>Model: gemini-2.0-flash-lite}

    %% Planning Phase & Research Loop
    Router -- "No Req / Empty" --> LLM[LLM Call <br/> Decision Node <br/> Model: gemini-2.5-flash-lite]
    Router -- COMPLEX --> Planning[Planning Node <br/> Model: gemini-2.5-flash-lite]
    Router -- SIMPLE --> LLM
    
    Planning -- "Ready to Plan" --> LLM
    Planning -- "Need Info (Research)" --> Tool[Tool Node]

    %% Main Execution Loop
    LLM --> Check{shouldContinue?}
    
    %% Branches from Decision
    Check -- "Msg > 12 OR <br/> Size > 200k & Msg > 5" --> Summarize[Summarize Node <br/> Model: gemini-2.0-flash-lite]
    Check -- "tool_call" --> Tool
    Check -- "ready_to_reply" --> Final[Final Answer Node <br/> Model: gemini-2.5-flash-lite]
    Check -- "Steps >= 30 <br/> or No Msg" --> END((END))
    
    %% Tool Execution & Replanning & Research Return
    Tool --> ReplanCheck{shouldReplan?}
    ReplanCheck -- "Researching (No Plan)" --> Planning
    ReplanCheck -- "Execution Success" --> LLM
    ReplanCheck -- "Failure >= 2 <br/> Loop Detected <br/> Steps >= 20" --> Replanner[Replanner Node <br/> Model: gemini-2.5-flash-lite]
    Replanner -- "New Plan" --> LLM
    
    %% Summarization Loop
    Summarize -- "Context Compressed" --> LLM
    
    %% Terminal States
    Final --> END
    
    %% Styling
    classDef plain fill:#000,stroke:#333,stroke-width:1px;
    classDef special fill:#000,stroke:#01579b,stroke-width:2px;
    classDef term fill:#000,stroke:#333,stroke-width:2px;
    
    class Planning,LLM,Tool,Replanner,Summarize,Final plain;
    class Router,Check,ReplanCheck special;
    class START,END term;
`;

export default function AgentArchitecturePage() {
    const adminRoute = appRoutes.find((route) => route.name === "Admin")?.children?.find((route) => route.name === "Admin Home");

    useEffect(() => {
        document.title = "Agent Architecture";
    }, []);

    return (
        <section className="flex flex-col items-center gap-6 py-8 px-8 md:py-10">
            <div className="w-full max-w-6xl px-4 flex flex-col gap-4">
                <h1 className={title()}>Agent Architecture</h1>
                <Breadcrumbs>
                    <BreadcrumbItem href={adminRoute?.path}>Admin</BreadcrumbItem>
                    <BreadcrumbItem>Agent Architecture</BreadcrumbItem>
                </Breadcrumbs>
            </div>
            <div className="w-full max-w-6xl px-2">
                <h4 className="text-lg font-semibold mb-4">Agent Design {"(26 Nov 2025)"}:</h4>
                <Mermaid chart={diagram26Nov2025} theme="dark" />
            </div>
            <div className="w-full max-w-6xl px-2">
                <h4 className="text-lg font-semibold mb-4">Agent Design {"(31 Nov 2025)"}:</h4>
                <Mermaid chart={diagram31Nov2025} theme="dark" />
            </div>
        </section>
    );
}
