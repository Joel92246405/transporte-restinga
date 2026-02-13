import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import BackButton from "../components/BackButton";
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
  query,
  orderBy,
  where
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminMeses() {
  const { transporteId } = useParams();
  const navigate = useNavigate();
  const [meses, setMeses] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const q = query(
      collection(db, "transportes", transporteId, "meses"),
      orderBy("year", "desc"),
      orderBy("month", "desc")
    );

    const snap = await getDocs(q);

    const lista = [];
    snap.forEach((d) => lista.push({ id: d.id, ...d.data() }));

    setMeses(lista);
  }

  function getNomeMes(numero) {
    const nomes = [
      "",
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro"
    ];
    return nomes[numero] || "-";
  }

  async function toggleAtivo(id, atual) {
    await updateDoc(
      doc(db, "transportes", transporteId, "meses", id),
      { ativo: !atual }
    );
    load();
  }

  async function criarNovoMes() {
    const hoje = new Date();

    const novo = await addDoc(
      collection(db, "transportes", transporteId, "meses"),
      {
        month: hoje.getMonth() + 1,
        year: hoje.getFullYear(),
        periodo: `${hoje.getFullYear()}-${String(
          hoje.getMonth() + 1
        ).padStart(2, "0")}`,
        ativo: true,
        ticketPrice: 0,
        generalObservation: "",
        days: {}
      }
    );

    navigate(`/admin/${transporteId}/${novo.id}`);
  }

  async function replicarMes(mesOrigem) {
    const novoMes = prompt("Informe o mês (1-12)");
    const novoAno = prompt("Informe o ano (ex: 2026)");

    if (!novoMes || !novoAno) return;

    const mesNumero = Number(novoMes);
    const anoNumero = Number(novoAno);

    if (mesNumero < 1 || mesNumero > 12) {
      alert("Mês inválido.");
      return;
    }

    try {
      const q = query(
        collection(db, "transportes", transporteId, "meses"),
        where("month", "==", mesNumero),
        where("year", "==", anoNumero)
      );

      const existente = await getDocs(q);

      if (!existente.empty) {
        alert("Esse mês já existe.");
        return;
      }

      const origemRef = doc(
        db,
        "transportes",
        transporteId,
        "meses",
        mesOrigem.id
      );

      const origemSnap = await getDoc(origemRef);

      if (!origemSnap.exists()) {
        alert("Mês origem não encontrado.");
        return;
      }

      const dadosOrigem = origemSnap.data();

      await addDoc(
        collection(db, "transportes", transporteId, "meses"),
        {
          ...dadosOrigem,
          month: mesNumero,
          year: anoNumero,
          periodo: `${anoNumero}-${String(mesNumero).padStart(2, "0")}`,
          ativo: true
        }
      );

      alert("Mês replicado com sucesso!");
      load();

    } catch (error) {
      console.error(error);
      alert("Erro ao replicar mês.");
    }
  }

  async function excluirMes(mes) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir ${getNomeMes(mes.month)} ${mes.year} definitivamente?`
    );

    if (!confirmar) return;

    try {
      await deleteDoc(
        doc(db, "transportes", transporteId, "meses", mes.id)
      );

      alert("Mês excluído com sucesso!");
      load();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir mês.");
    }
  }

  return (
    <div className="container-fluid mt-4">
      <h3>Meses Cadastrados</h3>

      <BackButton
        to="/admin"
        label="Voltar para Transportes"
      />

      <button
        className="btn btn-primary mb-3"
        onClick={criarNovoMes}
      >
        + Novo Mês
      </button>

      {meses.length === 0 && (
        <div className="alert alert-warning">
          Nenhum mês cadastrado.
        </div>
      )}

      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Mês</th>
            <th>Ano</th>
            <th>Status</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {meses.map((m) => (
            <tr key={m.id}>
              <td>{getNomeMes(m.month)}</td>
              <td>{m.year}</td>

              <td>
                <span
                  className={`badge ${
                    m.ativo ? "bg-success" : "bg-danger"
                  }`}
                >
                  {m.ativo ? "Ativo" : "Inativo"}
                </span>
              </td>

              <td>
                R$ {Number(m.ticketPrice || 0).toFixed(2)}
              </td>

              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() =>
                    toggleAtivo(m.id, m.ativo)
                  }
                >
                  {m.ativo ? "Desativar" : "Ativar"}
                </button>

                <button
                  className="btn btn-sm btn-info me-2"
                  onClick={() =>
                    navigate(
                      `/admin/${transporteId}/${m.id}`
                    )
                  }
                >
                  Editar
                </button>

                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => replicarMes(m)}
                >
                  🔁 Replicar
                </button>

                {!m.ativo && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => excluirMes(m)}
                  >
                    🗑 Excluir
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
