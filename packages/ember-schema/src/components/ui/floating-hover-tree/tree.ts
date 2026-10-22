interface FloatingHoverNodeArgs {
  nodeId: string;
  parentId?: string;
  tree: FloatingHoverTree;
}

interface FloatingHoverTree {
  registerNode(args: { nodeId: string; parentId?: string }): FloatingHoverNode;
  unregisterNode(args: { nodeId: string }): void;
  getNode(args: { nodeId: string }): FloatingHoverNode | undefined;
  hasOpenChild(args: { nodeId: string }): boolean;
  findContainingNode(args: { triggerElement: HTMLElement; excludeNodeId: string }): FloatingHoverNode | undefined;
}

export type { FloatingHoverNodeArgs };

class FloatingHoverNode {
  readonly nodeId: string;
  parentId: string | undefined;

  #isPointerOverTrigger = false;
  #isPointerOverContent = false;
  #contentOverlay: HTMLElement | undefined;
  #triggerElement: HTMLElement | undefined;
  #onCloseTimer: (() => void) | undefined;
  #closeTimer: number | undefined;
  #hoverOpenTimer: number | undefined;

  readonly #tree: FloatingHoverTree;

  constructor({ nodeId, parentId, tree }: FloatingHoverNodeArgs) {
    this.nodeId = nodeId;
    this.parentId = parentId;
    this.#tree = tree;
  }

  get isPointerOverTrigger(): boolean {
    return this.#isPointerOverTrigger;
  }

  get isPointerOverContent(): boolean {
    return this.#isPointerOverContent;
  }

  get shouldStayOpen(): boolean {
    return this.#isPointerOverContent || this.#isPointerOverTrigger || this.#tree.hasOpenChild({ nodeId: this.nodeId });
  }

  get contentOverlay(): HTMLElement | undefined {
    return this.#contentOverlay;
  }

  setContentOverlay({ element }: { element: HTMLElement }): void {
    this.#contentOverlay = element;
    console.debug('[debug:tree] setContentOverlay', {
      nodeId: this.nodeId,
      tagName: element.tagName,
      parentNode: element.parentNode?.nodeName,
    });
  }

  setTriggerElement({ element }: { element: HTMLElement }): void {
    this.#triggerElement = element;
  }

  doesContentOverlayContain({ element }: { element: HTMLElement }): boolean {
    return this.#contentOverlay?.contains(element) ?? false;
  }

  setPointerOverTrigger({ isOver }: { isOver: boolean }): void {
    this.#isPointerOverTrigger = isOver;

    if (isOver) {
      this.#cancelScheduledClose();
      this.#cancelPendingCloseForAncestors();
    } else {
      this.scheduleClose();
    }
  }

  setPointerOverContent({ isOver }: { isOver: boolean }): void {
    this.#isPointerOverContent = isOver;

    if (isOver) {
      this.#cancelScheduledClose();
      this.#cancelPendingCloseForAncestors();
    } else {
      this.scheduleClose();
    }
  }

  hasOpenDescendant({ includeSelf }: { includeSelf: boolean }): boolean {
    if (includeSelf && this.shouldStayOpen) return true;
    return this.#tree.hasOpenChild({ nodeId: this.nodeId });
  }

  scheduleHoverOpen({ delayMs, callback }: { delayMs: number; callback: () => void }): void {
    this.#cancelHoverOpen();
    this.#cancelScheduledClose();
    this.#hoverOpenTimer = window.setTimeout(() => {
      this.#hoverOpenTimer = undefined;
      callback();
    }, delayMs);
  }

  cancelHoverOpen(): void {
    if (this.#hoverOpenTimer !== undefined) {
      clearTimeout(this.#hoverOpenTimer);
      this.#hoverOpenTimer = undefined;
    }
  }

  scheduleClose(): void {
    this.#cancelHoverOpen();
    this.#cancelScheduledClose();
    if (this.#onCloseTimer === undefined) return;

    console.debug('[debug:tree] scheduleClose', { id: this.nodeId });
    this.#closeTimer = window.setTimeout(() => {
      this.#closeTimer = undefined;
      console.debug('[debug:tree] closeTimer fire', { id: this.nodeId, shouldStayOpen: this.shouldStayOpen });
      if (this.shouldStayOpen) return;
      this.#onCloseTimer?.();
    }, 50);
  }

  cancelScheduledClose(): void {
    this.#cancelScheduledClose();
  }

  onCloseTimer(callback: () => void): void {
    this.#onCloseTimer = callback;
  }

  unregisterFromTree(): void {
    this.destroy();
    this.#onCloseTimer = undefined;
    this.#scheduleParentCloseIfNeeded();
  }

  registerWithParent(): void {
    if (this.#triggerElement !== undefined) {
      const parent = this.#tree.findContainingNode({
        triggerElement: this.#triggerElement,
        excludeNodeId: this.nodeId,
      });

      if (parent !== undefined) {
        this.parentId = parent.nodeId;
        parent.cancelScheduledClose();
      }
    }

    console.debug('[debug:tree] registerWithParent', {
      id: this.nodeId,
      parentId: this.parentId,
      hasTriggerElement: this.#triggerElement !== undefined,
    });
  }

  unregisterFromParent(): void {
    this.#scheduleParentCloseIfNeeded();
  }

  destroy(): void {
    this.#cancelHoverOpen();
    this.#cancelScheduledClose();
  }

  #scheduleParentCloseIfNeeded(): void {
    if (this.parentId === undefined) return;
    const parent = this.#tree.getNode({ nodeId: this.parentId });
    if (parent === undefined) return;
    if (!parent.shouldStayOpen) {
      parent.scheduleClose();
    }
  }

  #cancelScheduledClose(): void {
    if (this.#closeTimer !== undefined) {
      clearTimeout(this.#closeTimer);
      this.#closeTimer = undefined;
    }
  }

  #cancelHoverOpen(): void {
    if (this.#hoverOpenTimer !== undefined) {
      clearTimeout(this.#hoverOpenTimer);
      this.#hoverOpenTimer = undefined;
    }
  }

  #cancelPendingCloseForAncestors(): void {
    if (this.parentId === undefined) return;
    const parent = this.#tree.getNode({ nodeId: this.parentId });
    if (parent !== undefined) {
      parent.cancelScheduledClose();
      parent.#cancelPendingCloseForAncestors();
    }
  }
}

class FloatingHoverTree {
  #nodes = new Map<string, FloatingHoverNode>();

  registerNode({ nodeId, parentId }: { nodeId: string; parentId?: string }): FloatingHoverNode {
    const existing = this.#nodes.get(nodeId);
    if (existing !== undefined) return existing;

    const node = new FloatingHoverNode({ nodeId, parentId, tree: this });
    this.#nodes.set(nodeId, node);
    return node;
  }

  unregisterNode({ nodeId }: { nodeId: string }): void {
    const node = this.#nodes.get(nodeId);
    if (node === undefined) return;

    node.unregisterFromTree();
    this.#nodes.delete(nodeId);
  }

  getNode({ nodeId }: { nodeId: string }): FloatingHoverNode | undefined {
    return this.#nodes.get(nodeId);
  }

  hasOpenChild({ nodeId }: { nodeId: string }): boolean {
    for (const node of this.#nodes.values()) {
      if (node.parentId === nodeId && node.shouldStayOpen) return true;
    }
    return false;
  }

  findContainingNode({
    triggerElement,
    excludeNodeId,
  }: {
    triggerElement: HTMLElement;
    excludeNodeId: string;
  }): FloatingHoverNode | undefined {
    console.debug('[debug:tree] findContainingNode', {
      excludeNodeId,
      triggerTag: triggerElement.tagName,
      totalNodes: this.#nodes.size,
    });

    for (const node of this.#nodes.values()) {
      if (node.nodeId === excludeNodeId) continue;

      const contains = node.doesContentOverlayContain({ element: triggerElement });

      console.debug('[debug:tree] checking node', {
        nodeId: node.nodeId,
        contains,
      });

      if (contains) return node;
    }
    return undefined;
  }
}

export { FloatingHoverNode, FloatingHoverTree };
