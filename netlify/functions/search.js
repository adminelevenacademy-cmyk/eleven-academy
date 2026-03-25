// Netlify Function: Búsqueda en tiempo real de contactos
// Usa solo APIs JSON públicas gratuitas - SIN dependencias
// APIs: Wikipedia, DuckDuckGo, Wikidata

exports.handler = async (event) => {
  try {
    const { country, region, type } = event.queryStringParameters || {};

    if (!country || !type) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Parámetros requeridos: country, type",
          example: "?country=Espana&region=Catalunya&type=Academia"
        })
      };
    }

    // Construir query de búsqueda automática
    const searchQuery = buildSearchQuery(country, region, type);

    // Buscar en múltiples fuentes (sin dependencias)
    const wikiResults = await searchWikipedia(country, type);
    const duckResults = await searchDuckDuckGo(searchQuery);
    const wikidataResults = await searchWikidata(country, type);

    // Combinar resultados
    const allResults = [...wikiResults, ...duckResults, ...wikidataResults];
    const combinedResults = deduplicateResults(allResults, type);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        query: searchQuery,
        country,
        region,
        type,
        resultsCount: combinedResults.length,
        results: combinedResults.slice(0, 50),
        sources: ["Wikipedia", "Wikidata", "DuckDuckGo"]
      })
    };

  } catch (error) {
    console.error("Error en búsqueda:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Error en la búsqueda",
        message: error.message
      })
    };
  }
};

/**
 * Construir query de búsqueda automática
 */
function buildSearchQuery(country, region, type) {
  const typeMap = {
    "Academia": "football academy",
    "Instituto": "football school institute",
    "Colegio": "school sports",
    "Torneo": "football tournament",
    "Federacion": "football federation",
    "Club Juvenil": "youth football club",
    "Escuela Internacional": "international school",
    "Centro de Formacion": "training center football",
    "Agente": "football agent",
    "Otro": "football organization"
  };

  const searchType = typeMap[type] || type;
  const locationPart = region ? `${region} ${country}` : country;
  return `${searchType} ${locationPart}`;
}

/**
 * Búsqueda en Wikipedia API - GRATUITO
 */
async function searchWikipedia(country, type) {
  try {
    const typeMap = {
      "Federacion": "Football Federation",
      "Academia": "Football academy",
      "Instituto": "Football institute",
      "Torneo": "Football tournament"
    };

    const typeQuery = typeMap[type];
    if (!typeQuery) return [];

    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?` +
      `action=query&format=json&srsearch=${encodeURIComponent(typeQuery + " " + country)}&list=search&srlimit=20`,
      {
        method: "GET",
        headers: { "Accept": "application/json", "User-Agent": "ElevenAcademy/1.0" }
      }
    );

    if (!response.ok) return [];

    const data = await response.json();

    return (data.query?.search || []).map(result => ({
      name: result.title.replace(/_/g, " "),
      type: type,
      source: "Wikipedia",
      location: country,
      description: result.snippet.replace(/<[^>]*>/g, "").substring(0, 100),
      website: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}`
    }));

  } catch (error) {
    console.log("Wikipedia error:", error.message);
    return [];
  }
}

/**
 * Búsqueda en Wikidata API - GRATUITO
 */
async function searchWikidata(country, type) {
  try {
    const typeMap = {
      "Federacion": "Q484826",  // Federación deportiva
      "Academia": "Q322329",    // Escuela
      "Torneo": "Q17008911",    // Competición
      "Colegio": "Q322329"      // Escuela
    };

    const typeQid = typeMap[type];
    if (!typeQid) return [];

    // SPARQL query simplificada
    const sparqlQuery = `
      SELECT ?item ?itemLabel ?countryLabel WHERE {
        ?item wdt:P31 wd:${typeQid}.
        ?item wdt:P17 wd:Q29.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
      }
      LIMIT 10
    `;

    const response = await fetch(
      `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`,
      { headers: { "User-Agent": "ElevenAcademy/1.0" } }
    );

    if (!response.ok) return [];

    const data = await response.json();

    return (data.results?.bindings || []).map(binding => ({
      name: binding.itemLabel?.value || "Sin nombre",
      type: type,
      source: "Wikidata",
      location: country,
      website: binding.item?.value || null
    }));

  } catch (error) {
    console.log("Wikidata error:", error.message);
    return [];
  }
}

/**
 * Búsqueda en DuckDuckGo API - GRATUITO
 */
async function searchDuckDuckGo(query) {
  try {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`,
      {
        method: "GET",
        headers: { "User-Agent": "ElevenAcademy/1.0" }
      }
    );

    if (!response.ok) return [];

    const data = await response.json();

    // Procesar resultados
    const results = [];

    // Temas relacionados
    if (data.RelatedTopics) {
      data.RelatedTopics.slice(0, 5).forEach(topic => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            name: topic.Text.split(" - ")[0] || "Resultado",
            type: "Web Search",
            source: "DuckDuckGo",
            description: topic.Text.substring(0, 100),
            website: topic.FirstURL
          });
        }
      });
    }

    return results;

  } catch (error) {
    console.log("DuckDuckGo error:", error.message);
    return [];
  }
}

/**
 * Deduplicar resultados
 */
function deduplicateResults(results, type) {
  const seen = new Set();
  const deduplicated = [];

  for (const result of results) {
    const key = `${result.name}${result.source}`.toLowerCase();

    if (!seen.has(key) && result.name && result.name.length > 2) {
      seen.add(key);
      deduplicated.push({
        name: result.name,
        type: type,
        source: result.source,
        location: result.location || "Internacional",
        description: result.description || "Resultado de búsqueda",
        website: result.website || null
      });
    }
  }

  return deduplicated;
}
