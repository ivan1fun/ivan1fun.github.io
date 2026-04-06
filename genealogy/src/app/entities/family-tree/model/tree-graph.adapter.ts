import { Person, Relationship } from '../../../shared/types';

export interface GraphNode {
  id: string;
  label: string;
  data: Person;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  data: Relationship;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphEdge[];
}

export function toGraphData(persons: Person[], relationships: Relationship[]): GraphData {
  const nodes: GraphNode[] = persons.map((p) => ({
    id: p.id,
    label: `${p.firstName} ${p.lastName}`,
    data: p,
  }));

  const links: GraphEdge[] = relationships.map((r) => ({
    id: r.id,
    source: r.personAId,
    target: r.personBId,
    label: r.type === 'parent-child' ? 'parent' : 'spouse',
    data: r,
  }));

  return { nodes, links };
}
