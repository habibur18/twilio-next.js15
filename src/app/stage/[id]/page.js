import UploadCSV from "@/components/UPloadCSV";

export default async function page({ params }) {
  const id = (await params).id;
  return (
    <>
      <UploadCSV id={id} />
    </>
  );
}
