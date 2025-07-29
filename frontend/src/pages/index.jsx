import Navbar from "../components/Navbar";
import api from "../services/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [anuncios, setAnuncios] = useState([]);
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const [filtroPreco, setFiltroPreco] = useState("");

  const [marcas, setMarcas] = useState([]);
  const [anos, setAnos] = useState([]);

  useEffect(() => {
    api.get("/anuncios").then((res) => {
      setAnuncios(res.data);

      // Pegar marcas e anos únicos para os filtros
      const marcasUnicas = [...new Set(res.data.map((a) => a.marca))];
      const anosUnicos = [...new Set(res.data.map((a) => a.ano))].sort(
        (a, b) => b - a
      );
      setMarcas(marcasUnicas);
      setAnos(anosUnicos);
    });
  }, []);

  // Aplicar os filtros
  const anunciosFiltrados = anuncios.filter((a) => {
    return (
      (!filtroMarca || a.marca === filtroMarca) &&
      (!filtroAno || a.ano === parseInt(filtroAno)) &&
      (!filtroPreco ||
        (filtroPreco === "1" && a.preco < 10000) ||
        (filtroPreco === "2" && a.preco >= 10000 && a.preco <= 20000) ||
        (filtroPreco === "3" && a.preco > 20000))
    );
  });

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 text-white">
        <h1 className="text-3xl font-bold mb-4">Veículos Disponíveis</h1>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <select
            className="p-2 bg-neutral-800 rounded text-white"
            value={filtroMarca}
            onChange={(e) => setFiltroMarca(e.target.value)}
          >
            <option value="">Todas as marcas</option>
            {marcas.map((marca) => (
              <option key={marca} value={marca}>
                {marca}
              </option>
            ))}
          </select>

          <select
            className="p-2 bg-neutral-800 rounded text-white"
            value={filtroAno}
            onChange={(e) => setFiltroAno(e.target.value)}
          >
            <option value="">Todos os anos</option>
            {anos.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>

          <select
            className="p-2 bg-neutral-800 rounded text-white"
            value={filtroPreco}
            onChange={(e) => setFiltroPreco(e.target.value)}
          >
            <option value="">Todos os preços</option>
            <option value="1">Até R$ 10.000</option>
            <option value="2">R$ 10.000 a R$ 20.000</option>
            <option value="3">Acima de R$ 20.000</option>
          </select>
        </div>

        {/* Cards dos anúncios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {anunciosFiltrados.map((a) => (
            <div
              key={a._id}
              className="bg-neutral-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {a.fotos?.[0] && (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL.replace('/api','')}${a.fotos[0]}`}
                  alt={a.modelo}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold">
                  {a.marca} {a.modelo}
                </h2>
                <p className="text-brand-400 mt-1 text-lg font-bold">
                  {a.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
                <p className="text-sm text-neutral-400 mt-1">
                  {a.ano} • {a.km} KM
                </p>

                {jwt.decode(localStorage.getItem("token"))?.role === "admin" ? (
                  <div className="mt-4 flex justify-between text-sm">
                    <button
                      className="text-white-400 hover:text-yellow-200"
                      onClick={() => router.push(`/anuncio/${a._id}/editar`)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-white-400 hover:text-red-200"
                      onClick={async () => {
                        if (confirm("Tem certeza que deseja excluir?")) {
                          await api.delete(`/anuncios/${a._id}`);
                          setAnuncios(
                            anuncios.filter((item) => item._id !== a._id)
                          );
                        }
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                ) : null}

                <div className="mt-4 flex justify-between text-sm">
                  <Link
                    href={`/anuncio/${a._id}`}
                    className="text-white-400 hover:text-blue-200"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {anunciosFiltrados.length === 0 && (
          <p className="text-neutral-400 mt-10">
            Nenhum veículo encontrado com os filtros aplicados.
          </p>
        )}
      </div>
    </>
  );
}
