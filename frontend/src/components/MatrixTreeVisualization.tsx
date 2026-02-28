import React, { useState } from 'react';
import { MemberPublic } from '../backend';
import { Users, UserCheck, UserX, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MatrixTreeVisualizationProps {
  member: MemberPublic;
  allMembers: Map<bigint, MemberPublic>;
}

interface TreeNode {
  member: MemberPublic | null;
  children: TreeNode[];
  level: number;
  position: number;
}

function buildTree(
  memberId: bigint | null,
  allMembers: Map<bigint, MemberPublic>,
  level: number,
  maxLevel: number
): TreeNode {
  if (level > maxLevel || memberId === null) {
    return { member: null, children: [], level, position: 0 };
  }

  const member = memberId !== null ? allMembers.get(memberId) ?? null : null;

  if (!member) {
    return { member: null, children: [], level, position: 0 };
  }

  const children: TreeNode[] = [];
  if (level < maxLevel) {
    for (let i = 0; i < 3; i++) {
      const childId = member.directDownlines[i] ?? null;
      children.push(buildTree(childId, allMembers, level + 1, maxLevel));
    }
  }

  return { member, children, level, position: 0 };
}

function MemberCard({ node, isRoot }: { node: TreeNode; isRoot?: boolean }) {
  if (!node.member) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-1">
          <Plus className="w-5 h-5 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground/50">Empty</span>
        </div>
      </div>
    );
  }

  const { member } = node;
  const isActive = !member.isCancelled;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-20 rounded-xl border-2 p-2 text-center transition-all ${
          isRoot
            ? 'border-gold-500 bg-gold-500/10'
            : isActive
            ? 'border-border bg-card hover:border-gold-500/50'
            : 'border-destructive/50 bg-destructive/5 opacity-70'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${
            isRoot
              ? 'bg-gold-500/20'
              : isActive
              ? 'bg-muted'
              : 'bg-destructive/20'
          }`}
        >
          {isActive ? (
            <UserCheck className={`w-4 h-4 ${isRoot ? 'text-gold-400' : 'text-foreground'}`} />
          ) : (
            <UserX className="w-4 h-4 text-destructive" />
          )}
        </div>
        <p className="text-xs font-medium text-foreground truncate leading-tight">
          {member.name.split(' ')[0]}
        </p>
        <p className="text-xs text-gold-400 font-mono leading-tight mt-0.5">
          {member.memberIdStr.replace('RI ', '')}
        </p>
        <div className="mt-1">
          <span
            className={`text-xs px-1 py-0.5 rounded ${
              member.joiningFeePaid
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-500'
            }`}
          >
            {member.joiningFeePaid ? '✓ Paid' : '⏳ Pending'}
          </span>
        </div>
      </div>
    </div>
  );
}

function TreeLevel({
  nodes,
  level,
  isRoot,
}: {
  nodes: TreeNode[];
  level: number;
  isRoot?: boolean;
}) {
  return (
    <div className="flex justify-center gap-2 sm:gap-4">
      {nodes.map((node, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <MemberCard node={node} isRoot={isRoot} />
          {node.children.length > 0 && (
            <div className="flex flex-col items-center mt-2">
              <div className="w-px h-4 bg-border" />
              <div className="flex gap-2 sm:gap-4">
                {node.children.map((child, childIdx) => (
                  <div key={childIdx} className="flex flex-col items-center">
                    <div className="w-px h-4 bg-border" />
                    <MemberCard node={child} />
                    {child.children.length > 0 && (
                      <div className="flex flex-col items-center mt-2">
                        <div className="w-px h-4 bg-border" />
                        <div className="flex gap-1 sm:gap-2">
                          {child.children.map((grandchild, gcIdx) => (
                            <div key={gcIdx} className="flex flex-col items-center">
                              <div className="w-px h-4 bg-border" />
                              <MemberCard node={grandchild} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function MatrixTreeVisualization({
  member,
  allMembers,
}: MatrixTreeVisualizationProps) {
  const [maxDepth, setMaxDepth] = useState(3);

  const rootNode = buildTree(member.id, allMembers, 1, maxDepth);

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-gold-400" />
          Matrix Tree (3×3 Structure)
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Depth:</span>
          {[1, 2, 3].map((d) => (
            <button
              key={d}
              onClick={() => setMaxDepth(d)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                maxDepth === d
                  ? 'bg-gold-500 text-navy-900'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-gold-500 bg-gold-500/10" />
          <span className="text-muted-foreground">You (Root)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-border bg-card" />
          <span className="text-muted-foreground">Active Member</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-destructive/50 bg-destructive/5" />
          <span className="text-muted-foreground">Cancelled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-dashed border-border bg-muted/20" />
          <span className="text-muted-foreground">Empty Slot</span>
        </div>
      </div>

      {/* Tree */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-max mx-auto">
          <TreeLevel nodes={[rootNode]} level={1} isRoot />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-foreground font-poppins">
            {member.directDownlines.length}
          </p>
          <p className="text-xs text-muted-foreground">Direct Recruits</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground font-poppins">
            {3 - member.directDownlines.length > 0 ? 3 - member.directDownlines.length : 0}
          </p>
          <p className="text-xs text-muted-foreground">Slots Remaining</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gold-400 font-poppins">
            {member.directDownlines.length >= 3 ? '✓' : `${Math.round((member.directDownlines.length / 3) * 100)}%`}
          </p>
          <p className="text-xs text-muted-foreground">Level 1 Progress</p>
        </div>
      </div>
    </div>
  );
}
