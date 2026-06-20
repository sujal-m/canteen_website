function PlaceholderPage({ title }) {
  return (
    <main className="page narrow">
      <div className="surface center-copy">
        <p className="eyebrow">Protected</p>
        <h1>{title}</h1>
        <p className="muted">This route is protected for Phase 2. Feature implementation is reserved for a later module.</p>
      </div>
    </main>
  )
}

export default PlaceholderPage

