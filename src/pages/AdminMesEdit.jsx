import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import BackButton from "../components/BackButton";


export default function AdminMesEdit() {
  const { transporteId, mesId } = useParams();

  const [monthLabel, setMonthLabel] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [generalObservation, setGeneralObservation] = useState("");
  
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const diasBase = [
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
    "domingo"
  ];

  const [days, setDays] = useState({});

  useEffect(() => {
    iniciarDias();
    load();
  }, []);

  function iniciarDias() {
    const base = {};
    diasBase.forEach((d) => {
      base[d] = { ida: "", volta: "", observation: "" };
    });
    setDays(base);
  }

  async function load() {
    //setMonthLabel(data.monthLabel || "");
    //setMonth(data.month || new Date().getMonth() + 1);
    //setYear(data.year || new Date().getFullYear());

    const ref = doc(
      db,
      "transportes",
      transporteId,
      "meses",
      mesId
    );

    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      setMonthLabel(data.monthLabel || "");
      setTicketPrice(data.ticketPrice || "");
      setGeneralObservation(data.generalObservation || "");

      if (data.days) {
        const carregado = {};
        diasBase.forEach((d) => {
          carregado[d] = {
            ida: data.days?.[d]?.trips?.ida?.join(", ") || "",
            volta: data.days?.[d]?.trips?.volta?.join(", ") || "",
            observation: data.days?.[d]?.observation || ""
          };
        });
        setDays(carregado);
      }
    }
  }

  function handleChange(day, field, value) {
    setDays({
      ...days,
      [day]: { ...days[day], [field]: value }
    });
  }

  async function salvar() {
    const formattedDays = {};

    diasBase.forEach((d) => {
      formattedDays[d] = {
        observation: days[d].observation,
        trips: {
          ida: days[d].ida
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean),
          volta: days[d].volta
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean)
        }
      };
    });

    await setDoc(
      doc(db, "transportes", transporteId, "meses", mesId),
        {
            month,
            year,
            periodo: `${year}-${String(month).padStart(2, "0")}`,
            ticketPrice: Number(ticketPrice),
            generalObservation,
            ativo: true,
            days: formattedDays
        }
    );

    alert("Mês salvo com sucesso!");
  }

  return (
    <div className="container mt-4">
      <h3>Edição de Mês</h3>
       
        <BackButton 
        to={`/admin/${transporteId}`} 
        label="Voltar para Meses" 
        />
      <div className="row mb-2">
        <div className="col-6">
            <select
            className="form-select"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            >
            <option value={1}>Janeiro</option>
            <option value={2}>Fevereiro</option>
            <option value={3}>Março</option>
            <option value={4}>Abril</option>
            <option value={5}>Maio</option>
            <option value={6}>Junho</option>
            <option value={7}>Julho</option>
            <option value={8}>Agosto</option>
            <option value={9}>Setembro</option>
            <option value={10}>Outubro</option>
            <option value={11}>Novembro</option>
            <option value={12}>Dezembro</option>
            </select>
        </div>

        <div className="col-6">
            <input
            type="number"
            className="form-control"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            />
        </div>
        </div>


      <input
        className="form-control mb-2"
        type="number"
        placeholder="Valor da Passagem"
        value={ticketPrice}
        onChange={(e) => setTicketPrice(e.target.value)}
      />

      <textarea
        className="form-control mb-3"
        placeholder="Observação Geral"
        value={generalObservation}
        onChange={(e) => setGeneralObservation(e.target.value)}
      />

      {Object.keys(days).map((d) => (
        <div key={d} className="card p-3 mb-3">
          <h6 className="text-capitalize">{d}</h6>

          <input
            className="form-control mb-2"
            placeholder="Ida (07:00, 11:30)"
            value={days[d]?.ida || ""}
            onChange={(e) =>
              handleChange(d, "ida", e.target.value)
            }
          />

          <input
            className="form-control mb-2"
            placeholder="Volta (06:00, 16:00)"
            value={days[d]?.volta || ""}
            onChange={(e) =>
              handleChange(d, "volta", e.target.value)
            }
          />

          <input
            className="form-control"
            placeholder="Observação do dia"
            value={days[d]?.observation || ""}
            onChange={(e) =>
              handleChange(d, "observation", e.target.value)
            }
          />
        </div>
      ))}

      <button onClick={salvar} className="btn btn-success w-100">
        Salvar
      </button>
    </div>
  );
}
