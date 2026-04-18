import DettaglioVeicolo from "./dettaglioVeicolo";

export default async function PAGEdettaglioVeicolo ({params}) {

  const { idveicolo } = await params;

  return(
    <div className="flex flex-row w-full gap-5">
      <div className="basis-6/6">
        <DettaglioVeicolo idveicolo={idveicolo} />
      </div>
    </div>
  )
}