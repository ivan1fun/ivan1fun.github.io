import {
  Component, input, output, computed, signal, ViewChild, ElementRef, OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Person, Relationship } from '../../shared/types';

interface PositionedNode {
  id: string;
  data: Person;
  x: number;
  y: number;
}

interface EdgeDef {
  id: string;
  type: 'spouse' | 'parent-child';
  d: string;
}

@Component({
  selector: 'widget-tree-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full overflow-hidden bg-[var(--color-muted)]/30 rounded-lg border border-[var(--color-border)]">
      @if (persons().length === 0) {
        <div class="absolute inset-0 flex flex-col items-center justify-center text-[var(--color-muted-foreground)]">
          <span class="text-5xl mb-4">🌳</span>
          <p class="text-lg font-medium">Древо пусто</p>
          <p class="text-sm mt-1">Добавьте первого человека, чтобы начать</p>
        </div>
      } @else {
        <svg
          #svgEl
          class="w-full h-full"
          (wheel)="onWheel($event)"
          (mousedown)="onMouseDown($event)"
          (mousemove)="onMouseMove($event)"
          (mouseup)="onMouseUp()"
          (mouseleave)="onMouseUp()"
        >
          <g [attr.transform]="transform()">
            <!-- Edges (drawn under nodes) -->
            @for (edge of layout().edges; track edge.id) {
              <path
                [attr.d]="edge.d"
                [attr.stroke]="edge.type === 'spouse' ? '#f59e0b' : '#6366f1'"
                stroke-width="2"
                fill="none"
                [attr.stroke-dasharray]="edge.type === 'spouse' ? '6,4' : null"
                opacity="0.7"
              />
            }
            <!-- Nodes -->
            @for (node of layout().nodes; track node.id) {
              <g
                [attr.transform]="'translate(' + node.x + ',' + node.y + ')'"
                class="cursor-pointer"
                (click)="nodeClicked.emit(node.data)"
              >
                <rect
                  [attr.width]="nodeW"
                  [attr.height]="nodeH"
                  rx="8"
                  [attr.fill]="node.data.sex === 'female' ? '#fce7f3' : node.data.sex === 'male' ? '#dbeafe' : '#f3f4f6'"
                  [attr.stroke]="selectedPersonId() === node.id ? '#6366f1' : '#e5e7eb'"
                  [attr.stroke-width]="selectedPersonId() === node.id ? 2 : 1"
                />
                @if (node.data.photoURL) {
                  <image
                    [attr.href]="node.data.photoURL"
                    x="8" y="8" width="36" height="36"
                    clip-path="circle(18px at 26px 26px)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                } @else {
                  <circle cx="26" cy="26" r="18"
                    [attr.fill]="node.data.sex === 'female' ? '#fbcfe8' : node.data.sex === 'male' ? '#bfdbfe' : '#d1d5db'"
                  />
                  <text x="26" y="31" text-anchor="middle" font-size="14" fill="#374151">
                    {{ node.data.firstName[0] }}{{ node.data.lastName[0] }}
                  </text>
                }
                <text x="52" y="22" font-size="12" font-weight="600" fill="#111827">{{ node.data.firstName }}</text>
                <text x="52" y="36" font-size="11" fill="#374151">{{ node.data.lastName }}</text>
                @if (node.data.birthDate) {
                  <text x="52" y="50" font-size="10" fill="#6b7280">{{ node.data.birthDate.substring(0, 4) }}</text>
                }
              </g>
            }
          </g>
        </svg>

        <!-- Legend -->
        <div class="absolute bottom-3 left-3 flex gap-3 text-xs text-[var(--color-muted-foreground)] bg-white/80 rounded-md px-3 py-2 border border-[var(--color-border)]">
          <span class="flex items-center gap-1">
            <span class="inline-block w-6 h-0.5 bg-indigo-500"></span>Родитель-ребёнок
          </span>
          <span class="flex items-center gap-1">
            <span class="inline-block w-6 h-0.5 bg-amber-500" style="border-top: 2px dashed #f59e0b; background: transparent;"></span>Супруги
          </span>
        </div>
      }
    </div>
  `,
})
export class TreeCanvasComponent implements OnChanges {
  @ViewChild('svgEl') svgEl!: ElementRef<SVGElement>;

  persons = input<Person[]>([]);
  relationships = input<Relationship[]>([]);
  selectedPersonId = input<string>('');
  nodeClicked = output<Person>();

  readonly nodeW = 160;
  readonly nodeH = 64;
  private readonly coupleGap = 24;   // gap between two spouses
  private readonly familyGap = 60;   // gap between separate families in same row
  private readonly genGap = 120;     // vertical gap between generations

  private scale = signal(1);
  private panX = signal(20);
  private panY = signal(20);
  private isDragging = false;
  private lastX = 0;
  private lastY = 0;

  transform = computed(() => `translate(${this.panX()},${this.panY()}) scale(${this.scale()})`);

  layout = computed(() => this.computeLayout(this.persons(), this.relationships()));

  ngOnChanges(): void {}

  private computeLayout(persons: Person[], rels: Relationship[]): { nodes: PositionedNode[]; edges: EdgeDef[] } {
    if (!persons.length) return { nodes: [], edges: [] };

    const W = this.nodeW, H = this.nodeH;

    // ── Relationship maps ─────────────────────────────────────────────────────
    const spouseOf = new Map<string, string>();           // personId → spouseId
    const childrenOf = new Map<string, string[]>();       // parentId → childIds
    const parentsOf = new Map<string, string[]>();        // childId  → parentIds

    for (const p of persons) { childrenOf.set(p.id, []); parentsOf.set(p.id, []); }

    for (const r of rels) {
      if (r.type === 'spouse') {
        spouseOf.set(r.personAId, r.personBId);
        spouseOf.set(r.personBId, r.personAId);
      } else {
        childrenOf.get(r.personAId)?.push(r.personBId);
        parentsOf.get(r.personBId)?.push(r.personAId);
      }
    }

    // ── Assign generations via BFS ────────────────────────────────────────────
    const genOf = new Map<string, number>();
    const queue: Array<{ id: string; g: number }> = [];

    for (const p of persons) {
      if (!parentsOf.get(p.id)?.length) queue.push({ id: p.id, g: 0 });
    }
    if (!queue.length) queue.push({ id: persons[0].id, g: 0 });

    const visited = new Set<string>();
    for (let i = 0; i < queue.length; i++) {
      const { id, g } = queue[i];
      if (visited.has(id)) continue;
      visited.add(id);
      genOf.set(id, g);

      const spouse = spouseOf.get(id);
      if (spouse && !visited.has(spouse)) queue.push({ id: spouse, g });
      for (const child of childrenOf.get(id) ?? []) {
        if (!visited.has(child)) queue.push({ id: child, g: g + 1 });
      }
    }
    for (const p of persons) if (!genOf.has(p.id)) genOf.set(p.id, 0);

    // ── Group each generation into family units (couples or singles) ──────────
    const byGen = new Map<number, string[]>();
    for (const [id, g] of genOf) {
      if (!byGen.has(g)) byGen.set(g, []);
      byGen.get(g)!.push(id);
    }

    // ── Initial left-to-right placement per generation ────────────────────────
    const pos = new Map<string, { x: number; y: number }>();
    const sortedGens = [...byGen.keys()].sort((a, b) => a - b);

    for (const g of sortedGens) {
      const people = byGen.get(g)!;
      const done = new Set<string>();
      const units: string[][] = [];

      for (const id of people) {
        if (done.has(id)) continue;
        done.add(id);
        const sp = spouseOf.get(id);
        if (sp && byGen.get(g)?.includes(sp) && !done.has(sp)) {
          done.add(sp);
          units.push([id, sp]);
        } else {
          units.push([id]);
        }
      }

      let x = 0;
      const y = g * (H + this.genGap);
      for (const unit of units) {
        pos.set(unit[0], { x, y });
        if (unit.length === 2) {
          pos.set(unit[1], { x: x + W + this.coupleGap, y });
          x += 2 * W + this.coupleGap + this.familyGap;
        } else {
          pos.set(unit[0], { x, y });
          x += W + this.familyGap;
        }
      }
    }

    // ── Center children under their parents (top-down pass) ───────────────────
    for (const g of sortedGens) {
      const people = byGen.get(g)!;
      const done = new Set<string>();

      for (const id of people) {
        if (done.has(id)) continue;
        done.add(id);

        const spouse = spouseOf.get(id);
        const inSameGen = spouse && byGen.get(g)?.includes(spouse);

        let coupleMidX: number;
        let children: string[];

        if (inSameGen) {
          done.add(spouse!);
          const aPos = pos.get(id)!;
          const bPos = pos.get(spouse!)!;
          coupleMidX = (aPos.x + W / 2 + bPos.x + W / 2) / 2;
          const childSet = new Set([
            ...(childrenOf.get(id) ?? []),
            ...(childrenOf.get(spouse!) ?? []),
          ]);
          children = [...childSet];
        } else {
          coupleMidX = pos.get(id)!.x + W / 2;
          children = childrenOf.get(id) ?? [];
        }

        if (!children.length) continue;

        const childCenterXs = children
          .map(c => pos.get(c))
          .filter(Boolean)
          .map(p => p!.x + W / 2);
        if (!childCenterXs.length) continue;

        const childSpanMidX = (Math.min(...childCenterXs) + Math.max(...childCenterXs)) / 2;
        const shift = coupleMidX - childSpanMidX;
        if (Math.abs(shift) < 1) continue;

        for (const childId of children) {
          const cp = pos.get(childId);
          if (cp) pos.set(childId, { ...cp, x: cp.x + shift });
          const childSpouse = spouseOf.get(childId);
          if (childSpouse) {
            const csp = pos.get(childSpouse);
            if (csp) pos.set(childSpouse, { ...csp, x: csp.x + shift });
          }
        }
      }
    }

    // ── Normalize positions (shift so min X is ≥ 0) ──────────────────────────
    const allX = [...pos.values()].map(p => p.x);
    const minX = Math.min(...allX);
    if (minX < 0) for (const [id, p] of pos) pos.set(id, { ...p, x: p.x - minX });

    // ── Positioned nodes ──────────────────────────────────────────────────────
    const nodes: PositionedNode[] = persons.map(p => ({
      id: p.id,
      data: p,
      x: pos.get(p.id)?.x ?? 0,
      y: pos.get(p.id)?.y ?? 0,
    }));
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // ── Edges ─────────────────────────────────────────────────────────────────
    const edges: EdgeDef[] = [];

    // Spouse edges: dashed horizontal line between the two nodes
    const spouseDone = new Set<string>();
    for (const r of rels.filter(r => r.type === 'spouse')) {
      const key = [r.personAId, r.personBId].sort().join('|');
      if (spouseDone.has(key)) continue;
      spouseDone.add(key);
      const a = nodeMap.get(r.personAId), b = nodeMap.get(r.personBId);
      if (!a || !b) continue;
      edges.push({
        id: r.id,
        type: 'spouse',
        d: `M ${a.x + W} ${a.y + H / 2} L ${b.x} ${b.y + H / 2}`,
      });
    }

    // Parent-child edges: group siblings, draw from couple midpoint
    const childProcessed = new Set<string>();

    for (const p of persons) {
      if (childProcessed.has(p.id)) continue;
      const pParents = parentsOf.get(p.id) ?? [];
      if (!pParents.length) continue;

      // Resolve source (couple midpoint or single parent)
      const p1 = pParents[0];
      const p2 = pParents[1];
      const parentA = nodeMap.get(p1);
      if (!parentA) continue;

      let srcX: number;
      // Use couple midpoint if p2 is p1's spouse, or if p1 has a spouse
      const effectiveSpouse =
        p2 && spouseOf.get(p1) === p2 ? p2 : spouseOf.get(p1);
      const spouseNode = effectiveSpouse ? nodeMap.get(effectiveSpouse) : undefined;

      if (spouseNode) {
        srcX = (parentA.x + W / 2 + spouseNode.x + W / 2) / 2;
      } else {
        srcX = parentA.x + W / 2;
      }
      const srcY = parentA.y + H;

      // Find all unprocessed siblings (share at least one parent with p)
      const siblings = persons.filter(
        s => !childProcessed.has(s.id) && parentsOf.get(s.id)?.some(pid => pParents.includes(pid))
      );
      for (const sib of siblings) childProcessed.add(sib.id);

      const sibNodes = siblings
        .map(s => nodeMap.get(s.id))
        .filter(Boolean) as PositionedNode[];
      if (!sibNodes.length) continue;

      const dstY = Math.min(...sibNodes.map(n => n.y));

      if (sibNodes.length === 1) {
        // Single child: vertical (+ optional horizontal step if offset)
        const dstX = sibNodes[0].x + W / 2;
        const jY = srcY + (dstY - srcY) / 2;
        edges.push({
          id: `pc-${p.id}`,
          type: 'parent-child',
          d: `M ${srcX} ${srcY} L ${srcX} ${jY} L ${dstX} ${jY} L ${dstX} ${dstY}`,
        });
      } else {
        // Multiple children: vertical from source → horizontal bar → drops
        const sorted = sibNodes.slice().sort((a, b) => a.x - b.x);
        const barL = sorted[0].x + W / 2;
        const barR = sorted[sorted.length - 1].x + W / 2;
        const jY = srcY + (dstY - srcY) * 0.5;

        let d = `M ${srcX} ${srcY} L ${srcX} ${jY}`;          // stem down
        d += ` M ${barL} ${jY} L ${barR} ${jY}`;               // horizontal bar
        for (const sib of sorted) {
          const cx = sib.x + W / 2;
          d += ` M ${cx} ${jY} L ${cx} ${dstY}`;               // drop to each child
        }
        edges.push({ id: `pc-group-${sorted[0].id}`, type: 'parent-child', d });
      }
    }

    return { nodes, edges };
  }

  onWheel(e: WheelEvent): void {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    this.scale.update(s => Math.min(Math.max(s * factor, 0.2), 4));
  }

  onMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return;
    this.isDragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }

  onMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    this.panX.update(x => x + (e.clientX - this.lastX));
    this.panY.update(y => y + (e.clientY - this.lastY));
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }

  onMouseUp(): void { this.isDragging = false; }
}
