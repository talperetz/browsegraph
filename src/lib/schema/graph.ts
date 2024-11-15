import { z, ZodEnum, ZodObject, ZodString } from "zod";

interface CreateSchemaParams {
  allowedNodes: string[];
  allowedRelationships: string[];
}

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

export function createGraphSchema(
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

export type GraphType = z.infer<ReturnType<typeof createGraphSchema>>;
