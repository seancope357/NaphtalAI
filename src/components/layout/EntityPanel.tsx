"use client";

import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Building,
  CalendarClock,
  CircleChevronDown,
  CircleChevronRight,
  Fingerprint,
  MapPinned,
  PanelsTopLeft,
  ScanSearch,
  ShieldEllipsis,
  SlidersHorizontal,
  Sparkle,
  UserRound,
  Waypoints,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useEntityStore,
  getEntityTypeColor,
  getEntityTypeIcon,
  type EntityType,
  type Entity,
} from "@/stores/entityStore";

interface EntityPanelProps {
  onEntityClick: (entity: Entity) => void;
  onAddToCanvas: (entity: Entity) => void;
}

const ENTITY_TYPE_CONFIG: Record<EntityType, { icon: React.ReactNode; label: string; color: string }> = {
  person: {
    icon: <UserRound className="w-3.5 h-3.5" strokeWidth={2.2} />,
    label: "People",
    color: "text-blue-400",
  },
  location: {
    icon: <MapPinned className="w-3.5 h-3.5" strokeWidth={2.2} />,
    label: "Locations",
    color: "text-green-400",
  },
  organization: {
    icon: <Building className="w-3.5 h-3.5" strokeWidth={2.2} />,
    label: "Organizations",
    color: "text-purple-400",
  },
  date: {
    icon: <CalendarClock className="w-3.5 h-3.5" strokeWidth={2.2} />,
    label: "Dates",
    color: "text-orange-400",
  },
  symbol: {
    icon: <ShieldEllipsis className="w-3.5 h-3.5" strokeWidth={2.2} />,
    label: "Symbols",
    color: "text-amber-400",
  },
  concept: {
    icon: <Sparkle className="w-3.5 h-3.5" strokeWidth={2.2} />,
    label: "Concepts",
    color: "text-cyan-400",
  },
};

export default function EntityPanel({ onEntityClick, onAddToCanvas }: EntityPanelProps) {
  const {
    entities,
    connections,
    selectedEntityIds,
    filters,
    setFilters,
    toggleEntitySelection,
    clearSelection,
    deleteEntity,
    getFilteredEntities,
  } = useEntityStore();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [expandedTypes, setExpandedTypes] = useState<EntityType[]>([
    "person",
    "organization",
    "location",
  ]);

  const filteredEntities = getFilteredEntities();

  // Group entities by type
  const entitiesByType = useMemo(() => {
    const grouped: Record<EntityType, Entity[]> = {
      person: [],
      location: [],
      organization: [],
      date: [],
      symbol: [],
      concept: [],
    };

    filteredEntities.forEach((entity) => {
      grouped[entity.type].push(entity);
    });

    return grouped;
  }, [filteredEntities]);

  // Count entities per type
  const typeCounts = useMemo(() => {
    const counts: Record<EntityType, number> = {
      person: 0,
      location: 0,
      organization: 0,
      date: 0,
      symbol: 0,
      concept: 0,
    };

    entities.forEach((entity) => {
      counts[entity.type]++;
    });

    return counts;
  }, [entities]);

  const toggleTypeExpanded = (type: EntityType) => {
    setExpandedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleTypeFilterToggle = (type: EntityType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    setFilters({ types: newTypes });
  };

  // Get connection count for an entity
  const getConnectionCount = (entityId: string) => {
    return connections.filter(
      (c) => c.sourceEntityId === entityId || c.targetEntityId === entityId
    ).length;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-revelation-gold" strokeWidth={2.2} />
            <h3 className="font-display font-semibold text-sm text-sidebar-foreground">
              Entities
            </h3>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {entities.length} total
          </Badge>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <ScanSearch className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.2} />
          <Input
            placeholder="Search entities..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ searchTerm: e.target.value })}
            className="pl-7 h-8 text-xs"
          />
        </div>

        {/* Filter Toggle */}
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full h-7 text-xs justify-between">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3" strokeWidth={2.2} />
                Type Filters
              </span>
              {isFiltersOpen ? (
                <CircleChevronDown className="w-3 h-3" strokeWidth={2.2} />
              ) : (
                <CircleChevronRight className="w-3 h-3" strokeWidth={2.2} />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {(Object.keys(ENTITY_TYPE_CONFIG) as EntityType[]).map((type) => {
                const config = ENTITY_TYPE_CONFIG[type];
                const count = typeCounts[type];
                const isFiltered = filters.types.includes(type);

                return (
                  <button
                    key={type}
                    onClick={() => handleTypeFilterToggle(type)}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors",
                      isFiltered
                        ? "bg-primary/20 text-primary"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <span className={config.color}>{config.icon}</span>
                    <span>{config.label}</span>
                    <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1">
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Selected Actions */}
      {selectedEntityIds.length > 0 && (
        <div className="p-2 border-b border-border bg-muted/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {selectedEntityIds.length} selected
          </span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              <Waypoints className="w-3 h-3 mr-1" strokeWidth={2.2} />
              Connect
            </Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              <PanelsTopLeft className="w-3 h-3 mr-1" strokeWidth={2.2} />
              Merge
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-destructive"
              onClick={clearSelection}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Entity List by Type */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {(Object.keys(ENTITY_TYPE_CONFIG) as EntityType[]).map((type) => {
            const config = ENTITY_TYPE_CONFIG[type];
            const typeEntities = entitiesByType[type];
            const isExpanded = expandedTypes.includes(type);

            return (
              <Collapsible
                key={type}
                open={isExpanded}
                onOpenChange={() => toggleTypeExpanded(type)}
              >
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors">
                    {isExpanded ? (
                      <CircleChevronDown className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
                    ) : (
                      <CircleChevronRight className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
                    )}
                    <span className={config.color}>{config.icon}</span>
                    <span className="text-xs font-medium text-card-foreground">
                      {config.label}
                    </span>
                    <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1">
                      {typeEntities.length}
                    </Badge>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-4 mt-1 space-y-0.5">
                    {typeEntities.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground px-2 py-1">
                        No entities found
                      </p>
                    ) : (
                      typeEntities.map((entity) => {
                        const connectionCount = getConnectionCount(entity.id);
                        const isSelected = selectedEntityIds.includes(entity.id);

                        return (
                          <div
                            key={entity.id}
                            className={cn(
                              "group flex items-start gap-2 p-2 rounded",
                              "hover:bg-muted/50 cursor-pointer transition-colors",
                              isSelected && "bg-primary/10 ring-1 ring-primary/30"
                            )}
                            onClick={() => onEntityClick(entity)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleEntitySelection(entity.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-card-foreground truncate">
                                  {entity.name}
                                </span>
                                {connectionCount > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] h-4 px-1 bg-revelation-gold/20 text-revelation-gold border-revelation-gold/30"
                                  >
                                    <Waypoints className="w-2.5 h-2.5 mr-0.5" strokeWidth={2.2} />
                                    {connectionCount}
                                  </Badge>
                                )}
                              </div>
                              {entity.description && (
                                <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                                  {entity.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-muted-foreground">
                                  {entity.occurrenceCount} occurrence{entity.occurrenceCount !== 1 ? "s" : ""}
                                </span>
                                <span className="text-[10px] text-muted-foreground">•</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {entity.sourceIds.length} source{entity.sourceIds.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCanvas(entity);
                              }}
                              title="Add to canvas"
                            >
                              <PanelsTopLeft className="w-3 h-3" strokeWidth={2.2} />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>

      {/* Stats Footer */}
      <div className="p-2 border-t border-border text-[10px] text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>{connections.length} connections</span>
          <span>{entities.reduce((acc, e) => acc + e.occurrenceCount, 0)} occurrences</span>
        </div>
      </div>
    </div>
  );
}
