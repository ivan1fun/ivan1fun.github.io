import {
  Component,
  input,
  output,
  computed,
  ElementRef,
  AfterViewInit,
  OnChanges,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Person, Relationship } from '../../shared/types';
import { toGraphData, GraphNode } from '../../entities/family-tree/model/tree-graph.adapter';

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
            <!-- Edges -->
            @for (edge of graphData().links; track edge.id) {
              @if (getNodeById(edge.source); as source) {
                @if (getNodeById(edge.target); as target) {
                  <line
                    [attr.x1]="source.x + nodeW / 2"
                    [attr.y1]="source.y + nodeH / 2"
                    [attr.x2]="target.x + nodeW / 2"
                    [attr.y2]="target.y + nodeH / 2"
                    [attr.stroke]="edge.data.type === 'spouse' ? '#f59e0b' : '#6366f1'"
                    stroke-width="2"
                    [attr.stroke-dasharray]="edge.data.type === 'spouse' ? '5,5' : null"
                    opacity="0.7"
                  />
                }
              }
            }
            <!-- Nodes -->
            @for (node of layoutNodes(); track node.id) {
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
                    x="8"
                    y="8"
                    width="36"
                    height="36"
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
          <span class="flex items-center gap-1"><span class="inline-block w-6 h-0.5 bg-indigo-500"></span>Родитель-ребёнок</span>
          <span class="flex items-center gap-1"><span class="inline-block w-6 h-0.5 bg-amber-500" style="border-top: 2px dashed #f59e0b; background: transparent;"></span>Супруги</span>
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
  private readonly colGap = 60;
  private readonly rowGap = 40;

  graphData = computed(() => toGraphData(this.persons(), this.relationships()));

  layoutNodes = computed(() => {
    const nodes = this.graphData().nodes;
    const cols = Math.ceil(Math.sqrt(nodes.length)) || 1;
    return nodes.map((n, i) => ({
      ...n,
      x: (i % cols) * (this.nodeW + this.colGap),
      y: Math.floor(i / cols) * (this.nodeH + this.rowGap),
    }));
  });

  // Pan & Zoom state
  private scale = signal(1);
  private panX = signal(20);
  private panY = signal(20);
  private isDragging = false;
  private lastX = 0;
  private lastY = 0;

  transform = computed(
    () => `translate(${this.panX()},${this.panY()}) scale(${this.scale()})`
  );

  ngOnChanges(): void {}

  getNodeById(id: string) {
    return this.layoutNodes().find((n) => n.id === id);
  }

  onWheel(e: WheelEvent): void {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    this.scale.update((s) => Math.min(Math.max(s * factor, 0.2), 4));
  }

  onMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return;
    this.isDragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }

  onMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    this.panX.update((x) => x + (e.clientX - this.lastX));
    this.panY.update((y) => y + (e.clientY - this.lastY));
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }

  onMouseUp(): void {
    this.isDragging = false;
  }
}
