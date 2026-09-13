// ═══════════════════════════════════════════════════════════════
//  app_main.js — App(), Sidebar, routing
// ═══════════════════════════════════════════════════════════════

function App() {
  const { usuario, carregando } = useUsuarioLogado();

  if (carregando) {
    return <div className="tela-central"><p>Carregando...</p></div>;
  }

  if (!usuario) {
    return <TelaLogin />;
  }

  const podeAcessarAdmin = usuario.role === "psi" || usuario.role === "secretaria";
  if (!podeAcessarAdmin) {
    return (
      <div className="tela-central">
        <div className="cartao-login">
          <h1>Acesso não permitido</h1>
          <p>Esta área é exclusiva da equipe da clínica.</p>
          <button className="botao-secundario" onClick={logout}>Sair</button>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-admin">
      <Sidebar usuario={usuario} />
      <main className="area-principal">
        <TelaPacientes usuario={usuario} />
      </main>
    </div>
  );
}

function Sidebar({ usuario }) {
  return (
    <aside className="barra-lateral">
      <div className="marca-barra-lateral">PsicoWorking</div>
      <nav>
        <a className="item-menu item-menu-ativo" href="#">Pacientes</a>
      </nav>
      <div className="rodape-barra-lateral">
        <p className="email-usuario">{usuario.email}</p>
        <button className="botao-sair" onClick={logout}>Sair</button>
      </div>
    </aside>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
