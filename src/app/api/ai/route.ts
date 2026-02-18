import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

interface AIRequest {
  context: string[];
  query: string;
  mode: "chat" | "connect" | "analyze_symbol" | "extract_entities" | "presentation" | "report";
  provider?: "openai" | "anthropic";
  openAIKey?: string;
  anthropicKey?: string;
  graph?: {
    nodes: Array<{
      id: string;
      type: string;
      label: string;
      source?: string;
      tags?: string[];
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      label?: string;
      semanticType?: string;
      logicRule?: string;
      confidence?: number;
      sourceHandle?: string;
      targetHandle?: string;
    }>;
    selectedNodeIds?: string[];
  };
}

interface ExtractedEntity {
  name: string;
  type: "person" | "location" | "date" | "symbol" | "organization" | "concept";
  context?: string;
  aliases?: string[];
}

interface SuggestedConnection {
  sourceName: string;
  targetName: string;
  type: string;
  label: string;
  confidence: number;
}

// Freemasonic Research System Prompt
const SYSTEM_PROMPT = `You are NaphtalAI, an AI assistant specialized in Freemasonic research, historical analysis, and symbolic interpretation. You help researchers discover hidden connections in documents, identify symbols, and extract meaningful entities.

Your expertise includes:
- Freemasonic history, rituals, and symbolism
- Historical document analysis
- Pattern recognition in texts
- Entity extraction (people, places, dates, organizations, symbols, concepts)
- Connection analysis between documents and entities

When analyzing documents:
1. Be thorough but concise
2. Provide historical context when relevant
3. Identify symbolic meanings
4. Extract entities with proper classification
5. Suggest connections between elements

When extracting entities, respond ONLY with valid JSON in this exact format (no other text):
{
  "entities": [
    {
      "name": "Full Name",
      "type": "person|location|date|symbol|organization|concept",
      "context": "Brief context about where/how this entity appears",
      "aliases": ["Alternative name", "Short name"]
    }
  ],
  "connections": [
    {
      "sourceName": "Entity A",
      "targetName": "Entity B",
      "type": "associated_with|member_of|located_in|founded_by|related_to",
      "label": "Description of relationship",
      "confidence": 0.8
    }
  ]
}

Entity types:
- person: People, historical figures, members
- location: Places, buildings, cities, countries
- organization: Lodges, chapters, groups, institutions
- date: Specific dates or time periods
- symbol: Masonic symbols, icons, ritual items
- concept: Ideas, principles, themes

Connection types:
- associated_with: General association
- member_of: Person belongs to organization
- located_in: Place within another place
- founded_by: Organization or place founded by person
- related_to: Some relationship exists
- referenced_in: Entity mentioned in context of another

Always maintain a scholarly, investigative tone. Extract ALL named entities from the text.`;

function buildGraphConstraintBlock(
  graph: AIRequest["graph"],
  mode: AIRequest["mode"]
): string {
  if (!graph || graph.nodes.length === 0) return "";

  const boundedGraph = {
    ...graph,
    nodes: graph.nodes.slice(0, 140),
    edges: graph.edges.slice(0, 320),
  };
  const graphJson = JSON.stringify(boundedGraph, null, 2);

  const modeSpecificInstruction =
    mode === "presentation"
      ? `When creating slides, each claim must include:
- source node citation in [N:<nodeId>] format
- supporting edge citation in [E:<edgeId>] format when relationship-based
- a confidence note if confidence < 0.75`
      : mode === "report"
      ? `When creating reports, each key claim must include:
- source node citation in [N:<nodeId>] format
- supporting edge citation in [E:<edgeId>] format when relationship-based
- explicit "Known / Hypothesis" labeling for uncertain links`
      : `Use graph edges as inference constraints. Prefer relationship claims that are explicitly represented in edges.`;

  return `\n\nGraph constraints (authoritative):\n${graphJson}\n\nRules:\n- Treat edges as explicit relationship constraints.\n- Do not invent unsupported links between nodes.\n- Mark uncertain inferences as hypotheses.\n${modeSpecificInstruction}`;
}

interface CitationIssue {
  slide: string;
  claim: string;
  missing: Array<"node" | "edge">;
}

interface CitationValidationResult {
  valid: boolean;
  checkedClaims: number;
  issues: CitationIssue[];
  message: string;
}

function validatePresentationCitations(markdown: string): CitationValidationResult {
  const lines = markdown.split(/\r?\n/);
  const issues: CitationIssue[] = [];
  let checkedClaims = 0;
  let currentSlide = "Unlabeled slide";

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (/^#{1,6}\s*/.test(line)) {
      const heading = line.replace(/^#{1,6}\s*/, "").trim();
      if (/slide\s*\d+/i.test(heading)) {
        currentSlide = heading;
      }
      continue;
    }

    const isClaimLine =
      /^[-*+]\s+/.test(line) ||
      /^\d+\.\s+/.test(line) ||
      /^claim\s*[:\-]/i.test(line);

    if (!isClaimLine) continue;

    const claim = line
      .replace(/^[-*+]\s+/, "")
      .replace(/^\d+\.\s+/, "")
      .replace(/^claim\s*[:\-]\s*/i, "")
      .trim();

    if (!claim) continue;

    checkedClaims += 1;

    const hasNodeCitation = /\[N:[^\]]+\]/i.test(claim);
    const hasEdgeCitation = /\[E:[^\]]+\]/i.test(claim);
    const missing: Array<"node" | "edge"> = [];

    if (!hasNodeCitation) missing.push("node");
    if (!hasEdgeCitation) missing.push("edge");

    if (missing.length > 0) {
      issues.push({
        slide: currentSlide,
        claim,
        missing,
      });
    }
  }

  if (checkedClaims === 0) {
    return {
      valid: false,
      checkedClaims: 0,
      issues: [],
      message:
        "Deck validation failed: no claim lines detected. Use bullet/numbered claim lines with [N:<nodeId>] and [E:<edgeId>] citations.",
    };
  }

  if (issues.length > 0) {
    return {
      valid: false,
      checkedClaims,
      issues,
      message:
        "Deck validation failed: every slide claim must include both [N:<nodeId>] and [E:<edgeId>] citations.",
    };
  }

  return {
    valid: true,
    checkedClaims,
    issues: [],
    message: "Deck citations validated.",
  };
}

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AIRequest;
    const { context, query, mode, provider, openAIKey, anthropicKey, graph } = body;

    const zai = await getZAI();

    const options: any = {};
    if (provider === "openai" && openAIKey) {
      options.apiKey = openAIKey;
    } else if (provider === "anthropic" && anthropicKey) {
      options.apiKey = anthropicKey;
    }


    // Build messages based on mode
    let messages: Array<{ role: "assistant" | "user"; content: string }> = [
      { role: "assistant", content: SYSTEM_PROMPT },
    ];
    const graphConstraints = buildGraphConstraintBlock(graph, mode);

    switch (mode) {
      case "chat":
        // General chat with context
        if (context.length > 0) {
          messages.push({
            role: "user",
            content: `Context from selected documents:\n${context.join("\n\n---\n\n")}${graphConstraints}\n\nQuestion: ${query}`,
          });
        } else {
          messages.push({
            role: "user",
            content: `${query}${graphConstraints}`,
          });
        }
        break;

      case "connect":
        // Find connections between documents
        messages.push({
          role: "user",
          content: `Analyze these documents and find hidden connections, themes, or relationships:\n\n${context.join("\n\n---\n\n")}${graphConstraints}\n\nIdentify:\n1. Common themes or topics\n2. Shared entities (people, places, organizations)\n3. Temporal connections\n4. Symbolic or thematic connections\n\nRespond with JSON containing entities array and connections array.`,
        });
        break;

      case "analyze_symbol":
        // Symbol recognition and analysis
        messages.push({
          role: "user",
          content: `Analyze this content for Freemasonic or symbolic references:\n\n${context.join("\n\n")}${graphConstraints}\n\nIdentify and explain:\n1. Any Masonic symbols mentioned (Square and Compasses, Eye of Providence, etc.)\n2. Symbolic meanings and historical context\n3. Related symbolism in Freemasonry\n4. Cultural or historical significance\n\nRespond with JSON containing entities (for symbols found) and connections.`,
        });
        break;

      case "extract_entities":
        // Entity extraction
        messages.push({
          role: "user",
          content: `Extract ALL entities from this text:\n\n${context.join("\n\n")}${graphConstraints}\n\nFor each entity, identify:\n- Name (full name or proper noun)\n- Type (person, location, date, symbol, organization, or concept)\n- Context (brief quote or description of where it appears)\n- Aliases (alternative names or abbreviations)\n\nAlso identify any relationships/connections between entities.\n\nRespond ONLY with valid JSON containing entities and connections arrays.`,
        });
        break;

      case "presentation":
        messages.push({
          role: "user",
          content: `Create a slide presentation outline from this research context.\n\nContext:\n${context.join("\n\n---\n\n")}${graphConstraints}\n\nRequirements:\n1. Provide 8-12 slides.\n2. Each slide includes: title, key points, suggested visual, and speaker notes.\n3. Every claim line must include BOTH citations: [N:<nodeId>] and [E:<edgeId>].\n4. Include a final "Sources & Evidence Trail" slide.\n5. Prefer high-confidence edges and mark uncertain edges as hypotheses.\n\nOutput as clear markdown with sections per slide.`,
        });
        break;
      case "report":
        messages.push({
          role: "user",
          content: `Create a research report from this graph-constrained context.\n\nContext:\n${context.join("\n\n---\n\n")}${graphConstraints}\n\nRequirements:\n1. Output sections: Executive Summary, Key Findings, Relationship Analysis, Risks & Unknowns, Recommendations, Sources & Evidence Trail.\n2. Every substantive claim cites [N:<nodeId>] and relationship claims also cite [E:<edgeId>].\n3. Explicitly label uncertain claims as Hypothesis.\n4. Keep writing professional and presentation-ready.\n\nOutput as polished markdown with clear section headers.`,
        });
        break;

      default:
        messages.push({
          role: "user",
          content: `${query}${graphConstraints}`,
        });
    }

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
      ...options,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    // Try to parse JSON for entity extraction and connection modes
    let parsedResponse:
      | string
      | { entities: ExtractedEntity[]; connections: SuggestedConnection[] };

    if (mode === "extract_entities" || mode === "connect" || mode === "analyze_symbol") {
      try {
        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          parsedResponse = {
            entities: parsed.entities || [],
            connections: parsed.connections || [],
          };
        } else {
          parsedResponse = { entities: [], connections: [] };
        }
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        // Return empty arrays if parsing fails
        parsedResponse = { entities: [], connections: [] };
      }
    } else {
      parsedResponse = response;
    }

    if (mode === "presentation" && typeof parsedResponse === "string") {
      const validation = validatePresentationCitations(parsedResponse);
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: "citation_validation_failed",
            details: {
              message: validation.message,
              checkedClaims: validation.checkedClaims,
              issues: validation.issues.slice(0, 24),
            },
            mode,
          },
          { status: 422 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      result: parsedResponse,
      mode,
    });
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process AI request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
