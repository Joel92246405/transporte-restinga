import { useEffect, useState, useMemo } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

export default function AdminAnalytics() {
  const [dados, setDados] = useState([]);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const [expandidoDia, setExpandidoDia] = useState(null);
  const [expandidoUsuario, setExpandidoUsuario] = useState(null);

  const [usuariosDia, setUsuariosDia] = useState({});
  const [horasUsuario, setHorasUsuario] = useState({});
  const [dadosHora, setDadosHora] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (dados.length > 0) {
      carregarGraficoHoras();
    }
  }, [inicio, fim, dados]);

  async function carregarDados() {
    const q = query(
      collection(db, "analytics"),
      orderBy("__name__", "asc")
    );

    const snap = await getDocs(q);

    const lista = snap.docs.map((doc) => ({
      date: doc.id,
      total: doc.data().totalAccess || 0
    }));

    setDados(lista);
  }

  async function carregarUsuarios(dia) {
    const snap = await getDocs(
      collection(db, "analytics", dia, "users")
    );

    const lista = snap.docs.map((doc) => ({
      uid: doc.id,
      count: doc.data().count || 0
    }));

    setUsuariosDia((prev) => ({ ...prev, [dia]: lista }));
  }

  async function carregarHoras(dia, uid) {
    const snap = await getDocs(
      collection(db, "analytics", dia, "users", uid, "accesses")
    );

    const mapa = {};

    snap.forEach((doc) => {
      const h = doc.data().hour.toString().padStart(2, "0");
      mapa[h] = (mapa[h] || 0) + 1;
    });

    const lista = Object.keys(mapa)
      .sort()
      .map((h) => ({
        hora: h,
        total: mapa[h]
      }));

    setHorasUsuario((prev) => ({
      ...prev,
      [`${dia}_${uid}`]: lista
    }));
  }

  async function carregarGraficoHoras() {
    const mapa = {};

    const filtrados = dadosFiltrados();

    for (const dia of filtrados) {
      const snapUsers = await getDocs(
        collection(db, "analytics", dia.date, "users")
      );

      for (const userDoc of snapUsers.docs) {
        const snapAccess = await getDocs(
          collection(
            db,
            "analytics",
            dia.date,
            "users",
            userDoc.id,
            "accesses"
          )
        );

        snapAccess.forEach((doc) => {
          const h = doc.data().hour
            .toString()
            .padStart(2, "0");

          mapa[h] = (mapa[h] || 0) + 1;
        });
      }
    }

    const lista = Object.keys(mapa)
      .sort()
      .map((h) => ({
        hora: h,
        total: mapa[h]
      }));

    setDadosHora(lista);
  }

  function dadosFiltrados() {
    if (!inicio || !fim) return dados;
    return dados.filter(
      (d) => d.date >= inicio && d.date <= fim
    );
  }

  const filtrados = useMemo(
    () => dadosFiltrados(),
    [dados, inicio, fim]
  );

  const totalPeriodo = filtrados.reduce(
    (acc, d) => acc + d.total,
    0
  );

  const mediaDiaria =
    filtrados.length > 0
      ? (totalPeriodo / filtrados.length).toFixed(2)
      : 0;

  const maiorDia =
    filtrados.length > 0
      ? filtrados.reduce((a, b) =>
          a.total > b.total ? a : b
        )
      : null;

  return (
    <div className="container-fluid mt-4">
      <h3>Analytics de Acessos</h3>

      {/* FILTRO */}
      <div className="row mb-4">
        <div className="col-md-3">
          <label>Data Início</label>
          <input
            type="date"
            className="form-control"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label>Data Fim</label>
          <input
            type="date"
            className="form-control"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
          />
        </div>
      </div>

      {/* CARDS */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card p-3">
            <strong>Total no Período</strong>
            <h4>{totalPeriodo}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3">
            <strong>Média Diária</strong>
            <h4>{mediaDiaria}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3">
            <strong>Maior Dia</strong>
            <h6>
              {maiorDia
                ? `${maiorDia.date} (${maiorDia.total})`
                : "-"}
            </h6>
          </div>
        </div>
      </div>

      {/* GRÁFICO POR DIA */}
      <div style={{ width: "100%", minHeight: 400 }}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filtrados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#0d6efd" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* GRÁFICO POR HORA */}
      <div style={{ width: "100%", height: 300, marginTop: 40 }}>
        <h5>Acessos por Hora</h5>
        <ResponsiveContainer>
          <BarChart data={dadosHora}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hora" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#198754" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* GRID ANALÍTICA */}
      <div className="mt-4">
        <h5>Lista Analítica</h5>

        <table className="table table-striped">
          <thead>
            <tr>
              <th>Data</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((d) => (
              <>
                <tr
                  key={d.date}
                  style={{ cursor: "pointer" }}
                  onClick={async () => {
                    if (expandidoDia === d.date) {
                      setExpandidoDia(null);
                    } else {
                      if (!usuariosDia[d.date]) {
                        await carregarUsuarios(d.date);
                      }
                      setExpandidoDia(d.date);
                    }
                  }}
                >
                  <td>{d.date}</td>
                  <td>{d.total}</td>
                </tr>

                {expandidoDia === d.date &&
                  usuariosDia[d.date] && (
                    <tr>
                      <td colSpan="2">
                        <table className="table table-sm table-bordered">
                          <thead>
                            <tr>
                              <th>Usuário</th>
                              <th>Acessos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usuariosDia[d.date].map((u) => {
                              const chave = `${d.date}_${u.uid}`;

                              return (
                                <>
                                  <tr
                                    key={u.uid}
                                    style={{
                                      cursor: "pointer",
                                      background: "#f8f9fa"
                                    }}
                                    onClick={async () => {
                                      if (
                                        expandidoUsuario === chave
                                      ) {
                                        setExpandidoUsuario(null);
                                      } else {
                                        if (!horasUsuario[chave]) {
                                          await carregarHoras(
                                            d.date,
                                            u.uid
                                          );
                                        }
                                        setExpandidoUsuario(chave);
                                      }
                                    }}
                                  >
                                    <td>{u.uid}</td>
                                    <td>{u.count}</td>
                                  </tr>

                                  {expandidoUsuario === chave &&
                                    horasUsuario[chave] && (
                                      <tr>
                                        <td colSpan="2">
                                          <table className="table table-sm">
                                            <thead>
                                              <tr>
                                                <th>Hora</th>
                                                <th>Total</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {horasUsuario[chave].map(
                                                (h) => (
                                                  <tr key={h.hora}>
                                                    <td>
                                                      {h.hora}:00
                                                    </td>
                                                    <td>
                                                      {h.total}
                                                    </td>
                                                  </tr>
                                                )
                                              )}
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    )}
                                </>
                              );
                            })}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
