import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

interface AIRequest {
  context: string[];
  query: string;
  mode: "chat" | "connect" | "analyze_symbol" | "extract_entities";
  provider?: "openai" | "anthropic";
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
    const { context, query, mode } = body;

    const zai = await getZAI();

    // Build messages based on mode
    let messages: Array<{ role: "assistant" | "user"; content: string }> = [
      { role: "assistant", content: SYSTEM_PROMPT },
    ];

    switch (mode) {
      case "chat":
        // General chat with context
        if (context.length > 0) {
          messages.push({
            role: "user",
            content: `Context from selected documents:\n${context.join("\n\n---\n\n")}\n\nQuestion: ${query}`,
          });
        } else {
          messages.push({
            role: "user",
            content: query,
          });
        }
        break;

      case "connect":
        // Find connections between documents
        messages.push({
          role: "user",
          content: `Analyze these documents and find hidden connections, themes, or relationships:\n\n${context.join("\n\n---\n\n")}\n\nIdentify:\n1. Common themes or topics\n2. Shared entities (people, places, organizations)\n3. Temporal connections\n4. Symbolic or thematic connections\n\nRespond with JSON containing entities array and connections array.`,
        });
        break;

      case "analyze_symbol":
        // Symbol recognition and analysis
        messages.push({
          role: "user",
          content: `Analyze this content for Freemasonic or symbolic references:\n\n${context.join("\n\n")}\n\nIdentify and explain:\n1. Any Masonic symbols mentioned (Square and Compasses, Eye of Providence, etc.)\n2. Symbolic meanings and historical context\n3. Related symbolism in Freemasonry\n4. Cultural or historical significance\n\nRespond with JSON containing entities (for symbols found) and connections.`,
        });
        break;

      case "extract_entities":
        // Entity extraction
        messages.push({
          role: "user",
          content: `Extract ALL entities from this text:\n\n${context.join("\n\n")}\n\nFor each entity, identify:\n- Name (full name or proper noun)\n- Type (person, location, date, symbol, organization, or concept)\n- Context (brief quote or description of where it appears)\n- Aliases (alternative names or abbreviations)\n\nAlso identify any relationships/connections between entities.\n\nRespond ONLY with valid JSON containing entities and connections arrays.`,
        });
        break;

      default:
        messages.push({
          role: "user",
          content: query,
        });
    }

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
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
