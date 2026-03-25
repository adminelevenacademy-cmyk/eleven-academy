// Netlify Function: Búsqueda en tiempo real de contactos
// Busca academias, institutos, torneos, etc. por país, región y tipo

exports.handler = async (event) => {
  try {
    const { country, region, type, query } = event.queryStringParameters || {};

    if (!country || !type) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Parámetros requeridos: country, type",
          example: "?country=Espana&region=Catalunya&type=Academia"
        })
      };
    }

    // Construir query de búsqueda
    const searchQuery = buildSearchQuery(country, region, type, query);

    // Buscar en múltiples fuentes
    const results = await Promise.all([
      searchOverpassAPI(country, region, type),
      searchWikipedia(country, type),
      searchDuckDuckGo(searchQuery)
    ]);

    // Combinar y filtrar resultados
    const combinedResults = combineResults(results, type);

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
        results: combinedResults
      })
    };

  } catch (error) {
    console.error("Error en búsqueda:", error);
    return {
      statusCode: 500,
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
function buildSearchQuery(country, region, type, customQuery) {
  if (customQuery) return customQuery;

  const typeMap = {
    "Academia": "football academy",
    "Instituto": "football institute school",
    "Colegio": "school sports football",
    "Torneo": "football tournament championship",
    "Federacion": "football federation association",
    "Club Juvenil": "youth football club",
    "Escuela Internacional": "international school football",
    "Centro de Formacion": "training center football",
    "Agente": "football agent scout",
    "Otro": "football"
  };

  const searchType = typeMap[type] || type;
  const locationPart = region ? `${region} ${country}` : country;

  return `${searchType} ${locationPart} contact email`;
}

/**
 * Buscar en Overpass API (OpenStreetMap) - GRATUITO
 */
async function searchOverpassAPI(country, region, type) {
  try {
    // Mapeo de tipos a tags de OpenStreetMap
    const osmTags = {
      "Academia": "leisure=sports_centre",
      "Instituto": "amenity=school",
      "Colegio": "amenity=school",
      "Club Juvenil": "leisure=pitch OR leisure=sports_centre",
      "Centro de Formacion": "leisure=sports_centre",
      "Escuela Internacional": "amenity=school",
      "Torneo": "leisure=sports_centre"
    };

    const tag = osmTags[type] || "leisure=sports_centre";

    // Query simplificada (en producción necesitarías las coordenadas reales)
    const query = `[bbox:41.0,1.0,43.0,4.0];(node["name"]["sport"~"football|soccer"];way["leisure"="pitch"]["sport"~"football|soccer"];);out center 100;`;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) throw new Error("Overpass API error");

    const data = await response.json();

    return data.elements?.map(el => ({
      name: el.tags?.name || "Sin nombre",
      type: type,
      source: "OpenStreetMap",
      location: `${region || country}`,
      lat: el.lat || el.center?.lat,
      lon: el.lon || el.center?.lon,
      website: el.tags?.website || null,
      phone: el.tags?.phone || null
    })) || [];

  } catch (error) {
    console.log("Overpass API error (continuando):", error.message);
    return [];
  }
}

/**
 * Buscar en Wikipedia - GRATUITO
 */
async function searchWikipedia(country, type) {
  try {
    const wikiQueries = {
      "Federacion": `Football Federation of ${country}`,
      "Academia": `Football academy ${country}`,
      "Instituto": `Football institute ${country}`
    };

    const query = wikiQueries[type];
    if (!query) return [];

    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?` +
      `action=query&format=json&srsearch=${encodeURIComponent(query)}&list=search`,
      { headers: { "Accept": "application/json" } }
    );

    const data = await response.json();

    return data.query?.search?.map(result => ({
      name: result.title,
      type: type,
      source: "Wikipedia",
      location: country,
      description: result.snippet.replace(/<[^>]*>/g, "").substring(0, 100),
      website: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}`
    })) || [];

  } catch (error) {
    console.log("Wikipedia error (continuando):", error.message);
    return [];
  }
}

/**
 * Buscar en DuckDuckGo API (sin API key) - GRATUITO
 */
async function searchDuckDuckGo(query) {
  try {
    // DuckDuckGo tiene endpoint JSON que no requiere API key
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    const data = await response.json();

    // Extraer resultados relacionados
    return (data.RelatedTopics || [])
      .slice(0, 10)
      .map(result => ({
        name: result.Text?.split(" - ")[0] || result.Result || "",
        type: "Búsqueda",
        source: "DuckDuckGo",
        description: result.Text || "",
        website: result.FirstURL || null
      }))
      .filter(r => r.name);

  } catch (error) {
    console.log("DuckDuckGo error (continuando):", error.message);
    return [];
  }
}

/**
 * Combinar resultados de múltiples fuentes
 */
function combineResults(results, type) {
  const combined = [];
  const seen = new Set();

  // Aplanasr array de resultados
  const allResults = results.flat();

  for (const result of allResults) {
    const key = `${result.name}${result.location}`.toLowerCase();

    if (!seen.has(key) && result.name) {
      seen.add(key);
      combined.push({
        ...result,
        type: type,
        added_at: new Date().toISOString()
      });
    }
  }

  // Limitar a 50 resultados
  return combined.slice(0, 50);
}
