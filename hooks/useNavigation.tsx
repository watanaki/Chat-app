import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { MessageSquare, Users } from "lucide-react";
import { usePathname } from "next/navigation"
import { useMemo } from "react";

export const useNavigation = () => {
  const pathName = usePathname();

  const requestCount = useQuery(api.requests.count);
  const conversations = useQuery(api.conversations.get);
  const unseenMessageCount = useMemo(() => {
    return conversations?.reduce((acc, curr) => {
      return acc + curr.unseenCount;
    }, 0);
  }, [conversations]);

  const paths = useMemo(() => [
    {
      name: "Conversations",
      href: "/conversations",
      icon: <MessageSquare />,
      active: pathName.startsWith("/conversations"),
      count: unseenMessageCount,
    },
    {
      name: "Friends",
      href: "/friends",
      icon: <Users />,
      active: pathName.startsWith("/friends"),
      count: requestCount
    }
  ], [pathName, requestCount, unseenMessageCount]);

  return paths;

}