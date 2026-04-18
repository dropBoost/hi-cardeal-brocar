import FormVeicolo from "./aggiungi-auto";

export default function PAGEaddVeicolo () {
  return(
    <div className="flex flex-row w-full gap-5">
      <div className="basis-4/6">
        <FormVeicolo/>
      </div>
      <div className="basis-3/6">
        {/* <FormVeicolo/> */}
      </div>
    </div>
  )
}