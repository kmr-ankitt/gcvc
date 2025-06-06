import Room from "@/components/Room";

export default async function page({ params }: { params: { roomid: string } }) {
  const awaitedParams = await params;

  return (
    <div>
      <Room roomId={awaitedParams.roomid} />
    </div>
  );
}
