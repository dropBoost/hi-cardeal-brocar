export default function UserInfo({ user, profilo }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <h2 className="mb-4 text-lg font-semibold">Utente connesso</h2>

      <div className="grid gap-2 text-sm">
        <div>
          <span className="font-medium">UUID:</span> {user?.id}
        </div>
        <div>
          <span className="font-medium">Email:</span> {user?.email}
        </div>
        <div>
          <span className="font-medium">Email verificata:</span>{" "}
          {user?.email_confirmed_at ? "Sì" : "No"}
        </div>
      </div>

      <hr className="my-4" />

      <h3 className="mb-3 text-base font-semibold">Profilo tabella utenti</h3>

      <div className="grid gap-2 text-sm">
        <div>
          <span className="font-medium">Nome:</span> {profilo?.name || "-"}
        </div>
        <div>
          <span className="font-medium">Cognome:</span> {profilo?.surname || "-"}
        </div>
        <div>
          <span className="font-medium">Telefono:</span> {profilo?.phone || "-"}
        </div>
        <div>
          <span className="font-medium">Ruolo:</span> {profilo?.role || "-"}
        </div>
      </div>
    </div>
  );
}