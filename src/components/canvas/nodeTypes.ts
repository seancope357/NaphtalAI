import DocumentNode from "./DocumentNode";
import NoteNode from "./NoteNode";
import EntityNode from "./EntityNode";
import CustomEdge from "./CustomEdge";

export const nodeTypes = {
  fileNode: DocumentNode,
  noteNode: NoteNode,
  entityNode: EntityNode,
};

export const edgeTypes = {
  customEdge: CustomEdge,
};
