import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Group } from "../types";
import { groupService } from "../services/group.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");

  const fetchGroups = async () => {
    try {
      const data = await groupService.getAll();
      setGroups(data);
    } catch (error) {
      console.error("Failed to fetch groups", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode) return;
    try {
      await groupService.join(joinCode);
      setJoinCode("");
      fetchGroups();
    } catch (error) {
      console.error("Failed to join group", error);
      alert("Failed to join group. Check the code.");
    }
  };

  if (isLoading) return <div>Loading groups...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">My Groups</h2>
        <Link to="/groups/new">
          <Button>Create Group</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Join a Group</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Enter Group Code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              Join
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Link key={group.id} to={`/groups/${group.id}`}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {group.members.length} members
                  </p>
                  <div className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                    {group.code}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {groups.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">
            You are not in any groups yet.
          </div>
        )}
      </div>
    </div>
  );
}
