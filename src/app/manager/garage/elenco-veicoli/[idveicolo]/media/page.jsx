import GestioneMediaVeicolo from "./GestioneMediaVeicolo"

export default async function PAGEgestioneMediaVeicolo ({params}) {

  const { idveicolo } = await params;

  return(
    <div className="flex flex-row w-full gap-5">
      <div className="basis-6/6">
        <GestioneMediaVeicolo idveicolo={idveicolo} />
      </div>
    </div>
  )
}