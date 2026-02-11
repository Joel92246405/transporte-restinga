import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminTransportes() {
  const [transportes, setTransportes] = useState([]);
  const [nomeNovo, setNomeNovo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const snap = await getDocs(collection(db, "transportes"));
    const lista = [];
    snap.forEach(d => lista.push({ id: d.id, ...d.data() }));
    setTransportes(lista);
  }

  async function toggleAtivo(id, atual) {
    await updateDoc(doc(db, "transportes", id), {
      ativo: !atual
    });
    load();
  }

  async function criarNovo() {
    if (!nomeNovo.trim()) {
      alert("Digite o nome do transporte");
      return;
    }

    await addDoc(collection(db, "transportes"), {
      nome: nomeNovo,
      ativo: true,
      criadoEm: new Date()
    });

    setNomeNovo("");
    load();

    // fecha modal manualmente
    const modal = document.getElementById("fecharModal");
    modal.click();
  }

  return (
    <div className="container mt-4">
      <h2>Transportes</h2>

      <button
        className="btn btn-primary mb-3"
        data-bs-toggle="modal"
        data-bs-target="#modalNovo"
      >
        + Novo Transporte
      </button>

      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {transportes.map(t => (
            <tr key={t.id}>
              <td>{t.nome}</td>
              <td>
                <span className={`badge ${t.ativo ? "bg-success" : "bg-danger"}`}>
                  {t.ativo ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => toggleAtivo(t.id, t.ativo)}
                >
                  Ativar/Desativar
                </button>

                <button
                  className="btn btn-sm btn-info"
                  onClick={() => navigate(`/admin/${t.id}`)}
                >
                  Gerenciar Meses
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      <div
        className="modal fade"
        id="modalNovo"
        tabIndex="-1"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Novo Transporte</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                id="fecharModal"
              ></button>
            </div>

            <div className="modal-body">
              <input
                className="form-control"
                placeholder="Nome do Transporte"
                value={nomeNovo}
                onChange={(e) => setNomeNovo(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>

              <button
                className="btn btn-success"
                onClick={criarNovo}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
