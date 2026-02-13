import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

const diasSemana = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado"
];
import BannerAd from "../components/BannerAd";
import BannerAdBottom from "../components/BannerAdBottom";

export default function Home() {
  const now = new Date();

  const [transportes, setTransportes] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState(
    diasSemana[now.getDay()]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  async function loadData() {
    try {
      setLoading(true);

      const transportesRef = collection(db, "transportes");
      const q = query(transportesRef, where("ativo", "==", true));
      const snap = await getDocs(q);

      const lista = [];

      for (const docTransporte of snap.docs) {
        const mesesRef = collection(
          db,
          "transportes",
          docTransporte.id,
          "meses"
        );

        const mesesSnap = await getDocs(mesesRef);

        mesesSnap.forEach((mesDoc) => {
          const data = mesDoc.data();

          if (
            data.ativo &&
            data.month === selectedMonth &&
            data.year === selectedYear
          ) {
            lista.push({
              id: docTransporte.id,
              nome: docTransporte.data().nome,
              ...data
            });
          }
        });
      }

      setTransportes(lista);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
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
      <h2 className="mb-4 text-center">
        Transporte Restinga ↔ Franca
      </h2>
      <BannerAd position="Topo" />

      {/* MÊS E ANO */}
      <div className="d-flex gap-2 mb-3 align-items-center flex-wrap">
        <select
          className="form-select"
          style={{ maxWidth: "180px" }}
          value={selectedMonth}
          onChange={(e) =>
            setSelectedMonth(Number(e.target.value))
          }
        >
          {[
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
          ].map((mes, index) => (
            <option key={index + 1} value={index + 1}>
              {mes}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ maxWidth: "120px" }}
          value={selectedYear}
          onChange={(e) =>
            setSelectedYear(Number(e.target.value))
          }
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

        <button
          className="btn btn-outline-primary"
          onClick={voltarHoje}
        >
          Hoje
        </button>
      </div>

      {/* DIAS DA SEMANA */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {diasSemana.map((dia) => (
          <button
            key={dia}
            className={`btn btn-sm ${
              selectedDay === dia
                ? "btn-primary"
                : "btn-outline-secondary"
            }`}
            onClick={() => setSelectedDay(dia)}
          >
            {dia.substring(0, 3)}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center">
          Carregando...
        </div>
      )}

      {/* SEM DADOS */}
      {!loading && transportes.length === 0 && (
        <div className="alert alert-warning">
          Nenhum horário cadastrado para este período.
        </div>
      )}

      {/* LISTAGEM */}
      {!loading &&
        transportes.map((t) => (
          <div
            key={t.id}
            className="card mb-4 p-3 shadow-sm"
          >
            <h5>{t.nome}</h5>

           <div className="alert alert-info">
  {t.generalObservation}

  {Number(t.ticketPrice) > 0 && (
    <>
      <br />
      <strong>
        Valor: R$ {Number(t.ticketPrice).toFixed(2)}
      </strong>
    </>
  )}
  
</div>

            <div className="mb-2">
              <strong>Ida:</strong>{" "}
              {t.days?.[selectedDay]?.trips?.ida?.length
                ? t.days[selectedDay].trips.ida.join(
                    ", "
                  )
                : "—"}
            </div>

            <div>
              <strong>Volta:</strong>{" "}
              {t.days?.[selectedDay]?.trips?.volta?.length
                ? t.days[selectedDay].trips.volta.join(
                    ", "
                  )
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
<BannerAdBottom position="Rodapé" />
<div className="text-center text-muted small mb-4">
  <p>
    Sistema desenvolvido por <strong>Joel Nascimento</strong><br />
    WhatsApp: <a href="https://wa.me/5516992467589" target="_blank" rel="noreferrer">
      (16) 99246-7589
    </a>
  </p>

  <p>
    ⚠️ Os horários e valores podem sofrer alterações sem aviso prévio.
    Sempre confirme com o motorista ou responsáveis pelo transporte.
    Este sistema foi desenvolvido apenas como facilitador
    para a população restinguense.
  </p>
</div>

    </div>
  );
}
