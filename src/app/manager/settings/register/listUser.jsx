export default function ListAllUser ({data}) {
  return (
    <div className="flex flex-col gap-2 bg-muted rounded-2xl p-5 w-full">
      {data?.map ((u, i) => {
          
          const ui = u.user_metadata

          return (
          <div className="border rounded-2xl p-5" key={u.id}>
            <div className="flex flex-row gap-1 uppercase text-sm font-bold text-brand">
              <span>{ui.name}</span>
              <span>{ui.surname}</span>
            </div>
            <div className="flex flex-row gap-1 text-neutral-400 text-sm">
              <span>{u.email}</span>
            </div>
            <div className="flex flex-row gap-1 text-neutral-400 italic text-sm">
              <span>{ui.role}</span>
            </div>
          </div>
      )})}
    </div>
  )
}