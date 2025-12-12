import * as React from "react";
import { Plus, UserPlus, Users } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
      </div>

      {/* Groups Grid */}
      {groups.length > 0
        ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map(group => (
                <Card
                  key={group.id}
                  className="cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
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
                          className="w-9 h-9 rounded-full bg-gradient-to-br from-muted to-secondary border-2 border-card flex items-center justify-center text-xs font-semibold shadow-sm"
                        >
                          {member.user?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      ))}
                      {(group.members?.length || 0) > 4 && (
                        <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center text-xs font-semibold text-primary">
                          +
                          {group.members!.length - 4}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        : (
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
