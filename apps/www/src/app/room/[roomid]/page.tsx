import Room from "@/components/Room";

export default function page({ params }: { params: { roomid: string } }) {
  return (
    <div>
      <Room roomId={params.roomid} />
    </div>
  );
}
