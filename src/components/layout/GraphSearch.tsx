"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  X,
  GitBranch,
  ArrowRight,
  Users,
  MapPin,
  Building2,
  Shield,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useEntityStore,
  type Entity,
  type EntityConnection,
} from "@/stores/entityStore";

interface GraphSearchProps {
  onResultClick: (entity: Entity) => void;
}

interface SearchResult {
  entity: Entity;
  connections: EntityConnection[];
  connectedEntities: Entity[];
  score: number;
}

export default function GraphSearch({ onResultClick }: GraphSearchProps) {
  const { entities, connections, getEntityById } = useEntityStore();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  // Perform graph-aware search
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const searchLower = searchQuery.toLowerCase();

    // Find matching entities
    const matchingEntities = entities.filter((entity) => {
      const nameMatch = entity.name.toLowerCase().includes(searchLower);
      const aliasMatch = entity.aliases.some((a) =>
        a.toLowerCase().includes(searchLower)
      );
      const descMatch = entity.description.toLowerCase().includes(searchLower);
      return nameMatch || aliasMatch || descMatch;
    });

    // Calculate relevance scores and find connections
    const searchResults: SearchResult[] = matchingEntities.map((entity) => {
      const entityConnections = connections.filter(
        (c) => c.sourceEntityId === entity.id || c.targetEntityId === entity.id
      );

      const connectedEntityIds = entityConnections.map((c) =>
        c.sourceEntityId === entity.id ? c.targetEntityId : c.sourceEntityId
      );

      const connectedEntities = connectedEntityIds
        .map((id) => getEntityById(id))
        .filter(Boolean) as Entity[];

      // Calculate score based on:
      // - Name match (highest)
      // - Number of connections
      // - Occurrence count
      let score = 0;
      if (entity.name.toLowerCase() === searchLower) {
        score += 100;
      } else if (entity.name.toLowerCase().startsWith(searchLower)) {
        score += 50;
      } else {
        score += 25;
      }
      score += Math.min(entityConnections.length * 5, 30);
      score += Math.min(entity.occurrenceCount * 2, 20);

      return {
        entity,
        connections: entityConnections,
        connectedEntities,
        score,
      };
    });

    // Sort by score
    searchResults.sort((a, b) => b.score - a.score);

    setResults(searchResults);
    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      performSearch(query);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setExpandedResult(null);
  };

  // Get icon for entity type
  const getEntityIcon = (type: string) => {
    switch (type) {
      case "person":
        return <Users className="w-3 h-3" />;
      case "location":
        return <MapPin className="w-3 h-3" />;
      case "organization":
        return <Building2 className="w-3 h-3" />;
      case "date":
        return <Calendar className="w-3 h-3" />;
      case "symbol":
        return <Shield className="w-3 h-3" />;
      default:
        return <GitBranch className="w-3 h-3" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-sidebar border-b border-sidebar-border">
      {/* Search Input */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search entities & connections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 pr-8 h-9 text-sm"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={clearSearch}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          Press Enter to search • Find entities and their connections
        </p>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        {!query && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <GitBranch className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              Graph Search
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px]">
              Search across all entities and discover connections between them
            </p>
          </div>
        ) : isSearching ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <p className="text-sm text-muted-foreground">No results found</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            <p className="text-[10px] text-muted-foreground px-2 mb-2">
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </p>
            {results.map((result) => {
              const isExpanded = expandedResult === result.entity.id;

              return (
                <div
                  key={result.entity.id}
                  className={cn(
                    "rounded-lg border transition-all",
                    isExpanded
                      ? "bg-card border-primary/30"
                      : "bg-card/50 border-transparent hover:border-border"
                  )}
                >
                  {/* Main Result */}
                  <button
                    className="w-full p-3 text-left"
                    onClick={() => onResultClick(result.entity)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-primary">
                        {getEntityIcon(result.entity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-card-foreground truncate">
                            {result.entity.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0 capitalize"
                          >
                            {result.entity.type}
                          </Badge>
                        </div>
                        {result.entity.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {result.entity.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4"
                          >
                            <GitBranch className="w-2.5 h-2.5 mr-0.5" />
                            {result.connections.length} connection{result.connections.length !== 1 ? "s" : ""}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            Score: {result.score}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Connections */}
                  {result.connections.length > 0 && (
                    <div className="border-t border-border">
                      <button
                        className="w-full px-3 py-1.5 flex items-center gap-1.5 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
                        onClick={() =>
                          setExpandedResult(
                            isExpanded ? null : result.entity.id
                          )
                        }
                      >
                        {isExpanded ? (
                          <>
                            Hide connections
                            <X className="w-3 h-3 ml-auto" />
                          </>
                        ) : (
                          <>
                            Show {result.connections.length} connection{result.connections.length !== 1 ? "s" : ""}
                            <ArrowRight className="w-3 h-3 ml-auto" />
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-3 pb-2 space-y-1">
                          {result.connectedEntities.map((connectedEntity, idx) => {
                            const connection = result.connections.find(
                              (c) =>
                                c.sourceEntityId === connectedEntity.id ||
                                c.targetEntityId === connectedEntity.id
                            );

                            return (
                              <button
                                key={connectedEntity.id}
                                className="w-full flex items-center gap-2 p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
                                onClick={() => onResultClick(connectedEntity)}
                              >
                                <span className="text-muted-foreground">
                                  {getEntityIcon(connectedEntity.type)}
                                </span>
                                <div className="flex-1 text-left">
                                  <span className="text-xs font-medium text-card-foreground">
                                    {connectedEntity.name}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground ml-1.5">
                                    ({connection?.type?.replace("_", " ") || "connected"})
                                  </span>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0 capitalize"
                                >
                                  {connectedEntity.type}
                                </Badge>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
