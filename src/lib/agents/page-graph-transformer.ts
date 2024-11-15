import { generateObject } from "ai";
import { z, ZodEnum, ZodObject, ZodString } from "zod";

import { geminiFlash } from "@/lib/agents/index";
import { PageItem } from "@/lib/storage/page-vectors";

export const systemMessage = `
# Knowledge Graph Instructions for GPT-4\n
## 1. Overview\n
You are a top-tier algorithm designed for extracting information in structured formats to build a knowledge graph.\n
Try to capture as much information from the text as possible without sacrifing accuracy. Do not add any information that is not explicitly mentioned in the text\n"
- **Nodes** represent entities and concepts.\n"
- The aim is to achieve simplicity and clarity in the knowledge graph, making it\n
accessible for a vast audience.\n
## 2. Labeling Nodes\n
- **Consistency**: Ensure you use available types for node labels.\n
Ensure you use basic or elementary types for node labels.\n
- For example, when you identify an entity representing a person, always label it as **'person'**. Avoid using more specific terms like 'mathematician' or 'scientist'
- **Node IDs**: Never utilize integers as node IDs. Node IDs should be names or human-readable identifiers found in the text.\n
- **Relationships** represent connections between entities or concepts.\n
Ensure consistency and generality in relationship types when constructing knowledge graphs. Instead of using specific and momentary types such as 'BECAME_PROFESSOR', use more general and timeless relationship types like 'PROFESSOR'. Make sure to use general and timeless relationship types!\n
## 3. Coreference Resolution\n
- **Maintain Entity Consistency**: When extracting entities, it's vital to ensure consistency.\n
If an entity, such as "John Doe", is mentioned multiple times in the text but is referred to by different names or pronouns (e.g., "Joe", "he"), always use the most complete identifier for that entity throughout the knowledge graph. In this example, use "John Doe" as the entity ID.\n
Remember, the knowledge graph should be coherent and easily understandable, so maintaining consistency in entity references is crucial.\n
## 4. Strict Compliance\n
Adhere to the rules strictly. Non-compliance will result in termination.
`;

interface CreateOptionalEnumTypeParams {
  enumValues?: string[];
  description?: string;
  isRel?: boolean;
}

function createOptionalEnumType({
  enumValues = undefined,
  description = "",
  isRel = false,
}: CreateOptionalEnumTypeParams): ZodString | ZodEnum<[string, ...string[]]> {
  let schema;

  if (enumValues && enumValues.length) {
    schema = z
      .enum(enumValues as [string, ...string[]])
      .describe(
        `${description} Available options are: ${enumValues.join(", ")}.`,
      );
  } else {
    const nodeInfo =
      "Ensure you use basic or elementary types for node labels.\n" +
      "For example, when you identify an entity representing a person, " +
      "always label it as **'Person'**. Avoid using more specific terms " +
      "like 'Mathematician' or 'Scientist'";
    const relInfo =
      "Instead of using specific and momentary types such as " +
      "'BECAME_PROFESSOR', use more general and timeless relationship types like " +
      "'PROFESSOR'. However, do not sacrifice any accuracy for generality";
    const additionalInfo = isRel ? relInfo : nodeInfo;

    schema = z.string().describe(description + additionalInfo);
  }

  return schema;
}

interface CreateSchemaParams {
  allowedNodes: string[];
  allowedRelationships: string[];
}

function createSchema(
  allowedNodes: CreateSchemaParams["allowedNodes"],
  allowedRelationships: CreateSchemaParams["allowedRelationships"],
): ZodObject<any> {
  return z.object({
    nodes: z
      .array(
        z.object({
          id: z.string(),
          type: createOptionalEnumType({
            enumValues: allowedNodes,
            description: "The type or label of the node.",
          }),
        }),
      )
      .describe("List of nodes"),
    relationships: z
      .array(
        z.object({
          sourceNodeId: z.string(),
          sourceNodeType: createOptionalEnumType({
            enumValues: allowedNodes,
            description: "The source node of the relationship.",
          }),
          relationshipType: createOptionalEnumType({
            enumValues: allowedRelationships,
            description: "The type of the relationship.",
            isRel: true,
          }),
          targetNodeId: z.string(),
          targetNodeType: createOptionalEnumType({
            enumValues: allowedNodes,
            description: "The target node of the relationship.",
          }),
        }),
      )
      .describe("List of relationships."),
  });
}

const generateUserPrompt = (title: string, content: string): string => {
  return `Here's the web page info:\n###Title:\n${title}\n###Content:\n${content}`;
};

export type PageKnowledgeGraph = z.infer<ReturnType<typeof createSchema>>;

export const generatePageKnowledgeGraph = async (
  page: PageItem,
): Promise<PageKnowledgeGraph> => {
  const { object } = await generateObject({
    // @ts-ignore
    model: geminiFlash,
    maxRetries: 3,
    system: systemMessage,
    prompt: generateUserPrompt(page.title, JSON.stringify(page.content)),
    schema: createSchema([], []),
    temperature: 0.1,
  });

  return object as PageKnowledgeGraph;
};
