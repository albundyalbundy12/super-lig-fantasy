export default function HomePage() {
  return (
    <>
      <h1>Süper Lig Fantasy Manager</h1>
      <p className="subtitle">
        Project scaffold (Task 1). The data chain, scoring engine and full UI
        are built in later tasks.
      </p>

      <div className="card">
        <span className="tag">Status</span>
        <p>
          This is the initial Next.js + TypeScript structure. Use the sidebar to
          open the placeholder pages: Dashboard, Squad, Lineup, Transfer Market,
          Points, Table, and the Admin Sync page.
        </p>
      </div>

      <div className="card">
        <span className="tag">Next steps</span>
        <p>
          Task 2 adds the database schema, Task 3 implements the server-only
          Sportmonks client, and Task 4+ build sync and scoring. No real data is
          wired up yet.
        </p>
      </div>
    </>
  );
}
