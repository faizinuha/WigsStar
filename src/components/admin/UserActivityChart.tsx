import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserActivityChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserActivity = async () => {
      const { data: users, error } = await supabase
        .from("profiles")
        .select("created_at");

      if (error) {
        console.error("Error fetching user activity:", error);
        return;
      }

      const activity = users.reduce((acc, user) => {
        const date = new Date(user.created_at).toLocaleDateString();
        const existingEntry = acc.find((entry) => entry.date === date);
        if (existingEntry) {
          existingEntry.users++;
        } else {
          acc.push({ date, users: 1 });
        }
        return acc;
      }, [] as { date: string; users: number }[]);

      setData(activity.slice(-7));
    };

    fetchUserActivity();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Users (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Bar dataKey="users" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default UserActivityChart;