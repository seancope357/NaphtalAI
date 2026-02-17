import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export type EntityType = "person" | "location" | "organization" | "date" | "symbol" | "concept";

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  aliases: string[];
  description: string;
  sourceIds: string[]; // Document IDs where this entity was found
  occurrenceCount: number;
  firstSeen: Date;
  lastSeen: Date;
  metadata: {
    confidence?: number;
    context?: string;
    wikipedia_url?: string;
    custom_fields?: Record<string, string>;
  };
}

export interface EntityConnection {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  type: string; // e.g., "member_of", "located_in", "associated_with", "founded_by"
  strength: number; // 0-1 confidence
  sourceIds: string[]; // Documents that support this connection
  description: string;
  createdAt: Date;
}

export interface EntityFilter {
  types: EntityType[];
  searchTerm: string;
  minOccurrences: number;
  sourceId?: string;
}

interface EntityState {
  entities: Entity[];
  connections: EntityConnection[];
  selectedEntityIds: string[];
  filters: EntityFilter;
  isExtracting: boolean;
  
  // Entity Actions
  addEntity: (entity: Omit<Entity, "id" | "occurrenceCount" | "firstSeen" | "lastSeen">) => Entity;
  updateEntity: (id: string, data: Partial<Entity>) => void;
  deleteEntity: (id: string) => void;
  mergeEntities: (sourceId: string, targetId: string) => void;
  
  // Connection Actions
  addConnection: (connection: Omit<EntityConnection, "id" | "createdAt">) => EntityConnection;
  updateConnection: (id: string, data: Partial<EntityConnection>) => void;
  deleteConnection: (id: string) => void;
  
  // Selection
  setSelectedEntities: (ids: string[]) => void;
  toggleEntitySelection: (id: string) => void;
  clearSelection: () => void;
  
  // Filters
  setFilters: (filters: Partial<EntityFilter>) => void;
  clearFilters: () => void;
  
  // Utility
  getEntityById: (id: string) => Entity | undefined;
  getEntitiesByType: (type: EntityType) => Entity[];
  getEntitiesBySource: (sourceId: string) => Entity[];
  getConnectionsForEntity: (entityId: string) => EntityConnection[];
  getFilteredEntities: () => Entity[];
  
  // Extraction
  setExtracting: (isExtracting: boolean) => void;
  
  // Bulk operations
  addEntities: (entities: Array<Omit<Entity, "id" | "occurrenceCount" | "firstSeen" | "lastSeen">>) => Entity[];
  addConnections: (connections: Array<Omit<EntityConnection, "id" | "createdAt">>) => EntityConnection[];
}

const defaultFilters: EntityFilter = {
  types: [],
  searchTerm: "",
  minOccurrences: 1,
};

export const useEntityStore = create<EntityState>((set, get) => ({
  entities: [],
  connections: [],
  selectedEntityIds: [],
  filters: defaultFilters,
  isExtracting: false,
  
  // Entity Actions
  addEntity: (entityData) => {
    const entity: Entity = {
      ...entityData,
      id: uuidv4(),
      occurrenceCount: 1,
      firstSeen: new Date(),
      lastSeen: new Date(),
    };
    
    set((state) => ({
      entities: [...state.entities, entity],
    }));
    
    return entity;
  },
  
  updateEntity: (id, data) =>
    set((state) => ({
      entities: state.entities.map((e) =>
        e.id === id ? { ...e, ...data, lastSeen: new Date() } : e
      ),
    })),
  
  deleteEntity: (id) =>
    set((state) => ({
      entities: state.entities.filter((e) => e.id !== id),
      connections: state.connections.filter(
        (c) => c.sourceEntityId !== id && c.targetEntityId !== id
      ),
      selectedEntityIds: state.selectedEntityIds.filter((eid) => eid !== id),
    })),
  
  mergeEntities: (sourceId, targetId) =>
    set((state) => {
      const sourceEntity = state.entities.find((e) => e.id === sourceId);
      const targetEntity = state.entities.find((e) => e.id === targetId);
      
      if (!sourceEntity || !targetEntity) return state;
      
      // Merge source into target
      const mergedEntity: Entity = {
        ...targetEntity,
        aliases: [...new Set([...targetEntity.aliases, sourceEntity.name, ...sourceEntity.aliases])],
        sourceIds: [...new Set([...targetEntity.sourceIds, ...sourceEntity.sourceIds])],
        occurrenceCount: targetEntity.occurrenceCount + sourceEntity.occurrenceCount,
      };
      
      return {
        entities: state.entities
          .map((e) => (e.id === targetId ? mergedEntity : e))
          .filter((e) => e.id !== sourceId),
        connections: state.connections.map((c) => ({
          ...c,
          sourceEntityId: c.sourceEntityId === sourceId ? targetId : c.sourceEntityId,
          targetEntityId: c.targetEntityId === sourceId ? targetId : c.targetEntityId,
        })),
        selectedEntityIds: state.selectedEntityIds.filter((id) => id !== sourceId),
      };
    }),
  
  // Connection Actions
  addConnection: (connectionData) => {
    const connection: EntityConnection = {
      ...connectionData,
      id: uuidv4(),
      createdAt: new Date(),
    };
    
    set((state) => ({
      connections: [...state.connections, connection],
    }));
    
    return connection;
  },
  
  updateConnection: (id, data) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    })),
  
  deleteConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
    })),
  
  // Selection
  setSelectedEntities: (ids) => set({ selectedEntityIds: ids }),
  
  toggleEntitySelection: (id) =>
    set((state) => ({
      selectedEntityIds: state.selectedEntityIds.includes(id)
        ? state.selectedEntityIds.filter((eid) => eid !== id)
        : [...state.selectedEntityIds, id],
    })),
  
  clearSelection: () => set({ selectedEntityIds: [] }),
  
  // Filters
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  
  clearFilters: () => set({ filters: defaultFilters }),
  
  // Utility
  getEntityById: (id) => get().entities.find((e) => e.id === id),
  
  getEntitiesByType: (type) => get().entities.filter((e) => e.type === type),
  
  getEntitiesBySource: (sourceId) =>
    get().entities.filter((e) => e.sourceIds.includes(sourceId)),
  
  getConnectionsForEntity: (entityId) =>
    get().connections.filter(
      (c) => c.sourceEntityId === entityId || c.targetEntityId === entityId
    ),
  
  getFilteredEntities: () => {
    const { entities, filters } = get();
    
    return entities.filter((entity) => {
      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(entity.type)) {
        return false;
      }
      
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesName = entity.name.toLowerCase().includes(searchLower);
        const matchesAliases = entity.aliases.some((a) =>
          a.toLowerCase().includes(searchLower)
        );
        const matchesDescription = entity.description.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesAliases && !matchesDescription) {
          return false;
        }
      }
      
      // Minimum occurrences filter
      if (entity.occurrenceCount < filters.minOccurrences) {
        return false;
      }
      
      // Source filter
      if (filters.sourceId && !entity.sourceIds.includes(filters.sourceId)) {
        return false;
      }
      
      return true;
    });
  },
  
  // Extraction
  setExtracting: (isExtracting) => set({ isExtracting }),
  
  // Bulk operations
  addEntities: (entitiesData) => {
    const newEntities: Entity[] = entitiesData.map((data) => ({
      ...data,
      id: uuidv4(),
      occurrenceCount: 1,
      firstSeen: new Date(),
      lastSeen: new Date(),
    }));
    
    set((state) => ({
      entities: [...state.entities, ...newEntities],
    }));
    
    return newEntities;
  },
  
  addConnections: (connectionsData) => {
    const newConnections: EntityConnection[] = connectionsData.map((data) => ({
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
    }));
    
    set((state) => ({
      connections: [...state.connections, ...newConnections],
    }));
    
    return newConnections;
  },
}));

// Helper to get entity type color
export function getEntityTypeColor(type: EntityType): string {
  const colors: Record<EntityType, string> = {
    person: "bg-blue-500",
    location: "bg-green-500",
    organization: "bg-purple-500",
    date: "bg-orange-500",
    symbol: "bg-amber-500",
    concept: "bg-cyan-500",
  };
  return colors[type];
}

// Helper to get entity type icon
export function getEntityTypeIcon(type: EntityType): string {
  const icons: Record<EntityType, string> = {
    person: "👤",
    location: "📍",
    organization: "🏛️",
    date: "📅",
    symbol: "🔷",
    concept: "💡",
  };
  return icons[type];
}

// Connection types for relationships
export const CONNECTION_TYPES = [
  { value: "associated_with", label: "Associated With", color: "#94a3b8" },
  { value: "member_of", label: "Member Of", color: "#3b82f6" },
  { value: "located_in", label: "Located In", color: "#22c55e" },
  { value: "founded_by", label: "Founded By", color: "#a855f7" },
  { value: "referenced_in", label: "Referenced In", color: "#f59e0b" },
  { value: "related_to", label: "Related To", color: "#ef4444" },
  { value: "precedes", label: "Precedes", color: "#06b6d4" },
  { value: "succeeds", label: "Succeeds", color: "#ec4899" },
] as const;
