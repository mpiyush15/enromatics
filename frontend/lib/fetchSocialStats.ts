import clientPromise from "@/lib/db";

export async function fetchSocialStats(userId: string) {
  const client = await clientPromise;
  const db = client.db("forteStudioz");

  // Fetch the social stats for this tenant and user
  const stats = await db.collection("socialStats").findOne({
  
  userId: String(userId),
  
});
  // Provide default values if not found
  return (
    stats || {
      facebook: { 
        followers: 6, 
        likes: 0, 
        comments: 0 
      },
      instagram: { followers: 0, likes: 0, comments: 0 },
    }
  );
}