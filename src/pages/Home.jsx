import { useEffect, useMemo, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  collectionGroup,
} from "firebase/firestore";

import BannerAd from "../components/BannerAd";
import BannerAdBottom from "../components/BannerAdBottom";


const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const mesesNome = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

export default function Home() {
  const now = useMemo(() => new Date(), []);
  const [transportes, setTransportes] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState(diasSemana[now.getDay()]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  async function testePermissao() {
  const q = query(collectionGroup(db, "meses"), limit(1));
  const snap = await getDocs(q);
  console.log("Teste meses ok. docs:", snap.size);
}

  async function loadData() {
    try {
      testePermissao();
      setLoading(true);

      // 1) Busca todos os "meses" do período (subcoleções "meses" de todos os transportes)
      const mesesQ = query(
        collectionGroup(db, "meses"),
        where("ativo", "==", true),
        where("month", "==", selectedMonth),
        where("year", "==", selectedYear)
      );

      const mesesSnap = await getDocs(mesesQ);

      if (mesesSnap.empty) {
        setTransportes([]);
        return;
      }

      // 2) Pega os IDs dos transportes (pai do documento "meses")
      const transporteIds = Array.from(
        new Set(
          mesesSnap.docs
            .map((d) => d.ref.parent.parent?.id)
            .filter(Boolean)
        )
      );

      // 3) Busca os transportes ativos (pra pegar "nome")
      // Firestore where(in) aceita até 10 por query; então faz chunk
      const chunks = chunkArray(transporteIds, 10);
      const transportesMap = new Map();

      for (const ids of chunks) {
        const tQ = query(
          collection(db, "transportes"),
          where("ativo", "==", true),
          where("__name__", "in", ids)
        );
        const tSnap = await getDocs(tQ);
        tSnap.forEach((docT) => {
          transportesMap.set(docT.id, docT.data());
        });
      }

      // 4) Monta lista final juntando nome + dados do mês
      const lista = mesesSnap.docs
        .map((mesDoc) => {
          const transporteId = mesDoc.ref.parent.parent?.id;
          if (!transporteId) return null;

          const tData = transportesMap.get(transporteId);
          if (!tData) return null; // não ativo ou não encontrado

          return {
            id: transporteId,
            nome: tData.nome,
            ...mesDoc.data(),
          };
        })
        .filter(Boolean);

      setTransportes(lista);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setTransportes([]);
    } finally {
      setLoading(false);
    }
  }

  function voltarHoje() {
    const hoje = new Date();
    setSelectedMonth(hoje.getMonth() + 1);
    setSelectedYear(hoje.getFullYear());
    setSelectedDay(diasSemana[hoje.getDay()]);
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Transporte Restinga ↔ Franca</h2>

      {/* Topo (imagem) */}
      <BannerAd />

      {/* Mês e ano */}
      <div className="d-flex gap-2 mb-3 align-items-center flex-wrap">
        <select
          className="form-select"
          style={{ maxWidth: "180px" }}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {mesesNome.map((mes, index) => (
            <option key={index + 1} value={index + 1}>
              {mes}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ maxWidth: "120px" }}
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const ano = now.getFullYear() - 2 + i;
            return (
              <option key={ano} value={ano}>
                {ano}
              </option>
            );
          })}
        </select>

        <button className="btn btn-outline-primary" onClick={voltarHoje}>
          Hoje
        </button>
      </div>

      {/* Dias */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {diasSemana.map((dia) => (
          <button
            key={dia}
            className={`btn btn-sm ${
              selectedDay === dia ? "btn-primary" : "btn-outline-secondary"
            }`}
            onClick={() => setSelectedDay(dia)}
          >
            {dia.substring(0, 3)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <div className="text-center">Carregando...</div>}

      {/* Sem dados */}
      {!loading && transportes.length === 0 && (
        <div className="alert alert-warning">
          Nenhum horário cadastrado para este período.
        </div>
      )}

      {/* Listagem */}
      {!loading &&
        transportes.map((t) => (
          <div key={t.id} className="card mb-4 p-3 shadow-sm">
            <h5>{t.nome}</h5>

            <div className="alert alert-info">
              {t.generalObservation}

              {Number(t.ticketPrice) > 0 && (
                <>
                  <br />
                  <strong>Valor: R$ {Number(t.ticketPrice).toFixed(2)}</strong>
                </>
              )}
            </div>

            <div className="mb-2">
              <strong>Ida:</strong>{" "}
              {t.days?.[selectedDay]?.trips?.ida?.length
                ? t.days[selectedDay].trips.ida.join(", ")
                : "—"}
            </div>

            <div>
              <strong>Volta:</strong>{" "}
              {t.days?.[selectedDay]?.trips?.volta?.length
                ? t.days[selectedDay].trips.volta.join(", ")
                : "—"}
            </div>

            {t.days?.[selectedDay]?.observation && (
              <div className="mt-2 text-muted">
                {t.days[selectedDay].observation}
              </div>
            )}
          </div>
        ))}

      <hr className="mt-5" />

      {/* Rodapé (AdSense) */}
      <BannerAdBottom />

      <div className="text-center text-muted small mb-4">
        <p>
          Sistema desenvolvido por <strong>Joel Nascimento</strong>
          <br />
          WhatsApp:{" "}
          <a href="https://wa.me/5516992467589" target="_blank" rel="noreferrer">
            (16) 99246-7589
          </a>
        </p>

        <p>
          ⚠️ Os horários e valores podem sofrer alterações sem aviso prévio.
          Sempre confirme com o motorista ou responsáveis pelo transporte.
          Este sistema foi desenvolvido apenas como facilitador para a população restinguense.
        </p>
      </div>
    </div>
  );
}

// Helpers
function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
