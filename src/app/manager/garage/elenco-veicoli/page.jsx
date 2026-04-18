import ListaVeicoli from "./elencoVeicoli";

export default function PAGElistVeicoli () {
  return(
    <div className="flex flex-row w-full gap-5">
      <div className="basis-6/6">
        <ListaVeicoli/>
      </div>
    </div>
  )
}