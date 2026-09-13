// ═══════════════════════════════════════════════════════════════
//  app_main.js — App(), Sidebar, routing
// ═══════════════════════════════════════════════════════════════

function App() {
  const {
    usuario,
    carregando
  } = useUsuarioLogado();
  if (carregando) {
    return /*#__PURE__*/React.createElement("div", {
      className: "tela-central"
    }, /*#__PURE__*/React.createElement("p", null, "Carregando..."));
  }
  if (!usuario) {
    return /*#__PURE__*/React.createElement(TelaLogin, null);
  }
  const podeAcessarAdmin = usuario.role === "psi" || usuario.role === "secretaria";
  if (!podeAcessarAdmin) {
    return /*#__PURE__*/React.createElement("div", {
      className: "tela-central"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cartao-login"
    }, /*#__PURE__*/React.createElement("h1", null, "Acesso n\xE3o permitido"), /*#__PURE__*/React.createElement("p", null, "Esta \xE1rea \xE9 exclusiva da equipe da cl\xEDnica."), /*#__PURE__*/React.createElement("button", {
      className: "botao-secundario",
      onClick: logout
    }, "Sair")));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "layout-admin"
  }, /*#__PURE__*/React.createElement(Sidebar, {
    usuario: usuario
  }), /*#__PURE__*/React.createElement("main", {
    className: "area-principal"
  }, /*#__PURE__*/React.createElement(TelaPacientes, {
    usuario: usuario
  })));
}
function Sidebar({
  usuario
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "barra-lateral"
  }, /*#__PURE__*/React.createElement("div", {
    className: "marca-barra-lateral"
  }, "PsicoWorking"), /*#__PURE__*/React.createElement("nav", null, /*#__PURE__*/React.createElement("a", {
    className: "item-menu item-menu-ativo",
    href: "#"
  }, "Pacientes")), /*#__PURE__*/React.createElement("div", {
    className: "rodape-barra-lateral"
  }, /*#__PURE__*/React.createElement("p", {
    className: "email-usuario"
  }, usuario.email), /*#__PURE__*/React.createElement("button", {
    className: "botao-sair",
    onClick: logout
  }, "Sair")));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));