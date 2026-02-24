import type { MemberPublic } from '../backend';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, User } from 'lucide-react';

interface MatrixTreeVisualizationProps {
  rootMemberId: bigint;
  allMembers: MemberPublic[];
  maxDepth?: number;
}

interface TreeNode {
  member: MemberPublic;
  children: TreeNode[];
  depth: number;
}

function buildTree(memberId: bigint, allMembers: MemberPublic[], depth: number, maxDepth: number): TreeNode | null {
  const member = allMembers.find((m) => m.id === memberId);
  if (!member) return null;
  if (depth > maxDepth) return null;

  const children: TreeNode[] = [];
  for (const downlineId of member.directDownlines) {
    const child = buildTree(downlineId, allMembers, depth + 1, maxDepth);
    if (child) children.push(child);
  }

  // Add empty slots
  while (children.length < 3 && depth < maxDepth) {
    children.push({ member: { id: BigInt(-1), name: '', contactInfo: '', feeRefunded: false, directDownlines: [], registrationTimestamp: BigInt(0), joiningFeePaid: false, matrixPosition: { memberId: BigInt(-1), level: BigInt(0), position: BigInt(0) } }, children: [], depth: depth + 1 });
  }

  return { member, children, depth };
}

function TreeNodeCard({ node, isRoot }: { node: TreeNode; isRoot?: boolean }) {
  const isEmpty = node.member.id === BigInt(-1);

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/20">
          <User size={20} className="text-muted-foreground/40 mb-1" />
          <span className="text-xs text-muted-foreground/40">Empty</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`relative rounded-xl border-2 p-3 text-center w-24 ${
        isRoot
          ? 'border-gold-500/60 bg-gold-500/10'
          : node.member.feeRefunded
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-border bg-card'
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${
          isRoot ? 'bg-gold-500/20' : 'bg-muted'
        }`}>
          <span className={`text-sm font-bold ${isRoot ? 'text-gold-400' : 'text-foreground'}`}>
            {node.member.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="text-xs font-semibold text-foreground truncate max-w-full">{node.member.name}</div>
        <div className="text-xs text-muted-foreground">#{node.member.id.toString()}</div>
        <div className="mt-1">
          {node.member.feeRefunded ? (
            <CheckCircle size={12} className="text-emerald-400 mx-auto" />
          ) : (
            <Clock size={12} className="text-amber-400 mx-auto" />
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {node.member.directDownlines.length}/3
        </div>
      </div>
    </div>
  );
}

function TreeLevel({ nodes, depth }: { nodes: TreeNode[]; depth: number }) {
  if (nodes.length === 0) return null;

  const nextLevelNodes = nodes.flatMap((n) => n.children);

  return (
    <>
      <div className="flex justify-center gap-4 mb-2">
        {nodes.map((node, i) => (
          <TreeNodeCard key={`${node.member.id.toString()}-${i}`} node={node} />
        ))}
      </div>
      {nextLevelNodes.length > 0 && depth < 3 && (
        <>
          <div className="flex justify-center">
            <div className="w-px h-4 bg-border" />
          </div>
          <div className="border-t border-border mx-8 mb-2" />
          <TreeLevel nodes={nextLevelNodes} depth={depth + 1} />
        </>
      )}
    </>
  );
}

export default function MatrixTreeVisualization({ rootMemberId, allMembers, maxDepth = 3 }: MatrixTreeVisualizationProps) {
  const tree = buildTree(rootMemberId, allMembers, 0, maxDepth);

  if (!tree) {
    return <p className="text-muted-foreground text-sm">Member not found.</p>;
  }

  const totalDownlines = allMembers.filter((m) => {
    // Check if this member is in the subtree
    const checkInTree = (id: bigint): boolean => {
      if (id === rootMemberId) return false;
      const member = allMembers.find((m) => m.id === id);
      if (!member) return false;
      if (member.sponsorId === rootMemberId) return true;
      if (member.sponsorId) return checkInTree(member.sponsorId);
      return false;
    };
    return checkInTree(m.id);
  }).length;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-2 border-gold-500/60 bg-gold-500/10" />
            <span className="text-muted-foreground">Root Member</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle size={12} className="text-emerald-400" />
            <span className="text-muted-foreground">Fee Refunded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-amber-400" />
            <span className="text-muted-foreground">Refund Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-2 border-dashed border-border" />
            <span className="text-muted-foreground">Empty Slot</span>
          </div>
        </div>

        {/* Root */}
        <div className="flex justify-center mb-2">
          <TreeNodeCard node={tree} isRoot />
        </div>

        {/* Children levels */}
        {tree.children.length > 0 && (
          <>
            <div className="flex justify-center">
              <div className="w-px h-4 bg-border" />
            </div>
            <div className="border-t border-border mx-8 mb-2" />
            <TreeLevel nodes={tree.children} depth={1} />
          </>
        )}

        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Showing up to {maxDepth} levels · {tree.member.directDownlines.length}/3 direct downlines filled
          </p>
        </div>
      </div>
    </div>
  );
}
