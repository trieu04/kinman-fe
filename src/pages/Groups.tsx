import * as React from "react";
import { Plus, UserPlus, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useNavigate } from "react-router-dom";
import groupService from "../services/groupService";
import type { Group } from "../types";

export function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showJoinModal, setShowJoinModal] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState("");
  const [joinCode, setJoinCode] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const data = await groupService.getAll();
      setGroups(data);
    }
    catch (error) {
      console.error("Failed to fetch groups:", error);
    }
    finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim())
      return;
    setIsSubmitting(true);
    try {
      const group = await groupService.create({ name: newGroupName.trim() });
      setGroups([...groups, group]);
      setShowCreateModal(false);
      setNewGroupName("");
      navigate(`/groups/${group.id}`);
    }
    catch (error) {
      console.error("Failed to create group:", error);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim())
      return;
    setIsSubmitting(true);
    try {
      const group = await groupService.joinByCode(joinCode.trim());
      setGroups([...groups, group]);
      setShowJoinModal(false);
      setJoinCode("");
      navigate(`/groups/${group.id}`);
    }
    catch (error) {
      console.error("Failed to join group:", error);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground text-base">Manage shared expenses with friends</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowJoinModal(true)} className="h-11">
            <UserPlus className="w-4 h-4 mr-2" />
            Join Group
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="h-11">
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>
      </motion.div>

      {/* Groups Grid */}
      {groups.length > 0
        ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            >
              {(() => {
                const palette = [
                  { bg: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30", border: "border-purple-500/20 dark:border-purple-500/30", shadow: "shadow-purple-500/10", icon: "from-purple-500 to-pink-500", iconShadow: "shadow-purple-500/20", accent: "from-purple-400 to-pink-400" },
                  { bg: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30", border: "border-blue-500/20 dark:border-blue-500/30", shadow: "shadow-blue-500/10", icon: "from-blue-500 to-cyan-500", iconShadow: "shadow-blue-500/20", accent: "from-blue-400 to-cyan-400" },
                  { bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30", border: "border-emerald-500/20 dark:border-emerald-500/30", shadow: "shadow-emerald-500/10", icon: "from-emerald-500 to-teal-500", iconShadow: "shadow-emerald-500/20", accent: "from-emerald-400 to-teal-400" },
                  { bg: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30", border: "border-amber-500/20 dark:border-amber-500/30", shadow: "shadow-amber-500/10", icon: "from-amber-500 to-orange-500", iconShadow: "shadow-amber-500/20", accent: "from-amber-400 to-orange-400" },
                  { bg: "from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30", border: "border-rose-500/20 dark:border-rose-500/30", shadow: "shadow-rose-500/10", icon: "from-rose-500 to-red-500", iconShadow: "shadow-rose-500/20", accent: "from-rose-400 to-red-400" },
                  { bg: "from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30", border: "border-indigo-500/20 dark:border-indigo-500/30", shadow: "shadow-indigo-500/10", icon: "from-indigo-500 to-violet-500", iconShadow: "shadow-indigo-500/20", accent: "from-indigo-400 to-violet-400" },
                ];
                return groups.map((group, idx) => {
                  const colors = palette[idx % palette.length];
                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: idx % 3 === 0 ? -30 : idx % 3 === 1 ? 30 : 0, x: idx % 3 === 2 ? -20 : 0 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      transition={{ duration: 0.7, delay: 0.25 + idx * 0.12, ease: "easeOut" }}
                    >
                      <Card
                        className={`cursor-pointer border ${colors.border} bg-gradient-to-br ${colors.bg} shadow-lg ${colors.shadow} hover:shadow-xl hover:border-opacity-50 transition-all duration-300 group`}
                        onClick={() => navigate(`/groups/${group.id}`)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.icon} flex items-center justify-center shadow-lg ${colors.iconShadow} group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
                              <Users className="w-7 h-7 text-white" />
                            </div>
                          </div>
                          <CardTitle className="mt-4 text-xl">{group.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {group.members?.length || 0}
                            {" "}
                            members
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex -space-x-2.5">
                            {group.members?.slice(0, 4).map((member, i) => (
                              <div
                                key={member.id || i}
                                className={`w-9 h-9 rounded-full bg-gradient-to-br ${colors.accent} border-2 border-card flex items-center justify-center text-xs font-semibold text-white shadow-sm`}
                              >
                                {member.user?.name?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                            ))}
                            {(group.members?.length || 0) > 4 && (
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${colors.accent} opacity-80 border-2 border-card flex items-center justify-center text-xs font-semibold text-white`}>
                                +
                                {group.members!.length - 4}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                });
              })()}
            </motion.div>
          )
        : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            >
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create a group to split expenses with friends and family
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={() => setShowJoinModal(true)}>
                    Join Group
                  </Button>
                  <Button onClick={() => setShowCreateModal(true)}>
                    Create Group
                  </Button>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          )}

      {/* Create Group Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a group to split expenses with others
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Group Name</label>
            <input
              type="text"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              placeholder="e.g., Roommates, Trip to Bali"
              className="w-full h-10 mt-2 px-3 rounded-md border border-border bg-card text-sm"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup} disabled={isSubmitting || !newGroupName.trim()}>
              {isSubmitting ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Group Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Group</DialogTitle>
            <DialogDescription>
              Enter the invite code shared by a group member
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Invite Code</label>
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              className="w-full h-10 mt-2 px-3 rounded-md border border-border bg-card text-sm uppercase tracking-widest text-center font-mono"
              autoFocus
              maxLength={8}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoinGroup} disabled={isSubmitting || !joinCode.trim()}>
              {isSubmitting ? "Joining..." : "Join Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Groups;
